---
title: B2C sandbox
description: Pay a customer's Mobile Money account from your merchant balance with the Node.js SDK candidate.
---

Your backend owns customer wallets and their accounting. Malipo stores approved beneficiaries and reserves your available merchant balance for a disbursement; a beneficiary has no Malipo wallet or balance.

:::caution[Sandbox candidate]
The B2C API is available for integration testing at `https://api-staging.malipo.dev/v1`. Node.js SDK `1.3.0-beta.1` is prepared and tested as a tarball; npm publication is pending. The registry's current stable package does not provide this candidate. Live B2C remains disabled.
:::

## Prepare your server

Use a dedicated staging sandbox server key beginning with `sk_test_`. Enable its B2C write permission in the merchant portal under **Finance → Disbursements**. Existing keys do not gain this permission automatically. Keep the key on your backend.

Install the candidate artifact supplied for testing, then save the example below as `b2c.mjs`. It needs Node.js 20 or later. The separate SQLite webhook acceptance tool needs Node.js 24.

```bash
npm install ./malipo-node-1.3.0-beta.1.tgz
node --env-file=.env b2c.mjs
```

Set `MALIPO_B2C_API_KEY` in your private `.env`. Never commit it. The example creates synthetic sandbox data, including a USD 30 charge and USD 20 withdrawal. Charge fees reduce the pending credit; only released funds can be withdrawn. Repeated runs create separate operations.

## Complete funding and withdrawal example

The special test phone forces a successful charge. No operator receives this sandbox request. The example then releases pending funds, approves a beneficiary and simulates a timeout followed by a late success.

```javascript
import Malipo from 'malipo-node';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

const apiKey = process.env.MALIPO_B2C_API_KEY;
if (!apiKey?.startsWith('sk_test_')) throw new Error('A sandbox MALIPO_B2C_API_KEY is required');
const client = new Malipo({ apiKey, baseUrl: 'https://api-staging.malipo.dev/v1' });
const run = randomUUID();
// Existing force-success sandbox phone. It is never sent to an operator.
let charge = await client.charges.create({ amount: 30, currency: 'USD', phone: '+243000000001', network: 'ORANGE_MONEY' }, { idempotencyKey: `b2c-funding-${run}` });
for (let attempt = 0; charge.status === 'pending' && attempt < 30; attempt++) {
  await delay(1000);
  charge = await client.transactions.retrieve(charge.id);
}
if (charge.status !== 'succeeded') throw new Error(`Funding charge ${charge.id}: ${charge.status}`);
await client.testing.release();
await client.testing.screenMerchant('cleared');
const beneficiary = await client.beneficiaries.create({ reference: `user-${run}`, name: 'Sandbox recipient', network: 'ORANGE_MONEY', msisdn: '243840000001' });
await client.testing.approveBeneficiary(beneficiary.id);
const params = { beneficiary_id: beneficiary.id, amount: '20.00', currency: 'USD', reference: `withdrawal-${run}` };
await client.testing.setDefaultScenario('timeout');
const payout = await client.disbursements.create(params, { idempotencyKey: `withdrawal-${run}` });
// Replay returns the same operation, not another debit.
const replay = await client.disbursements.create(params, { idempotencyKey: `withdrawal-${run}` });
if (replay.id !== payout.id) throw new Error('Replay returned a different operation');
await client.testing.run();
console.log(await client.disbursements.retrieve(payout.id)); // needs_review; funds remain reserved
await client.testing.result(payout.id, 'succeeded');
console.log(await client.disbursements.list({ reference: params.reference }));
console.log(await client.balance.retrieve());
await client.testing.setDefaultScenario('success');
```

Persist the reference, request body and idempotency key in your own database **before** sending a withdrawal. The random identifiers above are for isolated test runs. Reuse the saved identifiers when retrying the same customer withdrawal.

## Recover a lost response

```javascript
const found = await client.disbursements.list({ reference: savedReference });
const payout = found.data[0];
// If absent, resend the saved request with its original idempotency key.
// If present, retrieve its current status; never create a replacement withdrawal.
```

