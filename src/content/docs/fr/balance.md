---
title: Solde
draft: false
description: Consultez le solde de votre compte.
---

Consultez le solde de votre compte.

## Obtenir le solde

`GET /v1/balance`

Retourne les soldes disponibles et en attente pour chaque devise.

### Réponse

```json
{
  "available": [
    { "currency": "USD", "amount": 25000 }
  ],
  "pending": [
    { "currency": "USD", "amount": 5000 }
  ]
}
```

:::note
En sandbox, le solde est simulé. En live, le montant net d’un paiement réussi entre dans `pending`, puis devient `available` selon la politique de mise à disposition. Une destination de versement est nécessaire pour transférer les fonds disponibles.
:::
