---
title: Going Live
draft: false
description: Complete these steps to activate your live account.
---

Complete these steps to activate your live account.

## Prerequisites

- Completed sandbox integration and testing
- Business registration documents ready
- Bank account for payouts configured
- Compliance review prepared (BCC requirements)

## Activation steps

1. **Submit KYC documents** — Company registration, director IDs, proof of address
2. **Configure payouts** — Add bank account details for settlements
3. **Compliance review** — Malipo reviews your application (1-3 business days)
4. **Live approval** — Receive notification and generate live API keys
5. **Go live** — Replace test keys with live keys in your integration

## Key differences: Sandbox vs Live

| Aspect | Sandbox | Live |
|--------|---------|------|
| API Key prefix | `sk_test_...` | `sk_live_...` |
| Real money | No | Yes |
| KYC required | No | Yes |
| Payout setup | No | Yes |
| Rate limits | Lower | Higher (per plan) |
| Support SLA | Best effort | Per plan |

:::tip
Your sandbox integration code works unchanged in live — just swap the API key.
:::
