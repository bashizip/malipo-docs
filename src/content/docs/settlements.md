---
title: Settlements
description: Understand when confirmed funds move from pending to available.
---

A successful live charge first adds the merchant net amount to **pending**. Under the default policy, the complete charge becomes eligible for release exactly **48 hours after finalization in UTC**, including weekends.

Eligible charges are grouped into traceable settlement batches. An active hold can delay release without changing the original eligibility date. Your dashboard separates eligible and non-eligible pending funds, shows the next availability date, and lists settlement history.

When a batch is released, its amount moves from **pending** to **available**. This does not automatically send money to a Mobile Money account. A payout remains a separate action requested by the merchant.

Listen for `settlement.available` to learn when a batch becomes available. The event contains the batch ID, amount, currency, number of source charges, available balance, and UTC release date.
