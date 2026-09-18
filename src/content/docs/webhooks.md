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

Every delivery carries two headers:

| Header | Description |
|--------|-------------|
| `X-Webhook-Timestamp` | The timestamp used in the signed message, in ISO-8601 format |
| `X-Webhook-Signature` | Lowercase hex HMAC-SHA256 signature of the signed message |

The signed message is the timestamp, a single dot (`.`), then the exact raw request body:

```text
signed message = timestamp + "." + rawBody   (raw bytes, unmodified)
signature      = hex(HMAC-SHA256(secret, signed message))
```

Deliveries whose timestamp is more than five minutes away from your server's clock are rejected by default, so keep your server time in sync. Always verify against the raw, unparsed request body — reading the JSON and re-serialising it changes whitespace and key order, which changes the signature.

### The signing secret

Each endpoint has its own signing secret, shown in the dashboard. It is a 64-character lowercase hexadecimal string. Use it exactly as displayed: there is no `whsec_` prefix, and no surrounding quotes or trailing whitespace. A secret with any extra character will never produce a matching signature.

If your account has more than one active endpoint, each keeps its own secret. Verify a delivery with the secret of the endpoint whose URL received it.

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
