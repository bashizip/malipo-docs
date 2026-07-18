---
title: Versements
description: Demander et suivre un versement vers une destination Mobile Money approuvée.
---

Un payout transfère une partie de votre solde USD **available** vers une destination Mobile Money approuvée. Malipo ne crée jamais de versement planifié automatiquement : chaque demande est déclenchée par le marchand.

## Avant la demande

- L’accès live doit être approuvé.
- Une politique de payout et une destination active doivent exister.
- La demande doit respecter les limites de montant, journalière et mensuelle de la politique.
- Envoyez une `Idempotency-Key` unique avec chaque création.

Le montant est réservé immédiatement. Selon la politique active, la demande est revue par un owner ou envoyée automatiquement sous un seuil configuré. Aucun frais de payout n’est facturé au marchand.

| Statut | Signification |
|---|---|
| `pending` | Fonds réservés, en attente de revue ou d’envoi |
| `processing` | Envoyé au prestataire ou accepté par lui |
| `succeeded` | Versement externe confirmé |
| `failed` | Échec certain, fonds rendus une seule fois |
| `cancelled` | Annulé avant envoi, fonds rendus une seule fois |
| `needs_review` | Résultat incertain, fonds maintenus réservés |

Vous pouvez annuler uniquement avant le début du traitement prestataire. Une nouvelle destination exige l’approbation d’un owner et devient active exactement 24 heures plus tard en UTC. Les demandes existantes conservent la destination masquée mémorisée à leur création.
