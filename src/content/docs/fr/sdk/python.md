---
title: SDK Python
draft: false
description: Guide d'intégration officiel Python pour Malipo.
---

Guide d'intégration officiel Python pour Malipo.

## Installation

```bash
pip install malipo
```

## Démarrage rapide

```python
from malipo import Malipo

malipo = Malipo(api_key='sk_test_your_api_key')

charge = malipo.charges.create({
    "amount": 10,
    "currency": "USD",
    "phone": "+243810000000",
    "network": "VODACOM_MPESA",
    "description": "Order #123"
}, idempotency_key='unique_order_id_123')

print(f"Paiement initié : {charge['id']}")
```

## Vérifier le solde

```python
balance = malipo.balance.retrieve()
print(f"Disponible : {balance['available'][0]['amount']} {balance['available'][0]['currency']}")
```

## Gestion des erreurs

```python
from malipo import MalipoError

try:
    malipo.charges.create({"amount": -1})
except MalipoError as e:
    print(f"Erreur : {e.message}")
    print(f"Statut : {e.status_code}")
```

## Webhook (Flask)

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
            print(f"Paiement réussi : {charge['id']}")

        return "OK", 200
    except Exception as e:
        return str(e), 400
```
