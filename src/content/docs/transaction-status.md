---
title: Transaction Status
draft: false
description: Understand the lifecycle of a transaction.
---

Understand the lifecycle of a transaction.

## Status values

| Status | Description |
|--------|-------------|
| `pending` | Charge initiated, awaiting customer action |
| `processing` | Customer authorized, transaction being processed |
| `succeeded` | Payment completed successfully |
| `failed` | Payment failed (see `failure_reason`) |
| `declined` | Customer declined or cancelled the payment |
| `expired` | Charge expired before completion |
| `refunded` | Charge was fully refunded |
| `partially_refunded` | Charge was partially refunded |

## Status flow

```
pending → processing → succeeded
              ↓              ↓
            failed        declined
              ↓
            expired
```

## Polling for status

For server-side integrations, poll the charge endpoint until a terminal state is reached:

```typescript
async function waitForCompletion(chargeId) {
  while (true) {
    const charge = await malipo.charges.retrieve(chargeId);
    if (["succeeded", "failed", "declined", "expired"].includes(charge.status)) {
      return charge;
    }
    await new Promise(r => setTimeout(r, 2000)); // 2s delay
  }
}
```

:::tip
Use webhooks instead of polling for production integrations — they're more efficient and reliable.
:::
