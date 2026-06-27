---
title: Remboursements
draft: false
description: Émettez des remboursements pour les paiements réussis.
---

Émettez des remboursements pour les paiements réussis.

## Créer un remboursement

`POST /v1/charges/{charge_id}/refunds`

Les remboursements peuvent être totaux ou partiels. Seuls les paiements réussis peuvent être remboursés.

### Corps de la requête

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `amount` | entier | Non | Montant à rembourser dans l'unité la plus petite. Omettre pour un remboursement total. |
| `reason` | chaîne | Non | Raison : `duplicate`, `fraudulent`, `requested_by_customer` |
| `metadata` | objet | Non | Paires clé-valeur personnalisées |

### Réponse

```json
{
  "id": "re_1234567890",
  "object": "refund",
  "charge_id": "ch_1234567890",
  "amount": 1000,
  "currency": "CDF",
  "status": "succeeded",
  "reason": "requested_by_customer",
  "created_at": "2025-01-15T11:00:00Z"
}
```

## Lister les remboursements

`GET /v1/charges/{charge_id}/refunds`

Retourne une liste des remboursements pour un paiement.
