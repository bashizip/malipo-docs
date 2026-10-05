---
title: B2C disbursements
description: Integrate B2C disbursements with the production Malipo API and the official Node.js SDK.
---

Your backend owns customer wallets and their accounting. Malipo stores approved beneficiaries and reserves your available merchant balance for a disbursement; a beneficiary has no Malipo wallet or balance.

## Service availability

Use the production API at `https://api.malipo.dev/v1`. B2C is available in **sandbox mode**, with a `sk_test_` server key: amounts, provider outcomes and beneficiary approvals are simulated, and no real money is sent. The API domain identifies the deployed service; the key identifies the transaction environment. Live B2C disbursements are not enabled.

The integration version is `malipo-node@1.3.0-beta.1`, published on npm. Pin this exact version to use `beneficiaries`, `disbursements` and `testing`. The npm `latest` tag currently points to `1.2.5`, which does not include these resources. See the [Node.js SDK reference](/sdk/node/).

## Prepare your server

Use your regular Malipo server API key, stored as `MALIPO_API_KEY`. For the current B2C service, use its sandbox form (`sk_test_`), managed in the [production merchant portal](https://malipo.dev/api-keys). The same key authenticates payments, balances, beneficiaries and disbursements. Enable its B2C write permission in the merchant portal under **Finance → Disbursements**. Existing keys do not gain this permission automatically. Keep the key on your backend.

Install the SDK, then save the complete example below as `b2c.mjs`. Use Node.js 20.6 or later for the `--env-file` command.

```bash
npm install malipo-node@1.3.0-beta.1
node --env-file=.env b2c.mjs
```

Set `MALIPO_API_KEY` in your private `.env`. Never commit it. The example creates synthetic sandbox data, including a USD 30 charge and USD 20 withdrawal. Charge fees reduce the pending credit; only released funds can be withdrawn. Repeated runs create separate operations.

## Complete funding and withdrawal example

The special test phone forces a successful charge. No operator receives this sandbox request. The example then releases pending funds, approves a beneficiary and simulates a timeout followed by a late success.

```javascript
import Malipo from 'malipo-node';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

const apiKey = process.env.MALIPO_API_KEY;
if (!apiKey?.startsWith('sk_test_')) throw new Error('A sandbox MALIPO_API_KEY is required');
const client = new Malipo({ apiKey }); // https://api.malipo.dev/v1
const run = randomUUID();
// Sandbox test phone: no request is sent to a real operator.
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

Disbursement lists support `reference`, `status`, `page` and `page_size` (maximum 100). Beneficiary lists support `page` and `page_size`. Responses contain `data` and `pagination`; reference filters stay within the authenticated merchant/key context. Unknown or foreign resources return 404; missing write permission returns 403.

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

See the [Node.js webhook integration](/sdk/node/#webhooks) for signature verification and durable event handling. Your application owns event storage and customer wallet accounting.

## Live B2C availability

Live needs a separate approval and operator acceptance: merchant and beneficiary verification, residence, fresh sanctions screening, holds, available balance and shared payout limits all apply. Orange Money is qualified first, then M-Pesa separately. An operator acknowledgement is not proof of payment. Keep your B2C integration on sandbox keys until Malipo enables live disbursements for your merchant.
