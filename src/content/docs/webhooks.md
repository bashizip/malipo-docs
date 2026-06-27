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
| `payout.succeeded` | A payout completed successfully |
| `payout.failed` | A payout failed |

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

Verify webhook authenticity using HMAC-SHA256 signatures.

```typescript title="Node.js verification example"
const crypto = require("crypto");

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["x-malipo-signature"];
  if (!verifyWebhook(req.body, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(400).send("Invalid signature");
  }
  const event = JSON.parse(req.body);
  console.log(event.type);
  res.json({ received: true });
});
```

:::danger[Always verify signatures]
Never trust incoming webhooks without verifying the signature. This prevents attackers from spoofing events.
:::
