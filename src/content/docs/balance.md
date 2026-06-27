---
title: Balance
draft: false
description: Retrieve your account balance.
---

Retrieve your account balance.

## Get balance

`GET /v1/balance`

Returns the available and pending balances for each currency.

### Response

```json
{
  "available": [
    { "currency": "CDF", "amount": 500000 },
    { "currency": "USD", "amount": 25000 }
  ],
  "pending": [
    { "currency": "CDF", "amount": 100000 },
    { "currency": "USD", "amount": 5000 }
  ]
}
```

:::note
In sandbox, the balance is simulated. Live balance requires completed payout setup.
:::
