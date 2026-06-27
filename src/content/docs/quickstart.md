---
title: Quickstart
draft: false
description: Get up and running with the Malipo API in minutes.
---

Get up and running with the Malipo API in minutes.

## Get your API key

Create a sandbox API key from the **Sandbox** section of your dashboard.

## Make your first request

Use the test console or your own code to make a charge request.

```bash title="Create a charge"
curl -X POST https://api.malipo.dev/v1/charges \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "CDF",
    "phone": "+243812345678",
    "network": "airtel"
  }'
```

:::caution[Keep your keys secure]
Never expose your secret API keys in client-side code. Use environment variables on your server.
:::

## SDK examples

Create a charge using our official SDKs in your preferred language.

### JavaScript / TypeScript

```typescript
import { Malipo } from "malipo";

const malipo = new Malipo("sk_test_...");

const charge = await malipo.charges.create({
  amount: 1000,
  currency: "CDF",
  phone: "+243812345678",
  network: "airtel"
});
```

### Python

```python
import malipo

malipo.api_key = "sk_test_..."

charge = malipo.Charge.create(
  amount=1000,
  currency="CDF",
  phone="+243812345678",
  network="airtel"
)
```

### cURL

```bash
curl -X POST https://api.malipo.dev/v1/charges \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "CDF",
    "phone": "+243812345678",
    "network": "airtel"
  }'
```
