---
title: Introduction
draft: false
description: Malipo is a mobile money payment gateway for the DRC.
---

Malipo is a payment gateway purpose-built for the Democratic Republic of Congo. Accept mobile money payments via **Vodacom M-Pesa**, **Orange Money**, and **Airtel Money** through a single API.

## Quick facts

- **Base URL**: `https://api.malipo.dev/v1`
- **Auth**: Bearer token (secret API key)
- **Environments**: Sandbox (testing) and Live (production)
- **Live financial currency**: USD
- **Payouts**: Merchant-requested transfers to an approved Mobile Money destination

## API overview

The Malipo API lets you:

- **Charge** customers via mobile money
- **Check transaction status** in real time
- **Refund** successful charges (full or partial)
- **Check balance** across currencies
- **Use hosted checkout** for a pre-built payment page
- **Receive webhooks** for async event notifications
- **Generate reports** for reconciliation

## SDKs

Official SDKs are available for:

- [JavaScript / TypeScript](/sdks)
- [Python](/sdks)
- [PHP](/sdks)
- [Java](/sdks)
- [Flutter](/sdks)

## Need help?

- Check the [sandbox dashboard](https://dashboard.malipo.dev) for API keys and test tools
- Read the [Going live](/going-live) guide for production activation
- Contact support at support@malipo.dev
