import { eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { webhookEvents } from '../db/schema'
import { paypalFetch } from './paypal'

/**
 * Calls PayPal's verify-webhook-signature endpoint to authenticate an incoming webhook.
 * https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post
 */
export async function verifyPaypalWebhook(opts: {
  webhookId: string
  headers: Record<string, string | undefined>
  rawBody: string
}): Promise<boolean> {
  const headers = opts.headers
  const transmissionId = headers['paypal-transmission-id']
  const transmissionTime = headers['paypal-transmission-time']
  const certUrl = headers['paypal-cert-url']
  const authAlgo = headers['paypal-auth-algo']
  const transmissionSig = headers['paypal-transmission-sig']

  if (
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !authAlgo ||
    !transmissionSig
  ) {
    return false
  }

  let webhookEventBody: unknown
  try {
    webhookEventBody = JSON.parse(opts.rawBody)
  } catch {
    return false
  }

  const verifyPayload = {
    auth_algo: authAlgo,
    cert_url: certUrl,
    transmission_id: transmissionId,
    transmission_sig: transmissionSig,
    transmission_time: transmissionTime,
    webhook_id: opts.webhookId,
    webhook_event: webhookEventBody,
  }

  try {
    const result = await paypalFetch<{ verification_status: string }>(
      '/v1/notifications/verify-webhook-signature',
      { method: 'POST', body: verifyPayload },
    )
    return result.verification_status === 'SUCCESS'
  } catch (err) {
    console.error('[webhook] verify-signature error:', err)
    return false
  }
}

/**
 * Inserts a webhook event row if not already present.
 * Returns true if the event is new, false if a duplicate (idempotency guard).
 */
export function recordWebhookEvent(opts: {
  id: string
  eventType: string
  resourceId?: string
  rawJson: string
}): boolean {
  const db = getDb()
  const existing = db
    .select({ id: webhookEvents.id })
    .from(webhookEvents)
    .where(eq(webhookEvents.id, opts.id))
    .get()
  if (existing) return false
  db.insert(webhookEvents)
    .values({
      id: opts.id,
      eventType: opts.eventType,
      resourceId: opts.resourceId ?? null,
      rawJson: opts.rawJson,
      receivedAt: new Date().toISOString(),
      processedAt: null,
      errorMessage: null,
    })
    .run()
  return true
}

export function markWebhookProcessed(id: string, errorMessage?: string): void {
  const db = getDb()
  db.update(webhookEvents)
    .set({
      processedAt: new Date().toISOString(),
      errorMessage: errorMessage ?? null,
    })
    .where(eq(webhookEvents.id, id))
    .run()
}
