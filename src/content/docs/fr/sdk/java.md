---
title: SDK Java
draft: false
description: Guide d'intégration officiel Java pour Malipo.
---

Guide d'intégration officiel Java pour Malipo.

## Installation

Ajoutez la dépendance à votre `pom.xml` :

```xml
<dependency>
  <groupId>com.malipo</groupId>
  <artifactId>malipo-java</artifactId>
  <version>1.0.1</version>
</dependency>
```

Ou avec Gradle :

```groovy
implementation 'com.malipo:malipo-java:1.0.1'
```

## Démarrage rapide

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

System.out.println("ID du paiement : " + charge.getId());
System.out.println("Statut : " + charge.getStatus());
```

## Vérifier le solde

```java
Balance balance = malipo.balance.retrieve();
System.out.println("Disponible : " + balance.getAvailable().get(0).getAmount());
```

## Gestion des erreurs

```java
try {
    malipo.charges.create().amount(-1).execute();
} catch (MalipoException e) {
    System.err.println("Erreur : " + e.getMessage());
    System.err.println("Code statut : " + e.getStatusCode());
}
```
