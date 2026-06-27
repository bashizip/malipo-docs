---
title: Idempotency
draft: false
description: Safely retry requests without duplicate operations.
---

Safely retry requests without duplicate operations.

## How it works

Include an `Idempotency-Key` header with a unique value (UUID v4 recommended) on POST requests. The API will cache the response for 24 hours and return it for subsequent requests with the same key.

## Supported endpoints

| Endpoint | | Description |
|----------|-|-------------|
| POST /v1/charges | | Create charge |
| POST /v1/charges/{id}/refunds | | Create refund |
| POST /v1/checkout/sessions | | Create checkout session |
| POST /v1/payouts | | Create payout |

## Example

```bash
curl -X POST https://api.malipo.dev/v1/charges \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "amount": 1000,
    "currency": "CDF",
    "phone": "+243812345678",
    "network": "AIRTEL_MONEY"
  }'
```

:::tip
Generate a new idempotency key for each unique operation. Reuse the same key only when retrying the exact same request.
:::
