---
title: SDKs
draft: false
description: SDKs officiels et supportés par la communauté pour les langages populaires.
---

SDKs officiels et supportés par la communauté pour les langages populaires.

## SDKs officiels

| Langage | Package | Installation |
|---------|---------|-------------|
| JavaScript / TypeScript | [malipo-node](https://www.npmjs.com/package/malipo-node) | `npm install malipo-node@1.3.0-beta.1` |
| Python | [malipo](https://pypi.org/project/malipo/) | `pip install malipo` |
| PHP | [malipo/malipo-php](https://packagist.org/packages/malipo/malipo-php) | `composer require malipo/malipo-php` |
| Java | [com.malipo:malipo-java](https://central.sonatype.com/artifact/com.malipo/malipo-java) | Maven Central |
| Flutter | [malipo](https://pub.dev/packages/malipo) | `flutter pub add malipo` |

## Guides par langage

- [Node.js / TypeScript](/fr/sdk/node)
- [Python](/fr/sdk/python)
- [PHP](/fr/sdk/php)
- [Java](/fr/sdk/java)
- [Flutter / Dart](/fr/sdk/flutter)

La version Node.js `1.3.0-beta.1` inclut les bénéficiaires, versements B2C et outils de test sandbox. Consultez la [référence Node.js](/fr/sdk/node/) et le [guide B2C complet](/fr/b2c/) pour intégrer `https://api.malipo.dev/v1`. Le B2C live n’est pas activé. L’exemple ci-dessous utilise une clé sandbox et un numéro de test forçant le succès.

## Installation

### npm

```bash
npm install malipo-node@1.3.0-beta.1
```

### Yarn

```bash
yarn add malipo-node@1.3.0-beta.1
```

### pnpm

```bash
pnpm add malipo-node@1.3.0-beta.1
```

## Exemple rapide

```typescript
import { Malipo } from "malipo-node";

const malipo = new Malipo({ apiKey: process.env.MALIPO_API_KEY! });

const charge = await malipo.charges.create({
  amount: 30,
  currency: "USD",
  phone: "+243000000001",
  network: "ORANGE_MONEY"
}, { idempotencyKey: "order-123" });

console.log(charge.id, charge.status);
```