An identical key or reference and content returns the existing operation. Different content returns `409 idempotency_conflict`. Create amounts are decimal strings such as `"20.00"`, currency is `"USD"`, and idempotency is required. References and keys are at most 128 characters.

## Routes and states

| SDK method | Route |
|---|---|
| `beneficiaries.create/list` | `POST/GET /beneficiaries` |
| `beneficiaries.retrieve/update` | `GET/PATCH /beneficiaries/{id}` |
| `disbursements.create/list` | `POST/GET /disbursements` |
| `disbursements.retrieve` | `GET /disbursements/{id}` |
| `disbursements.cancel` | `POST /disbursements/{id}/cancel` |

List filters include `reference`, `status`, `page` and `page_size` (maximum 100). Responses contain `data` and `pagination`; reference filters stay within the authenticated merchant/key context. Unknown or foreign resources return 404; missing write permission returns 403.

`pending` reserves funds once. `processing` means the request was taken up. `needs_review` retains the reservation while the outcome is uncertain. `succeeded` never debits twice. Certain `failed` results or `cancelled` operations restore funds once. Cancellation succeeds only before worker pickup. Never release a customer reservation just because a request times out.

## Deterministic sandbox incidents

| Test | SDK call |
|---|---|
| Future payout outcome | `testing.setDefaultScenario('success' \| 'rejected' \| 'accepted' \| 'timeout')` |
| Process this key's jobs now | `testing.run()` |
| Late provider confirmation | `testing.result(id, 'succeeded')` |
| Resolve with simulated evidence | `testing.resolve(id, 'failed', 'synthetic-proof')` |
| Release pending USD | `testing.release()` |
| Merchant or recipient hold | `testing.holdMerchant(true)` / `testing.holdBeneficiary(id, true)` |
| Advance business time | `testing.advanceTime(86400)` |
| Renew screening | `testing.screenMerchant('cleared')` / `testing.screenBeneficiary(id, 'cleared')` |
| Replay an existing event | `testing.replayWebhook(id, 'payout.succeeded')` |

Configure the default scenario **before** creating a withdrawal. `accepted` stays processing; `timeout` becomes needs_review. A number change creates a pending beneficiary version; after approval it activates exactly 24 UTC hours later. The old version stays active until then, and existing withdrawals retain their recipient snapshot. Refresh screening after advancing time. Business time does not change authentication, webhook timestamps or worker leases.

Balances, beneficiaries, limits, jobs and events are isolated by sandbox key. `/testing/*` rejects live keys. Sandbox supports Orange Money and M-Pesa simulation in USD; CDF, Airtel and other SDKs are outside this release.

## Receive durable webhooks

B2C uses `payout.*`. Select `data.object.payout_kind === 'b2c'`, the expected `environment`, and `data.object.api_key_id` for your sandbox key: endpoint subscriptions are merchant-wide.

Require both `X-Webhook-Timestamp` and `X-Webhook-Signature`. Call `client.webhooks.constructEvent(rawBody, signature, endpointSecret, timestamp)` with the unmodified body; signatures expire after five real minutes. See [signature verification](/webhooks/).

Persist each event ID with a unique constraint and acknowledge only after durable storage. Apply customer wallet effects atomically with deduplication in your database. Replayed events keep their ID. Events can arrive twice or out of order: reconcile with `disbursements.retrieve(id)`, and never replace a terminal status with an older pending or processing event. Return a retryable failure if storage or reconciliation fails. Malipo retries delivery five times with backoff; request a replay after exhaustion.

The SQLite acceptance receiver in the SDK candidate source (`scripts/b2c-webhook-receiver.mjs`) demonstrates durable deduplication, restart recovery and reconciliation on synthetic data. Its tables are a testing example; integrate the same constraints with your own customer wallet ledger.

## Before live use

Live needs a separate approval and operator acceptance: merchant and beneficiary verification, residence, fresh sanctions screening, holds, available balance and shared payout limits all apply. Orange Money is qualified first, then M-Pesa separately. An operator acknowledgement is not proof of payment. No live date is promised by this sandbox preview.
