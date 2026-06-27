---
title: Reporting
draft: false
description: Access transaction reports and analytics.
---

Access transaction reports and analytics.

## Transaction report

`GET /v1/reports/transactions`

Returns a CSV or JSON report of transactions within a date range.

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date_from` | string (ISO 8601) | Yes | Start date (inclusive) |
| `date_to` | string (ISO 8601) | Yes | End date (inclusive) |
| `format` | string | No | `csv` or `json` (default: `json`) |
| `status` | string | No | Filter by transaction status |
| `network` | string | No | Filter by network |

## Settlement report

`GET /v1/reports/settlements`

Returns settlement details including fees, net amounts, and payout status.
