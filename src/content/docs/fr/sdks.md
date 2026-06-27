---
title: SDKs
draft: false
description: SDKs officiels et supportés par la communauté pour les langages populaires.
---

SDKs officiels et supportés par la communauté pour les langages populaires.

## SDKs officiels

| Langage | Package | Installation |
|---------|---------|-------------|
| JavaScript / TypeScript | [malipo-node](https://www.npmjs.com/package/malipo-node) | `npm install malipo-node` |
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

## Installation

### npm

```bash
npm install malipo-node
```

### Yarn

```bash
yarn add malipo-node
```

### pnpm

```bash
pnpm add malipo-node
```

## Exemple rapide

```typescript
import { Malipo } from "malipo-node";

const malipo = new Malipo(process.env.MALIPO_SECRET_KEY!);

const charge = await malipo.charges.create({
  amount: 1000,
  currency: "CDF",
  phone: "+243812345678",
  network: "AIRTEL_MONEY"
});

console.log(charge.id, charge.status);
```
