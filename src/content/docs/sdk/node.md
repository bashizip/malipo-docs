---
title: Node.js SDK
draft: false
description: Official Malipo Node.js and TypeScript reference for payments, B2C disbursements and webhooks.
---

The official Node.js SDK connects your backend to the Malipo production API at `https://api.malipo.dev/v1`. It supports payments, refunds, hosted checkout, balances, beneficiaries, B2C disbursements and webhook verification.

This reference covers the published **`malipo-node@1.3.0-beta.2`** package. B2C is available in sandbox with `sk_test_` keys. Existing live payment services use `sk_live_` keys; live B2C disbursements are not enabled. Your backend owns customer wallets and their accounting.

The new `beta.2` B2C features (CDF, fees, batches, cursors and archival) are available at `https://api-staging.malipo.dev/v1` with dedicated staging keys. Production promotion is separate from SDK publication.

## Installation

Use Node.js 20 or later. Pin the version below to include B2C resources; npm `latest` currently points to `1.2.5`, which does not include them.

```bash
npm install malipo-node@1.3.0-beta.2
# Yarn
yarn add malipo-node@1.3.0-beta.2
# pnpm
pnpm add malipo-node@1.3.0-beta.2
```

## Initialize the client

Store your regular Malipo server API key in `MALIPO_API_KEY`. Manage it in the [merchant portal](https://malipo.dev/api-keys). The same key is used for payments and B2C; enable its B2C write permission when using disbursements. Never expose a secret key in browser or mobile code.

```javascript
import { Malipo } from 'malipo-node';

const apiKey = process.env.MALIPO_API_KEY;
if (!apiKey) throw new Error('MALIPO_API_KEY is required');
const malipo = new Malipo({ apiKey });
```

ES modules support both `import { Malipo }` and `import Malipo`. CommonJS is also supported:

```javascript
const { Malipo } = require('malipo-node');
const malipo = new Malipo({ apiKey: process.env.MALIPO_API_KEY });
```

| Option | Type | Behavior |
|---|---|---|
| `apiKey` | `string` | Required server secret key. |
| `environment` | `'sandbox'` or `'live'` | Inferred from the key prefix when omitted. Keep it consistent with the key. |
| `baseUrl` | `string` | Defaults to `https://api.malipo.dev/v1`; custom values must include `/v1` without a trailing slash. |

Sandbox and live keys use the same production API domain. Sandbox operations simulate money movement; live payment operations move real money. Credentials and data from a separate staging deployment cannot be reused on production.

## Idempotency and amounts

Save each business operation's parameters and idempotency key before sending it. After a lost response, retry the same operation with the same key and body.

- Charges and refunds require `idempotencyKey` in live. Supply it in sandbox too to test retries.
- B2C `disbursements.create` requires `idempotencyKey` for every request, including sandbox. Keys and client references have a maximum length of 128 characters. A divergent replay returns HTTP `409`.
- Charges, refunds and checkout amounts are numbers. B2C amounts are decimal strings such as `'20.00'`, with `currency: 'USD'`.

## Charges

`charges.create(params, { idempotencyKey })` initiates a Mobile Money charge. This example uses a sandbox success-test phone; use it with a `sk_test_` key. In live, provide the customer's actual phone number.

```javascript
const charge = await malipo.charges.create({
  amount: 30,
  currency: 'USD',
  phone: '+243000000001',
  network: 'ORANGE_MONEY',
  description: 'Order #789',
  metadata: { order_id: '789' },
  payer: {
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane.doe@example.com',
  },
}, { idempotencyKey: 'order-789' });

console.log(charge.id, charge.status);
```

`ChargeCreateParams` requires `amount`, `currency`, `phone` and `network`. Optional fields are `description`, `metadata` and `payer` (first name, last name and email). Networks are `VODACOM_MPESA`, `ORANGE_MONEY` and `AIRTEL_MONEY`. Live charges use USD; sandbox charges support USD or CDF. Check the final status before fulfilling an order.

## Refunds

`refunds.create(params, { idempotencyKey })` refunds a successful charge. Omit `amount` for a full refund; include it for a partial refund. `reason` and `metadata` are optional.

```javascript
const refund = await malipo.refunds.create({
  charge_id: charge.id,
  amount: 5,
  reason: 'Customer return',
}, { idempotencyKey: 'refund-order-789' });
console.log(refund.id, refund.status);
```

## Hosted checkout

`checkoutSessions.create(params)` returns a hosted payment URL. Redirect the customer to the returned `session.url`, and confirm payment through a webhook or the API rather than trusting a browser redirect.

```javascript
const session = await malipo.checkoutSessions.create({
  amount: 25,
  currency: 'USD',
  description: 'Premium subscription',
  redirect_url: 'https://your-shop.example/payment-return',
  metadata: { order_id: 'subscription-456' },
});
console.log(session.url);
```

`amount` and `currency` are required. `description`, `redirect_url`, `metadata` and `expires_at` (ISO 8601) are optional.

## Transaction status and merchant balance

`transactions.retrieve(id)` retrieves a charge or refund. B2C statuses use `disbursements.retrieve(id)`. `balance.retrieve()` returns `available` and `pending` arrays for the key's environment.

```javascript
const transaction = await malipo.transactions.retrieve(charge.id);
console.log(transaction.status);

const balance = await malipo.balance.retrieve();
for (const item of balance.available) {
  console.log(item.currency, item.amount);
}
```

Only available merchant funds can finance a B2C disbursement. For a complete funding and release example, see [B2C disbursements](/b2c/).

## Beneficiaries

Enable the key's explicit B2C write permission in **Finance → Disbursements** in the merchant portal. Existing keys do not receive it automatically.

`beneficiaries.create` requires `reference`, `name`, `network` and `msisdn`. B2C networks are `ORANGE_MONEY` and `VODACOM_MPESA`. Creation registers a recipient, not a customer wallet. A beneficiary must have an approved active version before a disbursement. Sandbox approval is available through `testing.approveBeneficiary`.

```javascript
const beneficiary = await malipo.beneficiaries.create({
  reference: 'customer-123',
  name: 'Example recipient',
  network: 'ORANGE_MONEY',
  msisdn: '243840000001',
});
await malipo.testing.approveBeneficiary(beneficiary.id);

const recipient = await malipo.beneficiaries.retrieve(beneficiary.id);
console.log(recipient.active_version_id, recipient.versions);
```

`beneficiaries.update(id, changes)` sends a PATCH request. Changes may include `name`, `network` and `msisdn`; the client reference cannot be changed. A number change creates a pending version. After approval, it becomes effective exactly 24 UTC hours later; the old version remains active until then. Each existing disbursement keeps its original recipient snapshot.

```javascript
const updated = await malipo.beneficiaries.update(beneficiary.id, {
  msisdn: '243840000002',
});
await malipo.testing.approveBeneficiary(updated.id);
await malipo.testing.advanceTime(86400);
await malipo.testing.screenMerchant('cleared');
await malipo.testing.screenBeneficiary(updated.id, 'cleared');
```

Beneficiary versions expose `status`, `effective_from`, `identity_status`, `residence_status` and `masked_msisdn`. Responses mask recipient numbers. Beneficiaries and balances are isolated by sandbox key.

## B2C disbursements

`disbursements.create(params, { idempotencyKey })` requires an approved `beneficiary_id`, an `amount` decimal string, `currency: 'USD'` and your unique client `reference`. Fund and release the sandbox balance first using the [complete B2C example](/b2c/#complete-funding-and-withdrawal-example).

```javascript
const params = {
  beneficiary_id: beneficiary.id,
  amount: '20.00',
  currency: 'USD',
  reference: 'withdrawal-123',
};
const payout = await malipo.disbursements.create(params, {
  idempotencyKey: 'withdrawal-123',
});
console.log(payout.id, payout.status, payout.destination.masked_msisdn);

const current = await malipo.disbursements.retrieve(payout.id);
console.log(current.status, current.next_action);
```

Save `params` and the idempotency key in your database before submission. To recover a lost response, search by the saved reference or resend the saved request with its original key:

```javascript
const found = await malipo.disbursements.list({ reference: params.reference });
const recovered = found.data[0] ?? await malipo.disbursements.create(params, {
  idempotencyKey: 'withdrawal-123',
});
console.log(recovered.id, recovered.status);
```

| Status | Meaning |
|---|---|
| `pending` | Funds reserved once; waiting for pickup. |
| `processing` | Execution has started. |
| `needs_review` | Outcome uncertain; funds remain reserved. |
| `succeeded` | Confirmed success; no second debit. |
| `failed` | Certain failure; reservation returned once. |
| `cancelled` | Cancelled before pickup; reservation returned once. |

### Lists and pagination

Both resources accept `page` and `page_size` (maximum 100). Disbursement lists also accept `reference` and `status`. Results contain `data` and `pagination`; the SDK returns one page per call.

```javascript
const beneficiaries = await malipo.beneficiaries.list({ page: 1, page_size: 25 });
const disbursements = await malipo.disbursements.list({
  status: 'succeeded',
  page: 1,
  page_size: 25,
});
console.log(disbursements.data);
console.log(disbursements.pagination); // { page, page_size, total }
```

### Cancellation

Cancel before worker pickup. If execution has started, cancellation is refused; retrieve the current status. A timeout alone does not permit refunding a customer wallet or creating a replacement disbursement.

```javascript
const cancelled = await malipo.disbursements.cancel(payout.id);
console.log(cancelled.status);
```

## Sandbox testing tools

`testing.*` is available with sandbox keys on the production API and rejected for live keys. It operates only on the authenticated sandbox key's context.

| Method | Arguments / purpose |
|---|---|
| `release()` | Release this key's pending USD into its available balance. |
| `approveBeneficiary(id)` / `rejectBeneficiary(id)` | Approve or reject a pending beneficiary version. |
| `reviewBeneficiary(id, versionId, review)` | `review`: `identity_status`, `residence_status` (`pending`, `approved`, `rejected`) and `proof`. |
| `screenMerchant(status)` / `screenBeneficiary(id, status)` | Sanctions result: `cleared`, `blocked` or `unavailable`. |
| `holdMerchant(held)` / `holdBeneficiary(id, held)` / `holdDisbursement(id, held)` | Set or clear a hold with a boolean. |
| `setLimits(limits)` | `minimum_minor`, `maximum_minor`, `daily_minor`, `monthly_minor`; integers in USD cents. |
| `advanceTime(seconds)` | Advance this key's business clock. |
| `setDefaultScenario(scenario)` | Set `success`, `rejected`, `accepted` or `timeout` before creating a disbursement. |
| `scenario(id, scenario)` | Select an outcome before worker pickup. |
| `run()` | Process eligible jobs for this key. |
| `result(id, status)` | Record `succeeded`, `failed` or `needs_review`, including a late result. |
| `resolve(id, status, proof)` | Resolve to `succeeded` or `failed` with simulated evidence. |
| `replayWebhook(id, eventType, delaySeconds?)` | Replay an existing `payout.*` event; delay defaults to zero. |

Configure the scenario before creation. `accepted` stays `processing`; `timeout` becomes `needs_review`. Advancing business time does not change authentication, webhook timestamps or worker leases. Refresh merchant and beneficiary screening after a large clock advance. See [deterministic sandbox scenarios](/b2c/#deterministic-sandbox-incidents).

## Webhooks

Register an HTTPS endpoint and keep its signing secret on your backend. Install Express if you use the adapter below (`npm install express`). Register the raw-body route **before** `express.json()`. Require both signature headers and pass the unchanged body to `webhooks.constructEvent`; the default timestamp tolerance is five real minutes.

The example imports `persistWebhook` from **your application**. Implement that function in `webhook-inbox.js` to durably store the complete event under a unique `event.id` and schedule processing in the same transaction. An already stored ID must succeed without scheduling another effect. It is not a method provided by Malipo.

```javascript
import express from 'express';
import { Malipo } from 'malipo-node';
import { persistWebhook } from './webhook-inbox.js';

const app = express();
const apiKey = process.env.MALIPO_API_KEY;
const endpointSecret = process.env.MALIPO_WEBHOOK_SECRET;
if (!apiKey || !endpointSecret) throw new Error('Missing Malipo configuration');
const malipo = new Malipo({ apiKey });

app.post('/webhooks/malipo', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.header('x-webhook-signature');
  const timestamp = req.header('x-webhook-timestamp');
  if (!signature || !timestamp) return res.sendStatus(400);

  let event;
  try {
    event = malipo.webhooks.constructEvent(
      req.body.toString('utf8'), signature, endpointSecret, timestamp,
    );
  } catch {
    return res.sendStatus(400);
  }

  try {
    await persistWebhook(event);
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(503);
  }
});

app.use(express.json());
app.listen(3000);
```

Your processing worker must:

1. Filter the expected `environment`. For B2C, also check `data.object.payout_kind === 'b2c'` and the expected sandbox `api_key_id`: endpoint subscriptions cover the merchant.
2. Retrieve the canonical status with `disbursements.retrieve(id)` for B2C or `transactions.retrieve(id)` for charges/refunds before applying an effect.
3. Apply customer wallet changes atomically with durable deduplication in your database; never replace a terminal outcome with an older event.

B2C events use `payout.*`. Duplicates and out-of-order delivery are possible. Return 200 only after durable event storage; return a retryable failure when storage fails. See [webhook delivery and verification](/webhooks/) and [B2C webhook handling](/b2c/#receive-durable-webhooks).

## Error handling

API failures throw `MalipoError`, exposing `message`, `status`, `code` and `details`. Network failures and signature verification failures can throw ordinary errors.

```javascript
import { MalipoError } from 'malipo-node';

try {
  await malipo.disbursements.create(params, { idempotencyKey: 'withdrawal-123' });
} catch (error) {
  if (error instanceof MalipoError) {
    console.error(error.status, error.code, error.message);
  } else {
    throw error;
  }
}
```

HTTP 403 can indicate a missing B2C write grant; 404 covers unknown or inaccessible resources; 409 indicates a conflict. Correct a conflict rather than issuing a new withdrawal. For an uncertain network result, use the saved reference and idempotency key to recover the existing operation. Do not log secret keys, raw recipient numbers or unfiltered error details.

## TypeScript

The package includes ESM and CommonJS type declarations. Types are exported from `malipo-node`:

```typescript
import { Malipo } from 'malipo-node';
import type {
  DisbursementCreateParams,
  MalipoDisbursement,
  MalipoBeneficiary,
  B2CPage,
} from 'malipo-node';

const apiKey = process.env.MALIPO_API_KEY;
if (!apiKey) throw new Error('MALIPO_API_KEY is required');
const malipo = new Malipo({ apiKey });
const params: DisbursementCreateParams = {
  beneficiary_id: 'beneficiary-id',
  amount: '20.00',
  currency: 'USD',
  reference: 'withdrawal-123',
};
const payout: MalipoDisbursement = await malipo.disbursements.create(params, {
  idempotencyKey: 'withdrawal-123',
});
const page: B2CPage<MalipoBeneficiary> = await malipo.beneficiaries.list();
```

Other exported types include `ChargeCreateParams`, `RefundCreateParams`, `CheckoutSessionCreateParams`, `MalipoTransaction`, `MalipoRefund`, `MalipoBalance`, `BeneficiaryCreateParams`, `DisbursementStatus`, `SandboxPayoutScenario` and `MalipoEvent`.

## Related guides

- [Complete B2C integration](/b2c/)
- [API authentication](/authentication/)
- [Idempotency](/idempotency/)
- [SDK source and README](https://github.com/bashizip/malipo-sdks/tree/main/malipo-node)

## B2C beta.2 remediation

The 7 October 2026 acceptance covers deployed staging routes, per-action screening, frozen fee quotes, separate USD/CDF balances, batches, cursors and archiving. Live remains subject to operator qualification and merchant/network/currency activation. See the [B2C guide](/b2c/).

```typescript
const stagingApiKey = process.env.MALIPO_STAGING_API_KEY;
if (!stagingApiKey?.startsWith('sk_test_')) throw new Error('A staging sandbox key is required');
const b2c = new Malipo({ apiKey: stagingApiKey, baseUrl: 'https://api-staging.malipo.dev/v1' });
await b2c.testing.setLimits({ minimum_minor: 1, maximum_minor: 1000000, daily_minor: 5000000, monthly_minor: 100000000 });
const quote = await b2c.disbursements.quote({ beneficiary_id, reference, amount: '1000', currency: 'CDF' });
const balances = await b2c.disbursements.balance();
const page = await b2c.disbursements.list({ page_size: 25, include_total: true });
const next = page.pagination.next_cursor
  ? await b2c.disbursements.list({ starting_after: page.pagination.next_cursor, page_size: 25 })
  : null;
const batch = await b2c.disbursements.createBatch(rows, { idempotencyKey: 'withdrawals-20261007' });
const status = await b2c.disbursements.retrieveBatch(batch.id);
await b2c.beneficiaries.archive(beneficiary_id);
```

USD uses two decimal places and CDF integer strings. Explicitly publish a policy before new sandbox requests using `testing.setLimits(...)`; batches support at most 500 lines with individual results. An archive blocks new requests and preserves existing reads/replays.
