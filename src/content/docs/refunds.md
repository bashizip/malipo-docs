---
title: Refunds
draft: false
description: Issue refunds for successful charges.
---

Issue refunds for successful charges.

## Create a refund

`POST /v1/charges/{charge_id}/refunds`

Refunds can be full or partial. Only succeeded charges can be refunded.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer | No | Amount to refund in smallest currency unit. Omit for full refund. |
| `reason` | string | No | Reason: `duplicate`, `fraudulent`, `requested_by_customer` |
| `metadata` | object | No | Custom key-value pairs |

### Response

```json
{
  "id": "re_1234567890",
  "object": "refund",
  "charge_id": "ch_1234567890",
  "amount": 1000,
  "currency": "CDF",
  "status": "succeeded",
  "reason": "requested_by_customer",
  "created_at": "2025-01-15T11:00:00Z"
}
```

## List refunds

`GET /v1/charges/{charge_id}/refunds`

Returns a list of refunds for a charge.
