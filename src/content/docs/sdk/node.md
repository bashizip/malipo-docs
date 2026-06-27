---
title: Node.js SDK
draft: false
description: Official Node.js and TypeScript integration guide for the Malipo Payment Gateway.
---

Official Node.js and TypeScript integration guide for the Malipo Payment Gateway.

## Installation

```bash
npm install malipo-node
```

## Quickstart

```typescript
import { Malipo } from "malipo-node";

const malipo = new Malipo({
  apiKey: process.env.MALIPO_SECRET_KEY
});

// Create a charge
const charge = await malipo.charges.create({
  amount: 10,
  currency: "USD",
  phone: "+243810000000",
  network: "VODACOM_MPESA",
  description: "Order #123"
}, {
  idempotencyKey: "unique_order_id_123"
});

// Retrieve status later
const transaction = await malipo.transactions.retrieve(charge.id);
console.log(transaction.status);
```

## Check Balance

```typescript
const balance = await malipo.balance.retrieve();
console.log(`Available: ${balance.available[0].amount} ${balance.available[0].currency}`);
```

## Error Handling

```typescript
try {
  await malipo.charges.create({ amount: -1 });
} catch (err) {
  if (err.name === 'MalipoError') {
    console.error(`API Error: ${err.message}`);
    console.error(`Status Code: ${err.statusCode}`);
  }
}
```

## Refunds

```typescript
const refund = await malipo.refunds.create({
  charge_id: "ch_123",
  amount: 5.00,
  reason: "Customer return"
}, {
  idempotencyKey: "refund_order_123"
});
console.log(refund.status);
```

## Hosted Checkout

```typescript
const session = await malipo.checkoutSessions.create({
  amount: 25.00,
  currency: "USD",
  description: "Pro Subscription",
  redirect_url: "https://your-site.com/success"
});
console.log(session.url);
```

## Webhook Handler (Express)

```typescript
import express from "express";
import { Malipo } from "malipo-node";

const app = express();
const malipo = new Malipo({ apiKey: process.env.MALIPO_SECRET_KEY });

app.post("/webhooks/malipo", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.header("x-webhook-signature");
  const secret = process.env.MALIPO_WEBHOOK_SECRET;

  try {
    const event = malipo.webhooks.constructEvent(
      req.body.toString(),
      signature,
      secret
    );

    if (event.type === "charge.succeeded") {
      const charge = event.data.object;
      console.log(`Payment of ${charge.amount} ${charge.currency} succeeded!`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
  }
});
```
