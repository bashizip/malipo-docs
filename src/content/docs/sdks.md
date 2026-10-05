---
title: SDKs
draft: false
description: Official and community-supported SDKs for popular languages.
---

Official and community-supported SDKs for popular languages.

## Official SDKs

| Language | Package | Install |
|----------|---------|---------|
| JavaScript / TypeScript | [malipo-node](https://www.npmjs.com/package/malipo-node) | `npm install malipo-node@1.3.0-beta.1` |
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

Node.js version `1.3.0-beta.1` includes B2C beneficiaries, disbursements and sandbox testing. Use the [Node.js reference](/sdk/node/) and [complete B2C guide](/b2c/) to integrate with `https://api.malipo.dev/v1`. Live B2C is not enabled. The example below uses a sandbox key and a success-test phone.

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

## Quick example

```typescript
import { Malipo } from "malipo-node";

const malipo = new Malipo({ apiKey: process.env.MALIPO_SECRET_KEY! });

const charge = await malipo.charges.create({
  amount: 30,
  currency: "USD",
  phone: "+243000000001",
  network: "ORANGE_MONEY"
}, { idempotencyKey: "order-123" });

console.log(charge.id, charge.status);
```
