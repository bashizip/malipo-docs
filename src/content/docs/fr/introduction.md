---
title: Introduction
draft: false
description: Malipo est une passerelle de paiement mobile money pour la RDC.
---

Malipo est une passerelle de paiement conçue spécialement pour la République Démocratique du Congo. Acceptez les paiements mobile money via **Vodacom M-Pesa**, **Orange Money** et **Airtel Money** via une API unique.

## Informations rapides

- **URL de base** : `https://api.malipo.dev/v1`
- **Auth** : Bearer token (clé API secrète)
- **Environnements** : Sandbox (test) et Live (production)
- **Devise financière live** : USD
- **Versements** : Transferts demandés par le marchand vers une destination Mobile Money approuvée

## Aperçu de l'API

L'API Malipo vous permet de :

- **Débiter** les clients via mobile money
- **Vérifier le statut** des transactions en temps réel
- **Rembourser** les transactions réussies (total ou partiel)
- **Consulter le solde** dans toutes les devises
- **Utiliser la page de paiement hébergée** pour une expérience pré-construite
- **Recevoir des webhooks** pour les notifications d'événements asynchrones
- **Générer des rapports** pour le rapprochement

## SDKs

Des SDKs officiels sont disponibles pour :

- [JavaScript / TypeScript](/fr/sdks)
- [Python](/fr/sdks)
- [PHP](/fr/sdks)
- [Java](/fr/sdks)
- [Flutter](/fr/sdks)

## Besoin d'aide ?

- Consultez le [tableau de bord sandbox](https://dashboard.malipo.dev) pour les clés API et les outils de test
- Lisez le guide [Passer en production](/fr/going-live) pour l'activation
- Contactez le support à support@malipo.dev
