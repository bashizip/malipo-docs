---
title: Errors
draft: false
description: Complete list of error codes returned by the API.
---

Complete list of error codes returned by the API with their meanings and how to handle them.

## Authentication Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `authentication_required` | 401 | No API key provided |
| `invalid_api_key` | 401 | API key is invalid or revoked |
| `api_key_expired` | 401 | API key has expired |
| `insufficient_permissions` | 403 | API key lacks required permissions |

## Validation Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `validation_error` | 400 | Request body validation failed |
| `invalid_amount` | 400 | Amount must be a positive integer |
| `invalid_currency` | 400 | Unsupported currency code |
| `invalid_phone` | 400 | Phone number format is invalid |
| `invalid_network` | 400 | Unsupported network |

## Payment Errors

Payment errors return HTTP 200 with failure details in the response body. Check the `status` and `failure_reason` fields.

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `insufficient_funds` | 200 | Customer has insufficient balance |
| `declined` | 200 | Transaction declined by network or customer |
| `timeout` | 200 | Network timeout — retry or check status |
| `network_unavailable` | 200 | Mobile money network temporarily unavailable |
| `invalid_pin` | 200 | Customer entered incorrect PIN |
| `sim_not_found` | 200 | Phone number not registered on network |

## Server Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `internal_error` | 500 | Unexpected server error |
| `service_unavailable` | 503 | Service temporarily unavailable |

## Error Response Format

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request parameters",
    "details": [
      { "field": "amount", "message": "Amount must be greater than 0" }
    ]
  }
}
```
