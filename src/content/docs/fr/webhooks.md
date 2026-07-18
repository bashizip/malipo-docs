---
title: Webhooks
draft: false
description: Recevez des notifications en temps réel lorsque des événements se produisent dans votre compte.
---

Recevez des notifications en temps réel lorsque des événements se produisent dans votre compte.

Les webhooks vous permettent de recevoir des notifications HTTP POST lorsque certains événements se produisent dans votre compte Malipo. Configurez l'URL de votre endpoint dans le tableau de bord pour commencer à recevoir des événements.

## Événements webhook

| Type d'événement | Description |
|-----------------|-------------|
| `charge.succeeded` | Un paiement a été complété avec succès |
| `charge.failed` | Un paiement a échoué |
| `charge.declined` | Un paiement a été refusé par le client |
| `charge.expired` | Un paiement a expiré avant complétion |
| `charge.refunded` | Un paiement a été remboursé (total ou partiel) |
| `checkout.session.completed` | Une session de paiement a été complétée |
| `settlement.available` | Un lot de fonds est devenu disponible |
| `payout.pending` | Une demande de versement a réservé les fonds |
| `payout.processing` | Un versement est en traitement prestataire |
| `payout.succeeded` | Un paiement a été complété avec succès |
| `payout.failed` | Un paiement a échoué |
| `payout.cancelled` | Un versement a été annulé avant envoi |
| `payout.needs_review` | Le résultat prestataire exige une revue manuelle |

## Structure du payload

Chaque événement webhook suit ce format standard :

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

## Vérification de signature

Vérifiez l'authenticité des webhooks en utilisant les signatures HMAC-SHA256.

```typescript title="Exemple de vérification Node.js"
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
    return res.status(400).send("Signature invalide");
  }
  const event = JSON.parse(req.body);
  console.log(event.type);
  res.json({ received: true });
});
```

:::danger[Toujours vérifier les signatures]
Ne faites jamais confiance aux webhooks entrants sans vérifier la signature. Cela empêche les attaquants de falsifier les événements.
:::
