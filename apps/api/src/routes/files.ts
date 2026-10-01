import { Hono } from 'hono';
import { Env, AppVariables } from '../env';

export const filesRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

filesRouter.post('/upload-url', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const fileName = body.fileName || 'file.bin';
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileKey = `${Date.now()}-${cleanName}`;

  return c.json({
    uploadUrl: `/api/files/upload/${fileKey}`,
    publicUrl: `/api/files/download/${fileKey}`,
    fileKey,
  });
});

filesRouter.on(['POST', 'PUT'], '/upload/:key', async (c) => {
  const key = c.req.param('key');
  const contentType = c.req.header('content-type') || 'application/octet-stream';

  if (c.env.R2_BUCKET) {
    const arrayBuffer = await c.req.arrayBuffer();
    await c.env.R2_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType,
      },
    });
    return c.json({
      url: `/api/files/download/${key}`,
      key,
      status: 'stored_in_r2',
    });
  }

  // Graceful fallback when R2 bucket binding is not configured in local mock mode
  return c.json({
    url: `/api/files/download/${key}`,
    key,
    status: 'mock_uploaded',
  });
});

filesRouter.get('/download/:key', async (c) => {
  const key = c.req.param('key');

  if (c.env.R2_BUCKET) {
    const object = await c.env.R2_BUCKET.get(key);
    if (!object) {
      return c.json({ message: 'File not found in R2' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body, {
      headers,
    });
  }

  return c.json({ message: 'R2 bucket not available in this environment' }, 404);
});
