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

:::caution[Nécessite malipo 1.0.2 ou une version ultérieure]
La version 1.0.1 et les précédentes n'ont pas de paramètre `timestamp` : elles ne calculent le HMAC
que sur le corps brut, donc passer un horodatage lève une `TypeError` et chaque livraison en direct
échoue à la vérification. Vérifiez votre version avec `pip show malipo` et passez à 1.0.2 ou plus.
:::

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
        # Nécessite malipo 1.0.2 ou une version ultérieure : les versions précédentes ignorent
        # l'argument d'horodatage et vérifient le corps seul, donc chaque livraison en direct
        # échoue avec « Invalid webhook signature ».
        # Conservez le corps brut. Le SDK vérifie la fenêtre temporelle (5 minutes par défaut)
        # et signe l'horodatage, un point, puis le payload brut lorsque l'en-tête est présent.
        event = malipo.webhooks.construct_event(
            payload=payload,
            signature=signature,
            secret=os.environ['MALIPO_WEBHOOK_SECRET'],
            timestamp=timestamp
        )

        if event['type'] == 'charge.succeeded':
            charge = event['data']['object']
            print(f"Paiement réussi : {charge['id']}")

        return "OK", 200
    except Exception as e:
        return str(e), 400
```
