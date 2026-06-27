---
title: Rapports
draft: false
description: Accédez aux rapports de transactions et aux analyses.
---

Accédez aux rapports de transactions et aux analyses.

## Rapport de transactions

`GET /v1/reports/transactions`

Retourne un rapport CSV ou JSON des transactions dans une plage de dates.

### Paramètres de requête

| Paramètre | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `date_from` | chaîne (ISO 8601) | Oui | Date de début (inclusive) |
| `date_to` | chaîne (ISO 8601) | Oui | Date de fin (inclusive) |
| `format` | chaîne | Non | `csv` ou `json` (défaut : `json`) |
| `status` | chaîne | Non | Filtrer par statut de transaction |
| `network` | chaîne | Non | Filtrer par réseau |

## Rapport de règlement

`GET /v1/reports/settlements`

Retourne les détails du règlement incluant les frais, les montants nets et le statut du paiement.
