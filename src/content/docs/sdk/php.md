---
title: PHP SDK
draft: false
description: Official PHP and Laravel integration guide for the Malipo Payment Gateway.
---

Official PHP and Laravel integration guide for the Malipo Payment Gateway.

## Installation

```bash
composer require malipo/malipo-php
```

## Quickstart

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

    echo "Charge initiated: " . $charge['id'];
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

## Check Balance

```php
$balance = $malipo->balance->retrieve();
echo "Available: " . $balance['available'][0]['amount'];
```

## Error Handling

```php
use Malipo\Exceptions\MalipoException;

try {
    $malipo->charges->create(['amount' => -1]);
} catch (MalipoException $e) {
    echo "API Error: " . $e->getMessage();
    echo "Code: " . $e->getStatusCode();
}
```

## Webhook Handler

:::caution[Requires malipo/malipo-php 1.0.3 or later]
Version 1.0.2 and earlier ignores the fourth argument entirely — PHP silently discards extra
arguments passed to a user-defined function — so verification falls back to the body-only scheme
and every live delivery fails with `Invalid webhook signature`. Check the version in
`composer.lock` and upgrade to 1.0.3 or later.
:::

```php
<?php
require 'vendor/autoload.php';

use Malipo\Malipo;

$malipo = new Malipo(getenv('MALIPO_SECRET_KEY'));

$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'];
$timestamp = $_SERVER['HTTP_X_WEBHOOK_TIMESTAMP'] ?? null;

try {
    // Requires malipo/malipo-php 1.0.3 or later: earlier versions ignore the timestamp argument
    // and verify the body only, so every live delivery fails with "Invalid webhook signature".
    // Keep the raw body unchanged. The SDK validates the timestamp window (5 minutes by default)
    // and signs the timestamp plus a dot plus the raw payload when the timestamp header is present.
    $event = $malipo->webhooks->constructEvent(
        $payload,
        $signature,
        getenv('MALIPO_WEBHOOK_SECRET'),
        $timestamp
    );

    if ($event['type'] === 'charge.succeeded') {
        $charge = $event['data']['object'];
        // Process successful payment
    }
} catch (\Exception $e) {
    http_response_code(400);
    echo $e->getMessage();
}
```
