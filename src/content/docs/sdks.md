---
title: SDKs
draft: false
description: Official and community-supported SDKs for popular languages.
---

Official and community-supported SDKs for popular languages.

## Official SDKs

| Language | Package | Install |
|----------|---------|---------|
| JavaScript / TypeScript | [malipo-node](https://www.npmjs.com/package/malipo-node) | `npm install malipo-node` |
| Python | [malipo](https://pypi.org/project/malipo/) | `pip install malipo` |
| PHP | [malipo/malipo-php](https://packagist.org/packages/malipo/malipo-php) | `composer require malipo/malipo-php` |
| Java | [com.malipo:malipo-java](https://central.sonatype.com/artifact/com.malipo/malipo-java) | Maven Central |
| Flutter | [malipo](https://pub.dev/packages/malipo) | `flutter pub add malipo` |

## Language guides

- [Node.js / TypeScript](/sdk/node)
- [Python](/sdk/python)
- [PHP](/sdk/php)
- [Java](/sdk/java)
- [Flutter / Dart](/sdk/flutter)

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

## Quick example

```typescript
import { Malipo } from "malipo-node";

const malipo = new Malipo(process.env.MALIPO_SECRET_KEY!);

const charge = await malipo.charges.create({
  amount: 1000,
  currency: "CDF",
  phone: "+243812345678",
  network: "airtel"
});

console.log(charge.id, charge.status);
```
