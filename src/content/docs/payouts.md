---
title: Payouts
description: Request and track payouts to an approved Mobile Money destination.
---

A payout transfers part of your **available** USD balance to an approved Mobile Money destination. Malipo never creates scheduled payouts automatically: every request is initiated by the merchant.

## Before requesting

- Live access must be approved.
- A payout policy and an active destination must exist.
- The request must respect the policy’s amount, daily, and monthly limits.
- Send a unique `Idempotency-Key` with each creation request.

The amount is reserved immediately. Depending on the active policy, the request is reviewed by an owner or sent automatically below a configured threshold. No payout fee is charged to the merchant.

| Status | Meaning |
|---|---|
| `pending` | Funds reserved; waiting for review or dispatch |
| `processing` | Sent to or accepted by the provider |
| `succeeded` | External payment confirmed |
| `failed` | Certain failure; funds returned once |
| `cancelled` | Cancelled before dispatch; funds returned once |
| `needs_review` | Uncertain provider result; funds stay reserved |

You can cancel only before provider processing starts. Destination changes require owner approval and become active exactly 24 hours later in UTC. Existing requests keep their original masked destination snapshot.
