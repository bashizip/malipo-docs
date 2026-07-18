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
    { "currency": "USD", "amount": 25000 }
  ],
  "pending": [
    { "currency": "USD", "amount": 5000 }
  ]
}
```

:::note
In sandbox, the balance is simulated. In live mode, successful charge net amounts enter `pending`, then become `available` according to the settlement policy. Payout setup is required to transfer available funds.
:::
