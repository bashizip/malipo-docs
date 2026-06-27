---
title: Java SDK
draft: false
description: Official Java integration guide for the Malipo Payment Gateway.
---

Official Java integration guide for the Malipo Payment Gateway.

## Installation

Add the dependency to your `pom.xml`:

```xml
<dependency>
  <groupId>com.malipo</groupId>
  <artifactId>malipo-java</artifactId>
  <version>1.0.1</version>
</dependency>
```

Or with Gradle:

```groovy
implementation 'com.malipo:malipo-java:1.0.1'
```

## Quickstart

```java
import com.malipo.Malipo;
import com.malipo.model.Charge;

Malipo malipo = new Malipo("sk_test_your_api_key");

Charge charge = malipo.charges.create()
    .amount(1000)
    .currency("CDF")
    .phone("+243810000000")
    .network("VODACOM_MPESA")
    .description("Order #123")
    .idempotencyKey("unique_order_id_123")
    .execute();

System.out.println("Charge ID: " + charge.getId());
System.out.println("Status: " + charge.getStatus());
```

## Check Balance

```java
Balance balance = malipo.balance.retrieve();
System.out.println("Available: " + balance.getAvailable().get(0).getAmount());
```

## Error Handling

```java
try {
    malipo.charges.create()
        .amount(-1)
        .execute();
} catch (MalipoException e) {
    System.err.println("Error: " + e.getMessage());
    System.err.println("Status Code: " + e.getStatusCode());
}
```
