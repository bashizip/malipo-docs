---
title: Tarification
description: Comprendre les tarifs dynamiques, les limites et le prix mémorisé par transaction.
---

La tarification Malipo est configurée par l’administration et prend effet à une date UTC précise. Vous n’avez pas à modifier ou reconstruire votre intégration lorsqu’un tarif change.

## Plans

- **Starter** débute à **3,5 %**, sans frais fixe, avec une limite initiale de **500 USD de volume live par mois** et par marchand.
- **Growth** et **Enterprise** sont négociés pour chaque marchand selon son volume et ses besoins.
- Le tarif général peut avoir des variantes pour la carte ou le Mobile Money.

Le tableau de bord fait foi pour votre contrat courant, sa prochaine version et le volume mensuel utilisé ou réservé. Les limites sont comptées depuis le premier jour du mois à `00:00:00 UTC`.

## Prix mémorisé

Chaque paiement live conserve le plan, la version, la règle appliquée, le montant brut, les frais et le montant net marchand utilisés lors de sa création. Un changement ultérieur ne modifie jamais une transaction existante.

Les réponses finales et webhooks peuvent inclure `fee_amount`, `net_amount` et l’objet `pricing`. Les montants utilisent la plus petite unité monétaire, sauf indication contraire de l’endpoint.

:::note
La sandbox simule le même calcul, mais ne consomme pas votre limite mensuelle live.
:::
