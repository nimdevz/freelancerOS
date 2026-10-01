import { describe, it, expect } from 'vitest';
import worker from '../src/index';

describe('Serverless Hono Worker on Cloudflare', () => {
  const mockEnv = {
    TURSO_DATABASE_URL: 'file:data/freelanceros.db',
    TURSO_AUTH_TOKEN: 'mock-token',
  };

  it('responds to root health check', async () => {
    const req = new Request('http://localhost/', { method: 'GET' });
    const res = await worker.fetch(req, mockEnv as any, {} as any);
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.status).toBe('healthy');
    expect(data.runtime).toBe('Cloudflare Workers');
  });

  it('responds to /api/health with status ok', async () => {
    const req = new Request('http://localhost/api/health', { method: 'GET' });
    const res = await worker.fetch(req, mockEnv as any, {} as any);
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  it('applies CORS headers to all responses', async () => {
    const req = new Request('http://localhost/api/health', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://freelanceros.pages.dev',
        'Access-Control-Request-Method': 'GET',
      },
    });
    const res = await worker.fetch(req, mockEnv as any, {} as any);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('generates upload URLs for Cloudflare R2', async () => {
    const req = new Request('http://localhost/api/files/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'invoice-preview.pdf', mimeType: 'application/pdf' }),
    });
    const res = await worker.fetch(req, mockEnv as any, {} as any);
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.uploadUrl).toContain('/api/files/upload/');
    expect(data.publicUrl).toContain('/api/files/download/');
    expect(data.fileKey).toContain('invoice-preview.pdf');
  });
});
