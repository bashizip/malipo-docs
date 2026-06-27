---
title: SDK Node.js
draft: false
description: Guide d'intégration officiel Node.js et TypeScript pour Malipo.
---

Guide d'intégration officiel Node.js et TypeScript pour Malipo.

## Installation

```bash
npm install malipo-node
```

## Démarrage rapide

```typescript
import { Malipo } from "malipo-node";

const malipo = new Malipo({
  apiKey: process.env.MALIPO_SECRET_KEY
});

const charge = await malipo.charges.create({
  amount: 10,
  currency: "USD",
  phone: "+243810000000",
  network: "VODACOM_MPESA",
  description: "Order #123"
}, {
  idempotencyKey: "unique_order_id_123"
});

const transaction = await malipo.transactions.retrieve(charge.id);
console.log(transaction.status);
```

## Vérifier le solde

```typescript
const balance = await malipo.balance.retrieve();
console.log(`Disponible : ${balance.available[0].amount} ${balance.available[0].currency}`);
```

## Gestion des erreurs

```typescript
try {
  await malipo.charges.create({ amount: -1 });
} catch (err) {
  if (err.name === 'MalipoError') {
    console.error(`Erreur API : ${err.message}`);
    console.error(`Code statut : ${err.statusCode}`);
  }
}
```

## Remboursements

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

## Paiement hébergé

```typescript
const session = await malipo.checkoutSessions.create({
  amount: 25.00,
  currency: "USD",
  description: "Pro Subscription",
  redirect_url: "https://your-site.com/success"
});
console.log(session.url);
```

## Webhook (Express)

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
      req.body.toString(), signature, secret
    );

    if (event.type === "charge.succeeded") {
      const charge = event.data.object;
      console.log(`Paiement de ${charge.amount} ${charge.currency} réussi !`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(`Erreur webhook : ${err.message}`);
  }
});
```
