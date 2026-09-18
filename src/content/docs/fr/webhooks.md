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

Vérifiez l'authenticité des webhooks avec les en-têtes `X-Webhook-Signature` et `X-Webhook-Timestamp`. La signature est un HMAC-SHA256 calculé sur `${timestamp}.${rawPayload}` et les horodatages de plus de cinq minutes sont rejetés par défaut.

```typescript title="Exemple de vérification Node.js"
import express from "express";
import { Malipo } from "malipo-node";

const app = express();
const malipo = new Malipo({ apiKey: process.env.MALIPO_SECRET_KEY });

// Utilisez express.raw() pour ne pas analyser le payload avant la vérification.
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
    console.error(`Erreur webhook : ${err instanceof Error ? err.message : "Webhook invalide"}`);
    res.sendStatus(400);
  }
});
```

:::danger[Toujours vérifier les signatures]
Ne faites jamais confiance aux webhooks entrants sans vérifier la signature. Conservez le secret sur votre serveur, gardez le corps brut de la requête et retournez HTTP 400 si la vérification échoue.
:::
