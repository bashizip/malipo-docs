---
title: Versements B2C
description: Intégrer les versements B2C avec l’API production Malipo et le SDK Node.js officiel.
---

Votre backend gère les wallets clients et leur comptabilité. Malipo conserve les bénéficiaires approuvés et réserve votre solde marchand disponible pour un versement ; un bénéficiaire n'a aucun wallet ni solde Malipo.

## Disponibilité du service

Utilisez l’API production `https://api.malipo.dev/v1`. Le B2C est disponible en **mode sandbox**, avec une clé serveur `sk_test_` : montants, résultats opérateur et approbations des bénéficiaires sont simulés, sans envoi d’argent réel. Le domaine API désigne le service déployé ; la clé détermine l’environnement des opérations. Les versements B2C live ne sont pas activés.

La version d’intégration est `malipo-node@1.3.0-beta.1`, publiée sur npm. Installez cette version exacte pour utiliser `beneficiaries`, `disbursements` et `testing`. Le tag npm `latest` pointe actuellement sur `1.2.5`, qui ne contient pas ces ressources. Consultez la [référence du SDK Node.js](/fr/sdk/node/).

## Préparer votre serveur

Utilisez votre clé API serveur Malipo habituelle, enregistrée dans `MALIPO_API_KEY`. Pour le service B2C actuel, utilisez sa forme sandbox (`sk_test_`), gérée dans le [portail marchand production](https://malipo.dev/api-keys). La même clé authentifie paiements, soldes, bénéficiaires et versements. Activez sa permission d'écriture B2C dans le portail marchand, **Finance → Versements utilisateurs**. Les anciennes clés ne reçoivent pas automatiquement ce droit. Gardez la clé dans votre backend.

Installez le SDK, puis enregistrez l’exemple complet ci-dessous dans `b2c.mjs`. Utilisez Node.js 20.6 ou plus pour la commande `--env-file`.

```bash
npm install malipo-node@1.3.0-beta.1
node --env-file=.env b2c.mjs
```

Définissez `MALIPO_API_KEY` dans votre `.env` privé, sans le commiter. L'exemple crée des données sandbox synthétiques, dont une charge de 30 USD et un retrait de 20 USD. Les frais de charge réduisent le crédit en attente ; seuls les fonds libérés sont disponibles. Chaque exécution crée des opérations distinctes.

## Exemple complet de financement et versement

Le numéro spécial de test force une charge réussie ; aucun opérateur ne reçoit cette demande sandbox. L'exemple libère ensuite les fonds, approuve un bénéficiaire et simule un timeout suivi d'une confirmation tardive.

```javascript
import Malipo from 'malipo-node';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

const apiKey = process.env.MALIPO_API_KEY;
if (!apiKey?.startsWith('sk_test_')) throw new Error('A sandbox MALIPO_API_KEY is required');
const client = new Malipo({ apiKey }); // https://api.malipo.dev/v1
const run = randomUUID();
// Sandbox test phone: no request is sent to a real operator.
let charge = await client.charges.create({ amount: 30, currency: 'USD', phone: '+243000000001', network: 'ORANGE_MONEY' }, { idempotencyKey: `b2c-funding-${run}` });
for (let attempt = 0; charge.status === 'pending' && attempt < 30; attempt++) {
  await delay(1000);
  charge = await client.transactions.retrieve(charge.id);
}
if (charge.status !== 'succeeded') throw new Error(`Funding charge ${charge.id}: ${charge.status}`);
await client.testing.release();
await client.testing.screenMerchant('cleared');
const beneficiary = await client.beneficiaries.create({ reference: `user-${run}`, name: 'Sandbox recipient', network: 'ORANGE_MONEY', msisdn: '243840000001' });
await client.testing.approveBeneficiary(beneficiary.id);
const params = { beneficiary_id: beneficiary.id, amount: '20.00', currency: 'USD', reference: `withdrawal-${run}` };
await client.testing.setDefaultScenario('timeout');
const payout = await client.disbursements.create(params, { idempotencyKey: `withdrawal-${run}` });
// Replay returns the same operation, not another debit.
const replay = await client.disbursements.create(params, { idempotencyKey: `withdrawal-${run}` });
if (replay.id !== payout.id) throw new Error('Replay returned a different operation');
await client.testing.run();
console.log(await client.disbursements.retrieve(payout.id)); // needs_review; funds remain reserved
await client.testing.result(payout.id, 'succeeded');
console.log(await client.disbursements.list({ reference: params.reference }));
console.log(await client.balance.retrieve());
await client.testing.setDefaultScenario('success');
```

Enregistrez la référence, le corps de requête et la clé d'idempotence dans votre base **avant** d'envoyer un retrait. Les identifiants aléatoires ci-dessus servent aux exécutions de test isolées. Réutilisez les identifiants enregistrés lors d'une reprise du même retrait client.

## Retrouver une réponse perdue

```javascript
const found = await client.disbursements.list({ reference: savedReference });
const payout = found.data[0];
// Si absent, renvoyer la requête enregistrée avec sa clé d'idempotence initiale.
// Si présent, consulter son statut actuel ; ne pas créer un retrait de remplacement.
```

Une clé ou référence identique avec le même contenu retourne l'opération existante. Un contenu différent retourne `409 idempotency_conflict`. Les montants sont des chaînes décimales comme `"20.00"`, la devise est `"USD"`, et l'idempotence est obligatoire. Références et clés : 128 caractères maximum.

## Routes et états

| Méthode SDK | Route |
|---|---|
| `beneficiaries.create/list` | `POST/GET /beneficiaries` |
| `beneficiaries.retrieve/update` | `GET/PATCH /beneficiaries/{id}` |
| `disbursements.create/list` | `POST/GET /disbursements` |
| `disbursements.retrieve` | `GET /disbursements/{id}` |
| `disbursements.cancel` | `POST /disbursements/{id}/cancel` |

Les listes de versements acceptent `reference`, `status`, `page` et `page_size` (100 maximum). Les listes de bénéficiaires acceptent `page` et `page_size`. La réponse contient `data` et `pagination` ; la recherche reste dans le contexte marchand/clé authentifié. Ressource inconnue ou étrangère : 404 ; permission d'écriture absente : 403.

`pending` réserve les fonds une seule fois. `processing` indique la prise en charge. `needs_review` conserve la réservation pendant l'incertitude. `succeeded` ne redébite jamais. Un échec certain `failed` ou une annulation `cancelled` restitue les fonds une seule fois. L'annulation est possible avant la prise en charge par le worker. Un timeout ne justifie pas la libération d'une réservation client.

## Incidents sandbox déterministes

| Test | Appel SDK |
|---|---|
| Résultat des prochains versements | `testing.setDefaultScenario('success' \| 'rejected' \| 'accepted' \| 'timeout')` |
| Traiter immédiatement les jobs de la clé | `testing.run()` |
| Confirmation prestataire tardive | `testing.result(id, 'succeeded')` |
| Résolution avec preuve simulée | `testing.resolve(id, 'failed', 'synthetic-proof')` |
| Libérer les USD en attente | `testing.release()` |
| Hold marchand ou bénéficiaire | `testing.holdMerchant(true)` / `testing.holdBeneficiary(id, true)` |
| Avancer l'heure métier | `testing.advanceTime(86400)` |
| Renouveler le screening | `testing.screenMerchant('cleared')` / `testing.screenBeneficiary(id, 'cleared')` |
| Rejouer un événement existant | `testing.replayWebhook(id, 'payout.succeeded')` |

Configurez le scénario par défaut **avant** de créer un versement. `accepted` reste processing ; `timeout` devient needs_review. Un changement de numéro crée une version en attente ; après approbation, elle devient active exactement 24 heures UTC plus tard. L'ancienne version reste active jusque-là et chaque versement conserve son destinataire figé. Renouvelez le screening après avoir avancé le temps. L'heure métier ne modifie ni l'authentification, ni les signatures, ni les leases workers.

Soldes, bénéficiaires, plafonds, jobs et événements sont isolés par clé sandbox. `/testing/*` refuse les clés live. La sandbox simule Orange Money et M-Pesa en USD ; CDF, Airtel et les autres SDK restent hors périmètre.

## Recevoir les webhooks durablement

Le B2C utilise `payout.*`. Filtrez `data.object.payout_kind === 'b2c'`, l'`environment` attendu et `data.object.api_key_id` de votre clé sandbox : les abonnements d'un endpoint couvrent le marchand.

Exigez `X-Webhook-Timestamp` et `X-Webhook-Signature`. Appelez `client.webhooks.constructEvent(rawBody, signature, endpointSecret, timestamp)` avec le corps inchangé ; les signatures expirent après cinq minutes réelles. Voir [la vérification des signatures](/fr/webhooks/).

Persistez chaque identifiant d'événement avec une contrainte unique et acquittez uniquement après stockage durable. Appliquez les effets sur vos wallets atomiquement avec la déduplication dans votre base. Un replay garde le même ID. Des doublons ou événements désordonnés sont possibles : rapprochez avec `disbursements.retrieve(id)` et ne remplacez jamais un état terminal par un ancien événement pending ou processing. Retournez une erreur permettant la reprise si le stockage ou la consultation échoue. Malipo effectue cinq tentatives avec backoff ; demandez un replay après épuisement.

Consultez l’[intégration des webhooks avec Node.js](/fr/sdk/node/#webhooks) pour vérifier les signatures et conserver durablement les événements. Le stockage des événements et la comptabilité des wallets clients appartiennent à votre application.

## Disponibilité du B2C live

Le live nécessite une approbation et une recette opérateur distinctes : vérifications marchand/bénéficiaire, résidence, sanctions fraîches, holds, solde disponible et plafonds partagés s'appliquent. Orange Money est qualifié en premier, puis M-Pesa séparément. Un accusé de réception opérateur ne constitue pas une preuve de paiement. Conservez votre intégration B2C sur des clés sandbox jusqu’à l’activation des versements live pour votre marchand par Malipo.

## Candidat de remédiation (pas encore publié)

Une politique publiée est obligatoire dans les deux environnements. Pour la sandbox candidate, `testing.setLimits(...)` publie explicitement des versions simulées à frais nuls et ne modifie jamais le live. Les versements exposent la version de politique figée et l’état du criblage de l’action.

Le prochain SDK candidat, `1.3.0-beta.2`, ajoute les soldes USD/CDF distincts, les devis et débits totaux figés avec frais, les curseurs stables, les lots JSON/CSV de 500 lignes maximum, l’archivage et les états de criblage. L’intégration publiée `1.3.0-beta.1` reste la référence déployée jusqu’à recette staging et publication du candidat.

Chaque nouvelle approbation live, réservation et autorisation d’envoi exige un nouveau criblage favorable du bénéficiaire. Un résultat historique ne remplace jamais le contrôle propre à l’action. Une panne bloque la nouvelle action. Replays exacts, lectures, consultations et confirmations tardives restent disponibles ; une soumission incertaine conserve les fonds réservés.

Routes candidates : `POST /v1/disbursements/quote`, `GET /v1/b2c-balance`, `POST /v1/disbursements/batches`, `GET /v1/disbursements/batches/{id}` et `POST /v1/beneficiaries/{id}/archive`. Les listes acceptent `starting_after`, `include_total` optionnel et retournent `pagination.next_cursor`/`has_more`. Les routes existantes et le paramètre historique explicite `page` restent disponibles.

USD utilise des chaînes décimales ; CDF exige des chaînes entières. Aucune conversion de devise. Les frais et le débit total sont figés à la réservation et entièrement restitués sur annulation admissible ou échec certain. CSV : `beneficiary_id,reference,amount,currency`, plus `idempotency_key` facultatif. Les lots répondent 202 après persistance et exposent les résultats individuels ; chaque ligne a son propre criblage requis.

L’archivage bloque les nouvelles demandes et conserve les opérations existantes. Les lectures affichent des numéros masqués. La validation à deux owners couvre KYC, résidence et preuve opérateur du titulaire. Le live reste désactivé jusqu’à qualification réelle de chaque couple marchand/réseau/devise. M-Pesa nécessite une qualification distincte.
