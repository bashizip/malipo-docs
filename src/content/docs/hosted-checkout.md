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

Hosted checkout supports Mobile Money by default. For USD sessions, customers can also choose card payment when the matching QuickShare card rail via CyberSource is configured.

## Card Payment Flow

When a customer chooses card payment:

1. Malipo creates a pending card charge for the checkout session.
2. Malipo redirects the customer's browser to the CyberSource hosted payment page using signed form fields returned by QuickShare.
3. The customer enters card details on CyberSource, not on Malipo.
4. Malipo checks the provider status and updates the charge to `succeeded`, `failed`, or `declined`.
5. The checkout page redirects back to the merchant return URL with the transaction result.

Card payment is available only for `USD` checkout sessions. Sandbox card checkout is shown only when the sandbox QuickShare card rail returns a CyberSource sandbox/test hosted URL; `CDF` sessions show Mobile Money only.

You can verify the final payment result with the transaction ID returned to your redirect URL, or by listening for Malipo webhook events.

## Verify payment

On your `success_url`, retrieve the session to verify payment status:

`GET /v1/checkout/sessions/{session_id}`
