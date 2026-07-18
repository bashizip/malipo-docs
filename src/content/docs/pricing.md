---
title: Pricing
description: Understand dynamic pricing, limits, and transaction snapshots.
---

Malipo pricing is configured by administrators and becomes effective at a precise UTC date. You do not need to update or rebuild your integration when a rate changes.

## Plans

- **Starter** starts at **3.5%**, with no fixed fee and an initial **USD 500 monthly live-volume limit** per merchant.
- **Growth** and **Enterprise** are negotiated per merchant according to volume and needs.
- A general rate can have card or Mobile Money overrides.

The dashboard is the source of truth for your current contract, its next version, and monthly used or reserved volume. Limits are counted from the first day of the month at `00:00:00 UTC`.

## Transaction snapshot

Each live charge keeps the plan, version, applied rule, gross amount, fee, and merchant net amount used when the charge was created. A later pricing change never modifies an existing charge.

Final charge responses and webhooks can include `fee_amount`, `net_amount`, and the `pricing` object. Amounts use the smallest currency unit unless an endpoint explicitly states otherwise.

:::note
Sandbox uses the same pricing calculation for simulation but does not consume your live monthly limit.
:::
