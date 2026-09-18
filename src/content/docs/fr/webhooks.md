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

Chaque livraison contient deux en-têtes :

| En-tête | Description |
|---------|-------------|
| `X-Webhook-Timestamp` | L'horodatage utilisé dans le message signé, au format ISO-8601 |
| `X-Webhook-Signature` | La signature HMAC-SHA256 en hexadécimal minuscule du message signé |

Le message signé est composé de l'horodatage, d'un point (`.`), puis du corps brut exact de la requête :

```text
message signé = horodatage + "." + corps brut   (octets bruts, non modifiés)
signature      = hex(HMAC-SHA256(secret, message signé))
```

Les livraisons dont l'horodatage s'écarte de plus de cinq minutes de l'horloge de votre serveur sont rejetées par défaut : maintenez votre horloge synchronisée. Vérifiez toujours la signature sur le corps brut non analysé — relire le JSON puis le re-sérialiser modifie les espaces et l'ordre des clés, et donc la signature.

### Le secret de signature

Chaque endpoint possède son propre secret de signature, affiché dans le tableau de bord. Il s'agit d'une chaîne de 64 caractères hexadécimaux minuscules. Utilisez-le exactement tel qu'affiché : aucun préfixe `whsec_`, aucun guillemet, aucun espace superflu. Un secret comportant un caractère supplémentaire ne produira jamais une signature correspondante.

Si votre compte comporte plusieurs endpoints actifs, chacun conserve son propre secret. Vérifiez une livraison avec le secret de l'endpoint dont l'URL a reçu la requête.

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
