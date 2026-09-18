---
title: Webhooks
draft: false
description: Receive real-time notifications when events occur in your account.
---

Receive real-time notifications when events occur in your account.

Webhooks allow you to receive HTTP POST notifications whenever certain events happen in your Malipo account. Configure your endpoint URL in the dashboard to start receiving events.

## Webhook Events

| Event Type | Description |
|------------|-------------|
| `charge.succeeded` | A charge completed successfully |
| `charge.failed` | A charge failed |
| `charge.declined` | A charge was declined by the customer |
| `charge.expired` | A charge expired before completion |
| `charge.refunded` | A charge was refunded (full or partial) |
| `checkout.session.completed` | A checkout session completed |
| `settlement.available` | A settlement batch became available |
| `payout.pending` | A payout request reserved funds |
| `payout.processing` | A payout entered provider processing |
| `payout.succeeded` | A payout completed successfully |
| `payout.failed` | A payout failed |
| `payout.cancelled` | A payout was cancelled before dispatch |
| `payout.needs_review` | The provider result requires manual review |

## Webhook Payload

Every webhook event follows this standard envelope format:

```json
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "charge.succeeded",
  "created_at": "2025-01-15T10:30:00Z",
  "data": {
    "object": {
      "id": "ch_1234567890",
      "object": "charge",
      "amount": 1000,
      "currency": "CDF",
      "status": "succeeded"
    }
  }
}
```

## Signature Verification

Verify webhook authenticity using the `X-Webhook-Signature` and `X-Webhook-Timestamp` headers. The signature is HMAC-SHA256 over `${timestamp}.${rawPayload}` and timestamps older than five minutes are rejected by default.

```typescript title="Node.js verification example"
import express from "express";
import { Malipo } from "malipo-node";

const app = express();
const malipo = new Malipo({ apiKey: process.env.MALIPO_SECRET_KEY });

// Use express.raw() so the payload is not parsed before verification.
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.header("x-webhook-signature") ?? "";
  const timestamp = req.header("x-webhook-timestamp");
  const secret = process.env.MALIPO_WEBHOOK_SECRET ?? "";

  try {
    const event = malipo.webhooks.constructEvent(
      req.body.toString(),
      signature,
      secret,
      timestamp
    );

    console.log(event.type);
    res.sendStatus(200);
  } catch (err) {
    console.error(`Webhook Error: ${err instanceof Error ? err.message : "Invalid webhook"}`);
    res.sendStatus(400);
  }
});
```

:::danger[Always verify signatures]
Never trust incoming webhooks without verifying the signature. Keep the webhook secret on your server, preserve the raw request body, and return HTTP 400 when verification fails.
:::
