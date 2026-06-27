---
title: Charges
draft: false
description: Create and manage mobile money charges.
---

Create and manage mobile money charges.

## Create a charge

`POST /v1/charges`

Initiates a mobile money payment request to the customer's phone.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer | Yes | Amount in the smallest currency unit (e.g., 1000 = 10.00 CDF) |
| `currency` | string | Yes | ISO 4217 currency code: CDF or USD |
| `phone` | string | Yes | Customer phone number in E.164 format (+243...) |
| `network` | string | Yes | Mobile money network: airtel, vodacom, orange |
| `description` | string | No | Optional description for the charge |
| `metadata` | object | No | Custom key-value pairs for your reference |
| `callback_url` | string | No | Override the default webhook URL for this charge |

### cURL Example

```bash
curl -X POST https://api.malipo.dev/v1/charges \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "CDF",
    "phone": "+243812345678",
    "network": "airtel",
    "description": "Order #1234",
    "metadata": { "order_id": "1234" }
  }'
```

### Response

```json
{
  "id": "ch_1234567890",
  "object": "charge",
  "amount": 1000,
  "currency": "CDF",
  "phone": "+243812345678",
  "network": "airtel",
  "status": "pending",
  "description": "Order #1234",
  "metadata": { "order_id": "1234" },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

## Retrieve a charge

`GET /v1/charges/{charge_id}`

Returns the charge object with current status.

## List charges

`GET /v1/charges`

Returns a paginated list of charges. Supports query parameters: `limit`, `offset`, `status`, `network`, `date_from`, `date_to`.
