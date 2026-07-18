---
title: Mise à disposition des fonds
description: Comprendre quand les fonds confirmés passent de pending à available.
---

Un paiement live réussi ajoute d’abord le montant net marchand au solde **pending** (en attente). Avec la politique par défaut, la transaction complète devient libérable exactement **48 heures après sa finalisation en UTC**, week-ends inclus.

Les transactions éligibles sont regroupées dans des lots traçables. Un blocage actif peut retarder la libération sans changer la date d’éligibilité d’origine. Le tableau de bord sépare les fonds pending éligibles et non éligibles, affiche la prochaine disponibilité et l’historique.

Lorsqu’un lot est libéré, son montant passe de **pending** à **available** (disponible). Cela ne déclenche pas automatiquement un versement Mobile Money : le payout reste une action séparée demandée par le marchand.

Écoutez `settlement.available` pour savoir quand un lot devient disponible. L’événement contient l’identifiant du lot, le montant, la devise, le nombre de transactions sources, le solde disponible et la date UTC.
