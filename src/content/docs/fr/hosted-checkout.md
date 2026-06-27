---
title: Paiement hébergé
draft: false
description: Utilisez la page de paiement hébergée de Malipo pour une expérience de paiement pré-construite.
---

Utilisez la page de paiement hébergée de Malipo pour une expérience de paiement pré-construite.

## Créer une session de paiement

`POST /v1/checkout/sessions`

### Corps de la requête

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `amount` | entier | Oui | Montant dans l'unité la plus petite |
| `currency` | chaîne | Oui | CDF ou USD |
| `success_url` | chaîne | Oui | URL de redirection après paiement réussi |
| `cancel_url` | chaîne | Oui | URL de redirection si le client annule |
| `metadata` | objet | Non | Données personnalisées attachées à la session |
| `customer_phone` | chaîne | Non | Pré-remplir le numéro de téléphone du client |
| `customer_email` | chaîne | Non | Pré-remplir l'email du client |

### Réponse

```json
{
  "id": "cs_1234567890",
  "object": "checkout.session",
  "url": "https://checkout.malipo.dev/s/cs_1234567890",
  "amount": 1000,
  "currency": "CDF",
  "status": "open",
  "success_url": "https://yoursite.com/success",
  "cancel_url": "https://yoursite.com/cancel",
  "created_at": "2025-01-15T10:30:00Z",
  "expires_at": "2025-01-15T11:30:00Z"
}
```

## Rediriger le client

Envoyez le client vers l'`url` retournée dans la session. Après le paiement, il sera redirigé vers votre `success_url` ou `cancel_url`.

## Vérifier le paiement

Sur votre `success_url`, récupérez la session pour vérifier le statut du paiement :

`GET /v1/checkout/sessions/{session_id}`
