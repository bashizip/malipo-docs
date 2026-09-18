---
title: Python SDK
draft: false
description: Official Python integration guide for the Malipo Payment Gateway.
---

Official Python integration guide for the Malipo Payment Gateway.

## Installation

```bash
pip install malipo
```

## Quickstart

```python
from malipo import Malipo

malipo = Malipo(api_key='sk_test_your_api_key')

# Create a charge
charge = malipo.charges.create({
    "amount": 10,
    "currency": "USD",
    "phone": "+243810000000",
    "network": "VODACOM_MPESA",
    "description": "Order #123"
}, idempotency_key='unique_order_id_123')

print(f"Charge initiated: {charge['id']}")
```

## Check Balance

```python
balance = malipo.balance.retrieve()
print(f"Available: {balance['available'][0]['amount']} {balance['available'][0]['currency']}")
```

## Error Handling

```python
from malipo import MalipoError

try:
    malipo.charges.create({"amount": -1})
except MalipoError as e:
    print(f"Error: {e.message}")
    print(f"Status: {e.status_code}")
```

## Webhook Handler (Flask)

```python
import os
from flask import Flask, request
from malipo import Malipo

app = Flask(__name__)
malipo = Malipo(api_key='...')

@app.route('/webhooks/malipo', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Webhook-Signature')
    timestamp = request.headers.get('X-Webhook-Timestamp')
    payload = request.get_data(as_text=True)

    try:
        # Keep the raw body unchanged. The SDK validates the timestamp window (5 minutes by default)
        # and signs the timestamp plus a dot plus the raw payload when the timestamp header is present.
        event = malipo.webhooks.construct_event(
            payload=payload,
            signature=signature,
            secret=os.environ['MALIPO_WEBHOOK_SECRET'],
            timestamp=timestamp
        )

        if event['type'] == 'charge.succeeded':
            charge = event['data']['object']
            print(f"Payment successful: {charge['id']}")

        return "OK", 200
    except Exception as e:
        return str(e), 400
```
