---
title: Authentification
draft: false
description: Toutes les requêtes API nécessitent une authentification via Bearer token.
---

Toutes les requêtes API nécessitent une authentification via Bearer token.

Incluez votre clé API dans l'en-tête Authorization de chaque requête :

```
Authorization: Bearer sk_live_...
```

:::caution[Gardez vos clés sécurisées]
N'exposez jamais vos clés API secrètes dans le code côté client. Utilisez des variables d'environnement sur votre serveur.
:::

## Types de clés API

| Clé | Type | Description |
|-----|------|-------------|
| `sk_test_...` | Secrète | Clé secrète sandbox — utilisez pour les tests |
| `sk_live_...` | Secrète | Clé secrète live — utilisez pour la production |
| `pk_test_...` | Publiable | Clé publiable sandbox — sécurisée côté client |
| `pk_live_...` | Publiable | Clé publiable live — sécurisée côté client |
