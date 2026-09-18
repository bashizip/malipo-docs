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

:::caution[Nécessite malipo/malipo-php 1.0.3 ou une version ultérieure]
La version 1.0.2 et les précédentes ignorent purement et simplement le quatrième argument — PHP
abandonne silencieusement les arguments supplémentaires d'une fonction utilisateur — la
vérification retombe donc sur le schéma « corps seul » et chaque livraison en direct échoue avec
`Invalid webhook signature`. Vérifiez la version dans `composer.lock` et passez à 1.0.3 ou plus.
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
    // Nécessite malipo/malipo-php 1.0.3 ou une version ultérieure : les versions précédentes
    // ignorent l'argument d'horodatage et vérifient le corps seul, donc chaque livraison en
    // direct échoue avec « Invalid webhook signature ».
    // Conservez le corps brut. Le SDK vérifie la fenêtre temporelle (5 minutes par défaut)
    // et signe l'horodatage, un point, puis le payload brut lorsque l'en-tête est présent.
    $event = $malipo->webhooks->constructEvent(
        $payload, $signature, getenv('MALIPO_WEBHOOK_SECRET'), $timestamp
    );

    if ($event['type'] === 'charge.succeeded') {
        $charge = $event['data']['object'];
    }
} catch (\Exception $e) {
    http_response_code(400);
    echo $e->getMessage();
}
```
