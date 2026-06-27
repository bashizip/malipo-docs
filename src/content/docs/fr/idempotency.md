---
title: Idempotence
draft: false
description: Réessayez les requêtes en toute sécurité sans opérations en double.
---

Réessayez les requêtes en toute sécurité sans opérations en double.

## Comment ça fonctionne

Incluez un en-tête `Idempotency-Key` avec une valeur unique (UUID v4 recommandé) sur les requêtes POST. L'API mettra en cache la réponse pendant 24 heures et la retournera pour les requêtes ultérieures avec la même clé.

## Endpoints supportés

| Endpoint | | Description |
|----------|-|-------------|
| POST /v1/charges | | Créer un paiement |
| POST /v1/charges/{id}/refunds | | Créer un remboursement |
| POST /v1/checkout/sessions | | Créer une session de paiement |
| POST /v1/payouts | | Créer un paiement |

## Exemple

```bash
curl -X POST https://api.malipo.dev/v1/charges \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "amount": 1000,
    "currency": "CDF",
    "phone": "+243812345678",
    "network": "AIRTEL_MONEY"
  }'
```

:::tip
Générez une nouvelle clé d'idempotence pour chaque opération unique. Réutilisez la même clé uniquement lorsque vous réessayez la requête exacte.
:::
