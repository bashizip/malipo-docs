---
title: Environnements
draft: false
description: Malipo fournit deux environnements — sandbox pour les tests et live pour la production.
---

Malipo fournit deux environnements : **sandbox** pour les tests et **live** pour la production.

## Sandbox

L'environnement sandbox vous permet de tester votre intégration sans traiter de vrais paiements. Toutes les transactions sont simulées.

| Propriété | Valeur |
|-----------|--------|
| URL de base | `https://api.malipo.dev/v1` |
| Préfixe clé API | `sk_test_...` |
| URL webhook | Configurer dans le tableau de bord |
| Réseaux de test | airtel, vodacom, orange |

## Live

L'environnement live traite les vrais paiements. Nécessite KYC et activation live complétées.

| Propriété | Valeur |
|-----------|--------|
| URL de base | `https://api.malipo.dev/v1` |
| Préfixe clé API | `sk_live_...` |
| URL webhook | Configurer dans le tableau de bord |
| Réseaux supportés | airtel, vodacom, orange (selon disponibilité) |

:::note
Les deux environnements partagent la même URL de base. La clé API détermine l'environnement utilisé.
:::
