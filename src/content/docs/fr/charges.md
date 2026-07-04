---
title: Paiements
draft: false
description: Créez et gérez les paiements Mobile Money et carte.
---

Créez et gérez les paiements Mobile Money et carte.

## Créer un paiement

`POST /v1/charges`

Initie une demande de paiement. Mobile Money envoie une demande sur le téléphone du client. Les paiements par carte créent une session carte QuickShare avec redirection vers la page de paiement hébergée CyberSource.

### Corps de la requête

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `amount` | entier | Oui | Montant dans l'unité monétaire la plus petite (ex. 1000 = 10,00 CDF) |
| `currency` | chaîne | Oui | Code devise ISO 4217 : CDF ou USD |
| `phone` | chaîne | Oui | Numéro de téléphone du client au format E.164 (+243...) |
| `network` | string | Oui | Réseau mobile money : AIRTEL_MONEY, VODACOM_MPESA, ORANGE_MONEY |
| `payment_method` | string | Non | `mobile_money` par défaut. Utilisez `card` pour le rail carte QuickShare via CyberSource. |
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

## Paiement par carte

Les paiements par carte utilisent le rail CyberSource exposé par QuickShare. Malipo crée et suit le paiement, mais les données carte sont saisies uniquement sur la page hébergée CyberSource.

Pour créer une charge carte, envoyez `payment_method: "card"` avec `currency: "USD"`. La réponse contient `next_action.type = "cybersource_redirect"`, `payment_url`, et les champs signés à soumettre en `POST` vers CyberSource.

N'envoyez jamais les numéros de carte, dates d'expiration, CVV ou OTP à Malipo. Les cartes de test CyberSource doivent être utilisées uniquement lorsque l'URL CyberSource retournée est une URL sandbox/test.

## Récupérer un paiement

`GET /v1/charges/{charge_id}`

Retourne l'objet charge avec le statut actuel.

## Lister les paiements

`GET /v1/charges`

Retourne une liste paginée des paiements. Supporte les paramètres : `limit`, `offset`, `status`, `network`, `date_from`, `date_to`.
