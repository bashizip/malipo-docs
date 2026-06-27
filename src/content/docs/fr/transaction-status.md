---
title: Statut des transactions
draft: false
description: Comprenez le cycle de vie d'une transaction.
---

Comprenez le cycle de vie d'une transaction.

## Valeurs de statut

| Statut | Description |
|--------|-------------|
| `pending` | Paiement initié, en attente de l'action du client |
| `processing` | Client a autorisé, transaction en cours de traitement |
| `succeeded` | Paiement complété avec succès |
| `failed` | Paiement échoué (voir `failure_reason`) |
| `declined` | Client a refusé ou annulé le paiement |
| `expired` | Paiement expiré avant complétion |
| `refunded` | Paiement entièrement remboursé |
| `partially_refunded` | Paiement partiellement remboursé |

## Flux des statuts

```
pending → processing → succeeded
              ↓              ↓
            failed        declined
              ↓
            expired
```

## Interrogation du statut

Pour les intégrations serveur, interrogez l'endpoint de paiement jusqu'à atteindre un état terminal :

```typescript
async function waitForCompletion(chargeId) {
  while (true) {
    const charge = await malipo.charges.retrieve(chargeId);
    if (["succeeded", "failed", "declined", "expired"].includes(charge.status)) {
      return charge;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}
```

:::tip
Utilisez les webhooks au lieu de l'interrogation pour les intégrations de production — ils sont plus efficaces et fiables.
:::
