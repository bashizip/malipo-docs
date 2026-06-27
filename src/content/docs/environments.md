---
title: Environments
draft: false
description: Malipo provides two environments – sandbox for testing and live for production.
---

Malipo provides two environments: **sandbox** for testing and **live** for production.

## Sandbox

The sandbox environment lets you test your integration without processing real payments. All transactions are simulated.

| Property | Value |
|----------|-------|
| Base URL | `https://api.malipo.dev/v1` |
| API Key Prefix | `sk_test_...` |
| Webhook URL | Configure in dashboard |
| Test Networks | AIRTEL_MONEY, VODACOM_MPESA, ORANGE_MONEY |

## Live

The live environment processes real payments. Requires completed KYC and live activation.

| Property | Value |
|----------|-------|
| Base URL | `https://api.malipo.dev/v1` |
| API Key Prefix | `sk_live_...` |
| Webhook URL | Configure in dashboard |
| Supported Networks | AIRTEL_MONEY, VODACOM_MPESA, ORANGE_MONEY (per availability) |

:::note
Both environments share the same base URL. The API key determines which environment you're using.
:::
