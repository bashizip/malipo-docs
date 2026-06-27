---
title: Erreurs
draft: false
description: Liste complète des codes d'erreur retournés par l'API.
---

Liste complète des codes d'erreur retournés par l'API avec leur signification et comment les gérer.

## Erreurs d'authentification

| Code d'erreur | Statut HTTP | Description |
|---------------|-------------|-------------|
| `authentication_required` | 401 | Aucune clé API fournie |
| `invalid_api_key` | 401 | La clé API est invalide ou révoquée |
| `api_key_expired` | 401 | La clé API a expiré |
| `insufficient_permissions` | 403 | La clé API n'a pas les permissions requises |

## Erreurs de validation

| Code d'erreur | Statut HTTP | Description |
|---------------|-------------|-------------|
| `validation_error` | 400 | Échec de la validation du corps de la requête |
| `invalid_amount` | 400 | Le montant doit être un entier positif |
| `invalid_currency` | 400 | Code devise non supporté |
| `invalid_phone` | 400 | Le format du numéro de téléphone est invalide |
| `invalid_network` | 400 | Réseau non supporté |

## Erreurs de paiement

Les erreurs de paiement retournent un code HTTP 200 avec les détails de l'échec dans le corps de la réponse. Vérifiez les champs `status` et `failure_reason`.

| Code d'erreur | Statut HTTP | Description |
|---------------|-------------|-------------|
| `insufficient_funds` | 200 | Solde insuffisant du client |
| `declined` | 200 | Transaction refusée par le réseau ou le client |
| `timeout` | 200 | Délai d'attente réseau — réessayez ou vérifiez le statut |
| `network_unavailable` | 200 | Réseau mobile money temporairement indisponible |
| `invalid_pin` | 200 | Le client a saisi un code PIN incorrect |
| `sim_not_found` | 200 | Numéro de téléphone non enregistré sur le réseau |

## Erreurs serveur

| Code d'erreur | Statut HTTP | Description |
|---------------|-------------|-------------|
| `internal_error` | 500 | Erreur serveur inattendue |
| `service_unavailable` | 503 | Service temporairement indisponible |

## Format de la réponse d'erreur

```json
{
  "error": {
    "code": "validation_error",
    "message": "Paramètres de requête invalides",
    "details": [
      { "field": "amount", "message": "Le montant doit être supérieur à 0" }
    ]
  }
}
```
