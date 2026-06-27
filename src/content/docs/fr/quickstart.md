---
title: Démarrage rapide
draft: false
description: Commencez avec l'API Malipo en quelques minutes.
---

Commencez avec l'API Malipo en quelques minutes.

## Obtenez votre clé API

Créez une clé API sandbox depuis la section **Sandbox** de votre tableau de bord.

## Faites votre première requête

Utilisez la console de test ou votre propre code pour faire une requête de paiement.

```bash title="Créer un paiement"
curl -X POST https://api.malipo.dev/v1/charges \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "CDF",
    "phone": "+243812345678",
    "network": "AIRTEL_MONEY"
  }'
```

:::caution[Gardez vos clés sécurisées]
N'exposez jamais vos clés API secrètes dans le code côté client. Utilisez des variables d'environnement sur votre serveur.
:::

## Exemples SDK

Créez un paiement en utilisant nos SDKs officiels dans votre langage préféré.

### JavaScript / TypeScript

```typescript
import { Malipo } from "malipo";

const malipo = new Malipo("sk_test_...");

const charge = await malipo.charges.create({
  amount: 1000,
  currency: "CDF",
  phone: "+243812345678",
  network: "AIRTEL_MONEY"
});
```

### Python

```python
import malipo

malipo.api_key = "sk_test_..."

charge = malipo.Charge.create(
  amount=1000,
  currency="CDF",
  phone="+243812345678",
  network="AIRTEL_MONEY"
)
```

### cURL

```bash
curl -X POST https://api.malipo.dev/v1/charges \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "CDF",
    "phone": "+243812345678",
    "network": "AIRTEL_MONEY"
  }'
```
