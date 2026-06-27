---
title: Flutter SDK
draft: false
description: Official Flutter and Dart integration guide for the Malipo Payment Gateway.
---

Official Flutter and Dart integration guide for the Malipo Payment Gateway.

## Installation

```bash
flutter pub add malipo
```

## Quickstart

```dart
import 'package:malipo/malipo.dart';

void main() async {
  final malipo = Malipo(apiKey: 'sk_live_your_api_key');

  try {
    final charge = await malipo.charges.create(
      ChargeCreateParams(
        amount: 10.0,
        currency: 'USD',
        phone: '+243810000000',
        network: MalipoNetwork.vodacomMpesa,
        description: 'Order #123',
        payer: MalipoPayer(
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        ),
      ),
      idempotencyKey: 'unique_order_id_123',
    );

    print('Charge ID: ${charge.id}');
    print('Status: ${charge.status.value}');
  } catch (e) {
    print('Charge failed: $e');
  } finally {
    malipo.close();
  }
}
```

## Check Balance

```dart
try {
  final balance = await malipo.balance.retrieve();
  print('Available: ${balance.available.first.amount} ${balance.available.first.currency}');
} catch (e) {
  print('Failed to retrieve balance: $e');
}
```

## Error Handling

```dart
try {
  await malipo.charges.create(
    ChargeCreateParams(
      amount: -1.0,
      currency: 'USD',
      phone: '+243810000000',
      network: MalipoNetwork.vodacomMpesa,
    ),
  );
} on MalipoException catch (e) {
  print('API Error: ${e.message}');
  print('Status Code: ${e.statusCode}');
  print('Error Code: ${e.errorCode}');
} catch (e) {
  print('Unknown Error: $e');
}
```

:::note
Webhooks are typically received and verified on your **backend server**. Use the Node.js, Python, or PHP webhook examples when you need to update your Flutter app state through Firebase, WebSockets, or push notifications.
:::
