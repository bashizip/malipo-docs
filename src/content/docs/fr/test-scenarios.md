---
title: Scénarios de test Sandbox
draft: false
description: Utilisez ces valeurs spéciales pour déclencher des comportements spécifiques dans l'environnement sandbox.
---

Utilisez ces montants spéciaux en sandbox pour déclencher des comportements spécifiques :

| Montant (CDF) | Comportement |
|---------------|-------------|
| 100 | Succès normal (90% de taux de réussite) |
| 200 | Erreur de fonds insuffisants |
| 300 | Refusé par le client |
| 400 | Délai d'attente (5s de délai puis erreur de timeout) |
| 500 | Réseau indisponible |
| 600 | Code PIN invalide |
| Tout autre montant | Traitement normal (90% de taux de réussite) |

:::note
Les montants de test fonctionnent uniquement en sandbox avec des clés API de test (`sk_test_...`). Ils sont ignorés en mode live.
:::
