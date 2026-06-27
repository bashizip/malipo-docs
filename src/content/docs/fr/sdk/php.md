---
title: SDK PHP
draft: false
description: Guide d'intégration officiel PHP et Laravel pour Malipo.
---

Guide d'intégration officiel PHP et Laravel pour Malipo.

## Installation

```bash
composer require malipo/malipo-php
```

## Démarrage rapide

```php
<?php
require 'vendor/autoload.php';

use Malipo\Malipo;

$malipo = new Malipo(getenv('MALIPO_SECRET_KEY'));

try {
    $charge = $malipo->charges->create([
        "amount" => 10,
        "currency" => "USD",
        "phone" => "+243810000000",
        "network" => "VODACOM_MPESA",
        "description" => "Order #123"
    ], [
        'idempotencyKey' => 'unique_order_id_123'
    ]);

    echo "Paiement initié : " . $charge['id'];
} catch (\Exception $e) {
    echo "Erreur : " . $e->getMessage();
}
```

## Vérifier le solde

```php
$balance = $malipo->balance->retrieve();
echo "Disponible : " . $balance['available'][0]['amount'];
```

## Gestion des erreurs

```php
use Malipo\Exceptions\MalipoException;

try {
    $malipo->charges->create(['amount' => -1]);
} catch (MalipoException $e) {
    echo "Erreur API : " . $e->getMessage();
    echo "Code : " . $e->getStatusCode();
}
```

## Webhook

```php
<?php
require 'vendor/autoload.php';

use Malipo\Malipo;

$malipo = new Malipo(getenv('MALIPO_SECRET_KEY'));

$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'];

try {
    $event = $malipo->webhooks->constructEvent(
        $payload, $signature, getenv('MALIPO_WEBHOOK_SECRET')
    );

    if ($event['type'] === 'charge.succeeded') {
        $charge = $event['data']['object'];
    }
} catch (\Exception $e) {
    http_response_code(400);
    echo $e->getMessage();
}
```
