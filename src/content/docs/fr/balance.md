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
    { "currency": "CDF", "amount": 500000 },
    { "currency": "USD", "amount": 25000 }
  ],
  "pending": [
    { "currency": "CDF", "amount": 100000 },
    { "currency": "USD", "amount": 5000 }
  ]
}
```

:::note
En sandbox, le solde est simulé. Le solde live nécessite une configuration de paiement complétée.
:::
