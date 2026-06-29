---
title: Charges
draft: false
description: Create and manage Mobile Money and card charges.
---

Create and manage Mobile Money and card charges.

## Create a charge

`POST /v1/charges`

Initiates a payment request. Mobile Money sends a prompt to the customer's phone. Card payments create a CyberSource hosted payment session.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer | Yes | Amount in the smallest currency unit (e.g., 1000 = 10.00 CDF) |
| `currency` | string | Yes | ISO 4217 currency code: CDF or USD |
| `phone` | string | Required for Mobile Money | Customer phone number in E.164 format (+243...) |
| `network` | string | Required for Mobile Money | Mobile Money network: AIRTEL_MONEY, VODACOM_MPESA, ORANGE_MONEY |
| `payment_method` | string | No | `mobile_money` by default. Use `card` to initiate a CyberSource hosted card payment. |
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
    "network": "AIRTEL_MONEY",
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
  "network": "AIRTEL_MONEY",
  "status": "pending",
  "description": "Order #1234",
  "metadata": { "order_id": "1234" },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

## Card Payment Workflow

Card payments use CyberSource Secure Acceptance. Malipo creates and tracks the payment, but card details are entered only on the CyberSource hosted page.

### 1. Create a card charge

Card payments require a live API key and `USD`.

```bash
curl -X POST https://api.malipo.dev/v1/charges \
  -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: order_1234_card" \
  -d '{
    "amount": 50,
    "currency": "USD",
    "payment_method": "card",
    "description": "Order #1234",
    "metadata": { "order_id": "1234" }
  }'
```

### 2. Redirect the customer to CyberSource

Malipo returns a pending charge with a `next_action`. Build an HTML form, add every returned `params` entry as a hidden input, and submit it with `POST` to `next_action.payment_url`.

```json
{
  "id": "ch_1234567890",
  "object": "charge",
  "status": "pending",
  "amount": 50,
  "currency": "USD",
  "payment_method": "card",
  "next_action": {
    "type": "cybersource_redirect",
    "payment_url": "https://secureacceptance.cybersource.com/pay",
    "params": {
      "access_key": "...",
      "profile_id": "...",
      "signature": "..."
    }
  }
}
```

```html
<form id="cybersource-form" method="POST" action="https://secureacceptance.cybersource.com/pay">
  <input type="hidden" name="access_key" value="..." />
  <input type="hidden" name="profile_id" value="..." />
  <input type="hidden" name="transaction_uuid" value="..." />
  <input type="hidden" name="signed_field_names" value="..." />
  <input type="hidden" name="signed_date_time" value="..." />
  <input type="hidden" name="transaction_type" value="sale" />
  <input type="hidden" name="reference_number" value="ch_1234567890" />
  <input type="hidden" name="amount" value="50.00" />
  <input type="hidden" name="currency" value="USD" />
  <input type="hidden" name="signature" value="..." />
</form>

<script>
  document.getElementById("cybersource-form").submit();
</script>
```

### 3. Check the final status

After the customer completes or cancels the CyberSource page, retrieve the charge until it becomes final:

```bash
curl https://api.malipo.dev/v1/transactions/ch_1234567890 \
  -H "Authorization: Bearer sk_live_..."
```

Card charges use the same statuses as Mobile Money:

| Status | Meaning |
|--------|---------|
| `pending` | Customer has not completed the CyberSource hosted payment yet |
| `succeeded` | CyberSource accepted the payment |
| `failed` | CyberSource rejected or could not complete the payment |
| `declined` | The card/payment was declined |

### Card handling rules

- Do not send card numbers, expiry dates, or CVV values to Malipo.
- Do not store the `next_action.params` as card data; they are signed CyberSource form fields for this payment attempt.
- Use the test card details only when the returned CyberSource URL is a sandbox or test URL.
- Use your webhook events or transaction retrieval to confirm payment before fulfilling an order.

## Retrieve a charge

`GET /v1/charges/{charge_id}`

Returns the charge object with current status.

## List charges

`GET /v1/charges`

Returns a paginated list of charges. Supports query parameters: `limit`, `offset`, `status`, `network`, `date_from`, `date_to`.
