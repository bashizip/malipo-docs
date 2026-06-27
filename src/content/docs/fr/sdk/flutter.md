---
title: SDK Flutter
draft: false
description: Guide d'intégration officiel Flutter et Dart pour Malipo.
---

Guide d'intégration officiel Flutter et Dart pour Malipo.

## Installation

```bash
flutter pub add malipo
```

## Démarrage rapide

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

    print('ID du paiement : ${charge.id}');
    print('Statut : ${charge.status.value}');
  } catch (e) {
    print('Échec du paiement : $e');
  } finally {
    malipo.close();
  }
}
```

## Vérifier le solde

```dart
try {
  final balance = await malipo.balance.retrieve();
  print('Disponible : ${balance.available.first.amount} ${balance.available.first.currency}');
} catch (e) {
  print('Échec de la récupération du solde : $e');
}
```

## Gestion des erreurs

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
  print('Erreur API : ${e.message}');
  print('Code statut : ${e.statusCode}');
  print("Code d'erreur : ${e.errorCode}");
} catch (e) {
  print('Erreur inconnue : $e');
}
```

:::note
Les webhooks sont généralement reçus et vérifiés sur votre **serveur backend**. Utilisez les exemples Node.js, Python ou PHP pour mettre à jour l'état de votre application Flutter via Firebase, WebSockets ou notifications push.
:::
