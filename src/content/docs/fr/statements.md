---
title: Relevés mensuels
description: Lire et exporter l’historique mensuel de votre solde Malipo.
---

Le portail Finance fournit un relevé mensuel USD fondé sur le registre financier immuable de Malipo. Choisissez un mois dans `/finance/statements` pour consulter l’activité ou télécharger un CSV.

## Contenu du relevé

- début et fin de période en UTC ;
- paiements réussis bruts ;
- frais Malipo mémorisés avec le prix de chaque transaction ;
- mouvements nets du marchand ;
- settlements, remboursements et versements ;
- solde opérationnel de clôture.

Le relevé contient uniquement l’activité de votre compte marchand. Il n’expose jamais les comptes internes Malipo, les coûts prestataire, les données d’un autre marchand ou les motifs internes d’anomalie.

:::note
Pendant le rollout initial en shadow, le mois courant est présenté comme un aperçu. Un relevé publié est immuable : une correction ultérieure apparaît comme un nouveau mouvement référencé au lieu de modifier une ancienne ligne.
:::

Toutes les périodes financières utilisent UTC. Le fuseau de votre profil modifie certains affichages, mais jamais les frontières du relevé.
