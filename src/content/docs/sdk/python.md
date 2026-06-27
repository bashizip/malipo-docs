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
from flask import Flask, request
from malipo import Malipo

app = Flask(__name__)
malipo = Malipo(api_key='...')

@app.route('/webhooks/malipo', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.get_data(as_text=True)

    try:
        event = malipo.webhooks.construct_event(
            payload=payload,
            signature=signature,
            secret='whsec_your_secret'
        )

        if event['type'] == 'charge.succeeded':
            charge = event['data']['object']
            print(f"Payment successful: {charge['id']}")

        return "OK", 200
    except Exception as e:
        return str(e), 400
```
