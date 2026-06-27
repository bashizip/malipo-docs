---
title: Passer en production
draft: false
description: Complétez ces étapes pour activer votre compte live.
---

Complétez ces étapes pour activer votre compte live.

## Prérequis

- Intégration et tests sandbox complétés
- Documents d'enregistrement d'entreprise prêts
- Compte bancaire pour les paiements configuré
- Examen de conformité préparé (exigences BCC)

## Étapes d'activation

1. **Soumettre les documents KYC** — Enregistrement de l'entreprise, pièces d'identité des dirigeants, justificatif de domicile
2. **Configurer les paiements** — Ajoutez les coordonnées bancaires pour les règlements
3. **Examen de conformité** — Malipo examine votre demande (1-3 jours ouvrés)
4. **Approbation live** — Recevez la notification et générez les clés API live
5. **Passer en production** — Remplacez les clés de test par les clés live dans votre intégration

## Différences clés : Sandbox vs Live

| Aspect | Sandbox | Live |
|--------|---------|------|
| Préfixe clé API | `sk_test_...` | `sk_live_...` |
| Argent réel | Non | Oui |
| KYC requis | Non | Oui |
| Configuration paiement | Non | Oui |
| Limites de débit | Inférieures | Supérieures (selon le plan) |
| SLA de support | Meilleur effort | Selon le plan |

:::tip
Votre code d'intégration sandbox fonctionne sans changement en live — changez simplement la clé API.
:::
