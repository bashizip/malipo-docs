---
title: Paiements
draft: false
description: Créez et gérez les paiements mobile money.
---

Créez et gérez les paiements mobile money.

## Créer un paiement

`POST /v1/charges`

Initie une demande de paiement mobile money sur le téléphone du client.

### Corps de la requête

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `amount` | entier | Oui | Montant dans l'unité monétaire la plus petite (ex. 1000 = 10,00 CDF) |
| `currency` | chaîne | Oui | Code devise ISO 4217 : CDF ou USD |
| `phone` | chaîne | Oui | Numéro de téléphone du client au format E.164 (+243...) |
| `network` | string | Oui | Réseau mobile money : AIRTEL_MONEY, VODACOM_MPESA, ORANGE_MONEY |
| `description` | chaîne | Non | Description optionnelle du paiement |
| `metadata` | objet | Non | Paires clé-valeur personnalisées |
| `callback_url` | chaîne | Non | Remplacer l'URL webhook par défaut pour ce paiement |

### Exemple cURL

```bash
curl -X POST https://api.malipo.dev/v1/charges \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "CDF",
    "phone": "+243812345678",
    "network": "AIRTEL_MONEY",
    "description": "Commande #1234",
    "metadata": { "order_id": "1234" }
  }'
```

### Réponse

```json
{
  "id": "ch_1234567890",
  "object": "charge",
  "amount": 1000,
  "currency": "CDF",
  "phone": "+243812345678",
  "network": "AIRTEL_MONEY",
  "status": "pending",
  "description": "Commande #1234",
  "metadata": { "order_id": "1234" },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

## Récupérer un paiement

`GET /v1/charges/{charge_id}`

Retourne l'objet charge avec le statut actuel.

## Lister les paiements

`GET /v1/charges`

Retourne une liste paginée des paiements. Supporte les paramètres : `limit`, `offset`, `status`, `network`, `date_from`, `date_to`.
