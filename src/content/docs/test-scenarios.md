---
title: Sandbox Test Scenarios
draft: false
description: Use these special values to trigger specific behaviors in the sandbox environment.
---

Use these special amounts in sandbox to trigger specific behaviors:

| Amount (CDF) | Behavior |
|--------------|----------|
| 100 | Normal success (90% success rate) |
| 200 | Insufficient funds error |
| 300 | Declined by customer |
| 400 | Timeout (5s delay then timeout error) |
| 500 | Network unavailable |
| 600 | Invalid PIN |
| Any other amount | Normal processing (90% success rate) |

:::note
Test amounts only work in sandbox with test API keys (`sk_test_...`). They are ignored in live mode.
:::
