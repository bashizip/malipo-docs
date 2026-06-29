---
title: Hosted Checkout
draft: false
description: Use Malipo's hosted checkout page for a pre-built payment experience.
---

Use Malipo's hosted checkout page for a pre-built payment experience.

## Create a checkout session

`POST /v1/checkout/sessions`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer | Yes | Amount in smallest currency unit |
| `currency` | string | Yes | CDF or USD |
| `success_url` | string | Yes | Redirect URL after successful payment |
| `cancel_url` | string | Yes | Redirect URL if customer cancels |
| `metadata` | object | No | Custom data attached to the session |
| `customer_phone` | string | No | Pre-fill customer phone number |
| `customer_email` | string | No | Pre-fill customer email |

### Response

```json
{
  "id": "cs_1234567890",
  "object": "checkout.session",
  "url": "https://checkout.malipo.dev/s/cs_1234567890",
  "amount": 1000,
  "currency": "CDF",
  "status": "open",
  "success_url": "https://yoursite.com/success",
  "cancel_url": "https://yoursite.com/cancel",
  "created_at": "2025-01-15T10:30:00Z",
  "expires_at": "2025-01-15T11:30:00Z"
}
```

## Redirect the customer

Send the customer to the `url` returned in the session. After payment, they'll be redirected to your `success_url` or `cancel_url`.

Hosted checkout supports Mobile Money by default. For live USD sessions, customers can also choose card payment; Malipo redirects them to the CyberSource hosted card page and does not collect card numbers.

## Verify payment

On your `success_url`, retrieve the session to verify payment status:

`GET /v1/checkout/sessions/{session_id}`
