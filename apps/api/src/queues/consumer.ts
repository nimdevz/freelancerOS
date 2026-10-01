import { Env } from '../env';
import { getDb, schema } from '../db';

export interface BackgroundQueueMessage {
  type: 'email' | 'notification' | 'audit' | 'webhook';
  payload: any;
}

export async function handleQueue(
  batch: MessageBatch<BackgroundQueueMessage>,
  env: Env,
  ctx: ExecutionContext,
) {
  console.log(`[Queue Consumer] Processing batch of ${batch.messages.length} messages.`);
  const db = getDb(env);

  for (const message of batch.messages) {
    const { type, payload } = message.body;
    try {
      switch (type) {
        case 'notification':
          if (payload.organizationId && payload.title && payload.message) {
            await db.insert(schema.notifications).values({
              id: crypto.randomUUID(),
              organizationId: payload.organizationId,
              type: payload.notificationType || 'system',
              title: payload.title,
              message: payload.message,
              entityType: payload.entityType || null,
              entityId: payload.entityId || null,
              isRead: 0,
              createdAt: new Date().toISOString(),
            });
          }
          break;

        case 'audit':
          if (payload.organizationId && payload.action && payload.description) {
            await db.insert(schema.activityLogs).values({
              id: crypto.randomUUID(),
              organizationId: payload.organizationId,
              entityType: payload.entityType || 'system',
              entityId: payload.entityId || crypto.randomUUID(),
              action: payload.action,
              description: payload.description,
              createdAt: new Date().toISOString(),
            });
          }
          break;

        case 'email':
          console.log(`[Queue Consumer] Dispatching email to ${payload.to}: ${payload.subject}`);
          // Serverless email dispatch (e.g. Resend, MailChannels, Postmark, or Cloudflare Email Workers)
          break;

        default:
          console.log(`[Queue Consumer] Handled message of type: ${type}`);
      }

      message.ack();
    } catch (err) {
      console.error(`[Queue Consumer] Failed processing message ${message.id}:`, err);
      message.retry();
    }
  }
}
