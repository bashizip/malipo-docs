---
title: SDK Node.js
draft: false
description: Référence officielle Malipo Node.js et TypeScript pour les paiements, versements B2C et webhooks.
---

Le SDK Node.js officiel connecte votre backend à l’API production Malipo `https://api.malipo.dev/v1`. Il prend en charge les paiements, remboursements, checkout hébergé, soldes, bénéficiaires, versements B2C et vérification des webhooks.

Cette référence couvre le paquet publié **`malipo-node@1.3.0-beta.1`**. Le B2C est disponible en sandbox avec les clés `sk_test_`. Les services de paiement live existants utilisent les clés `sk_live_` ; les versements B2C live ne sont pas activés. Votre backend gère les wallets clients et leur comptabilité.

## Installation

Utilisez Node.js 20 ou plus. Installez la version ci-dessous pour disposer des ressources B2C ; le tag npm `latest` pointe actuellement sur `1.2.5`, qui ne les contient pas.

```bash
npm install malipo-node@1.3.0-beta.1
# Yarn
yarn add malipo-node@1.3.0-beta.1
# pnpm
pnpm add malipo-node@1.3.0-beta.1
```

## Initialiser le client

Créez une clé API serveur dans le [portail marchand](https://malipo.dev/api-keys) et conservez-la dans l’environnement de votre backend. Ne l’exposez jamais dans le navigateur ou le code d’une application mobile.

```javascript
import { Malipo } from 'malipo-node';

const apiKey = process.env.MALIPO_SECRET_KEY;
if (!apiKey) throw new Error('MALIPO_SECRET_KEY is required');
const malipo = new Malipo({ apiKey });
```

Les modules ES acceptent `import { Malipo }` et `import Malipo`. CommonJS est également pris en charge :

```javascript
const { Malipo } = require('malipo-node');
const malipo = new Malipo({ apiKey: process.env.MALIPO_SECRET_KEY });
```

| Option | Type | Comportement |
|---|---|---|
| `apiKey` | `string` | Clé secrète serveur obligatoire. |
| `environment` | `'sandbox'` ou `'live'` | Déduit du préfixe de la clé si omis. Gardez-le cohérent avec la clé. |
| `baseUrl` | `string` | Par défaut `https://api.malipo.dev/v1` ; une valeur personnalisée doit inclure `/v1` sans slash final. |

Les clés sandbox et live utilisent le même domaine API production. Les opérations sandbox simulent les mouvements ; les paiements live déplacent de l’argent réel. Les clés et données d’un déploiement staging séparé ne sont pas réutilisables sur production.

## Idempotence et montants

Enregistrez les paramètres et la clé d’idempotence de chaque opération métier avant son envoi. Après une réponse perdue, renvoyez la même opération avec la même clé et le même corps.

- Charges et remboursements exigent `idempotencyKey` en live. Fournissez-la aussi en sandbox pour tester les reprises.
- `disbursements.create` exige `idempotencyKey` pour chaque demande B2C, y compris en sandbox. Clés et références client : 128 caractères maximum. Un replay divergent retourne HTTP `409`.
- Les montants des charges, remboursements et checkout sont des nombres. Les montants B2C sont des chaînes décimales comme `'20.00'`, avec `currency: 'USD'`.

## Charges

`charges.create(params, { idempotencyKey })` déclenche une charge Mobile Money. Cet exemple utilise un numéro de test sandbox forçant le succès ; utilisez-le avec une clé `sk_test_`. En live, fournissez le vrai numéro du client.

```javascript
const charge = await malipo.charges.create({
  amount: 30,
  currency: 'USD',
  phone: '+243000000001',
  network: 'ORANGE_MONEY',
  description: 'Order #789',
  metadata: { order_id: '789' },
  payer: {
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane.doe@example.com',
  },
}, { idempotencyKey: 'order-789' });

console.log(charge.id, charge.status);
```

`ChargeCreateParams` exige `amount`, `currency`, `phone` et `network`. Les champs optionnels sont `description`, `metadata` et `payer` (prénom, nom et email). Réseaux : `VODACOM_MPESA`, `ORANGE_MONEY` et `AIRTEL_MONEY`. Les charges live utilisent USD ; la sandbox accepte USD ou CDF. Vérifiez le statut final avant de livrer une commande.

## Remboursements

`refunds.create(params, { idempotencyKey })` rembourse une charge réussie. Omettez `amount` pour un remboursement intégral, ou renseignez-le pour un remboursement partiel. `reason` et `metadata` sont optionnels.

```javascript
const refund = await malipo.refunds.create({
  charge_id: charge.id,
  amount: 5,
  reason: 'Customer return',
}, { idempotencyKey: 'refund-order-789' });
console.log(refund.id, refund.status);
```

## Checkout hébergé

`checkoutSessions.create(params)` retourne une URL de paiement hébergée. Redirigez le client vers `session.url`, puis confirmez le paiement par webhook ou API plutôt que de vous fier au retour du navigateur.

```javascript
const session = await malipo.checkoutSessions.create({
  amount: 25,
  currency: 'USD',
  description: 'Premium subscription',
  redirect_url: 'https://your-shop.example/payment-return',
  metadata: { order_id: 'subscription-456' },
});
console.log(session.url);
```

`amount` et `currency` sont obligatoires. `description`, `redirect_url`, `metadata` et `expires_at` (ISO 8601) sont optionnels.

## Statut des transactions et solde marchand

`transactions.retrieve(id)` consulte une charge ou un remboursement. Pour le B2C, utilisez `disbursements.retrieve(id)`. `balance.retrieve()` retourne les tableaux `available` et `pending` de l’environnement de la clé.

```javascript
const transaction = await malipo.transactions.retrieve(charge.id);
console.log(transaction.status);

const balance = await malipo.balance.retrieve();
for (const item of balance.available) {
  console.log(item.currency, item.amount);
}
```

Seuls les fonds marchands disponibles financent un versement B2C. Consultez l’exemple complet de financement et release dans [Versements B2C](/fr/b2c/).

## Bénéficiaires

Activez la permission explicite d’écriture B2C de la clé dans **Finance → Versements utilisateurs** du portail marchand. Les anciennes clés ne la reçoivent pas automatiquement.

`beneficiaries.create` exige `reference`, `name`, `network` et `msisdn`. Réseaux B2C : `ORANGE_MONEY` et `VODACOM_MPESA`. La création enregistre un destinataire, pas un wallet client. Une version approuvée et active est nécessaire pour un versement. En sandbox, l’approbation s’effectue avec `testing.approveBeneficiary`.

```javascript
const beneficiary = await malipo.beneficiaries.create({
  reference: 'customer-123',
  name: 'Example recipient',
  network: 'ORANGE_MONEY',
  msisdn: '243840000001',
});
await malipo.testing.approveBeneficiary(beneficiary.id);

const recipient = await malipo.beneficiaries.retrieve(beneficiary.id);
console.log(recipient.active_version_id, recipient.versions);
```

`beneficiaries.update(id, changes)` envoie une requête PATCH. Les changements peuvent inclure `name`, `network` et `msisdn` ; la référence client ne peut pas être modifiée. Un changement de numéro crée une version en attente. Après approbation, elle devient effective exactement 24 heures UTC plus tard ; l’ancienne version reste active jusque-là. Chaque versement existant conserve son destinataire d’origine.

```javascript
const updated = await malipo.beneficiaries.update(beneficiary.id, {
  msisdn: '243840000002',
});
await malipo.testing.approveBeneficiary(updated.id);
await malipo.testing.advanceTime(86400);
await malipo.testing.screenMerchant('cleared');
await malipo.testing.screenBeneficiary(updated.id, 'cleared');
```

Les versions exposent `status`, `effective_from`, `identity_status`, `residence_status` et `masked_msisdn`. Les numéros sont masqués dans les réponses. Bénéficiaires et soldes sont isolés par clé sandbox.

## Versements B2C

`disbursements.create(params, { idempotencyKey })` exige un `beneficiary_id` approuvé, un `amount` en chaîne décimale, `currency: 'USD'` et votre `reference` client unique. Financez et libérez d’abord le solde sandbox avec l’[exemple B2C complet](/fr/b2c/#exemple-complet-de-financement-et-versement).

```javascript
const params = {
  beneficiary_id: beneficiary.id,
  amount: '20.00',
  currency: 'USD',
  reference: 'withdrawal-123',
};
const payout = await malipo.disbursements.create(params, {
  idempotencyKey: 'withdrawal-123',
});
console.log(payout.id, payout.status, payout.destination.masked_msisdn);

const current = await malipo.disbursements.retrieve(payout.id);
console.log(current.status, current.next_action);
```

Enregistrez `params` et la clé d’idempotence dans votre base avant l’envoi. Pour retrouver une réponse perdue, recherchez la référence enregistrée ou renvoyez la requête avec sa clé initiale :

```javascript
const found = await malipo.disbursements.list({ reference: params.reference });
const recovered = found.data[0] ?? await malipo.disbursements.create(params, {
  idempotencyKey: 'withdrawal-123',
});
console.log(recovered.id, recovered.status);
```

| Statut | Signification |
|---|---|
| `pending` | Fonds réservés une seule fois ; en attente de prise en charge. |
| `processing` | Exécution commencée. |
| `needs_review` | Résultat incertain ; fonds conservés en réservation. |
| `succeeded` | Succès confirmé ; aucun second débit. |
| `failed` | Échec certain ; réservation restituée une fois. |
| `cancelled` | Annulation avant prise en charge ; réservation restituée une fois. |

### Listes et pagination

Les deux ressources acceptent `page` et `page_size` (100 maximum). Les versements acceptent aussi `reference` et `status`. Les réponses contiennent `data` et `pagination` ; chaque appel SDK retourne une page.

```javascript
const beneficiaries = await malipo.beneficiaries.list({ page: 1, page_size: 25 });
const disbursements = await malipo.disbursements.list({
  status: 'succeeded',
  page: 1,
  page_size: 25,
});
console.log(disbursements.data);
console.log(disbursements.pagination); // { page, page_size, total }
```

### Annulation

Annulez avant la prise en charge par le worker. Si l’exécution a commencé, l’annulation est refusée ; consultez le statut courant. Un timeout seul ne justifie ni la restitution d’un wallet client ni la création d’un versement de remplacement.

```javascript
const cancelled = await malipo.disbursements.cancel(payout.id);
console.log(cancelled.status);
```

## Outils de test sandbox

`testing.*` est disponible avec les clés sandbox sur l’API production et refusé pour les clés live. Ces méthodes agissent uniquement dans le contexte de la clé sandbox authentifiée.

| Méthode | Arguments / fonction |
|---|---|
| `release()` | Libérer les USD en attente vers le solde disponible de la clé. |
| `approveBeneficiary(id)` / `rejectBeneficiary(id)` | Approuver ou refuser une version de bénéficiaire en attente. |
| `reviewBeneficiary(id, versionId, review)` | `review` : `identity_status`, `residence_status` (`pending`, `approved`, `rejected`) et `proof`. |
| `screenMerchant(status)` / `screenBeneficiary(id, status)` | Résultat sanctions : `cleared`, `blocked` ou `unavailable`. |
| `holdMerchant(held)` / `holdBeneficiary(id, held)` / `holdDisbursement(id, held)` | Ajouter ou lever un blocage avec un booléen. |
| `setLimits(limits)` | `minimum_minor`, `maximum_minor`, `daily_minor`, `monthly_minor` ; entiers en cents USD. |
| `advanceTime(seconds)` | Avancer l’horloge métier de la clé. |
| `setDefaultScenario(scenario)` | Définir `success`, `rejected`, `accepted` ou `timeout` avant la création du versement. |
| `scenario(id, scenario)` | Choisir un résultat avant la prise en charge par le worker. |
| `run()` | Traiter les jobs éligibles de la clé. |
| `result(id, status)` | Enregistrer `succeeded`, `failed` ou `needs_review`, y compris un résultat tardif. |
| `resolve(id, status, proof)` | Résoudre vers `succeeded` ou `failed` avec une preuve simulée. |
| `replayWebhook(id, eventType, delaySeconds?)` | Rejouer un événement `payout.*` existant ; délai nul par défaut. |

Configurez le scénario avant la création. `accepted` reste `processing` ; `timeout` devient `needs_review`. Avancer l’heure métier ne change ni l’authentification, ni les timestamps des webhooks, ni les leases workers. Renouvelez le screening marchand et bénéficiaire après une avance importante. Consultez les [scénarios sandbox déterministes](/fr/b2c/#incidents-sandbox-déterministes).

## Webhooks

Enregistrez un endpoint HTTPS et gardez son secret de signature sur votre backend. Installez Express pour utiliser l’adaptateur ci-dessous (`npm install express`). Enregistrez la route au corps brut **avant** `express.json()`. Exigez les deux en-têtes de signature et transmettez le corps inchangé à `webhooks.constructEvent` ; la tolérance de timestamp par défaut est de cinq minutes réelles.

L’exemple importe `persistWebhook` depuis **votre application**. Implémentez cette fonction dans `webhook-inbox.js` pour conserver durablement l’événement complet avec un `event.id` unique et programmer son traitement dans la même transaction. Un ID déjà enregistré doit réussir sans programmer un nouvel effet. Cette fonction n’est pas fournie par Malipo.

```javascript
import express from 'express';
import { Malipo } from 'malipo-node';
import { persistWebhook } from './webhook-inbox.js';

const app = express();
const apiKey = process.env.MALIPO_SECRET_KEY;
const endpointSecret = process.env.MALIPO_WEBHOOK_SECRET;
if (!apiKey || !endpointSecret) throw new Error('Missing Malipo configuration');
const malipo = new Malipo({ apiKey });

app.post('/webhooks/malipo', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.header('x-webhook-signature');
  const timestamp = req.header('x-webhook-timestamp');
  if (!signature || !timestamp) return res.sendStatus(400);

  let event;
  try {
    event = malipo.webhooks.constructEvent(
      req.body.toString('utf8'), signature, endpointSecret, timestamp,
    );
  } catch {
    return res.sendStatus(400);
  }

  try {
    await persistWebhook(event);
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(503);
  }
});

app.use(express.json());
app.listen(3000);
```

Votre worker de traitement doit :

1. Filtrer l’`environment` attendu. Pour le B2C, vérifier aussi `data.object.payout_kind === 'b2c'` et l’`api_key_id` sandbox attendu : les abonnements d’un endpoint couvrent le marchand.
2. Consulter le statut canonique avec `disbursements.retrieve(id)` pour le B2C ou `transactions.retrieve(id)` pour les charges/remboursements avant tout effet.
3. Appliquer les changements des wallets clients atomiquement avec une déduplication durable dans votre base ; ne jamais remplacer un résultat terminal par un événement plus ancien.

Les événements B2C utilisent `payout.*`. Doublons et livraisons désordonnées sont possibles. Retournez 200 uniquement après stockage durable ; retournez une erreur permettant une reprise si le stockage échoue. Voir [livraison et vérification des webhooks](/fr/webhooks/) et [traitement des webhooks B2C](/fr/b2c/#recevoir-les-webhooks-durablement).

## Gestion des erreurs

Les échecs API lèvent `MalipoError`, avec `message`, `status`, `code` et `details`. Les échecs réseau et de vérification de signature peuvent lever des erreurs ordinaires.

```javascript
import { MalipoError } from 'malipo-node';

try {
  await malipo.disbursements.create(params, { idempotencyKey: 'withdrawal-123' });
} catch (error) {
  if (error instanceof MalipoError) {
    console.error(error.status, error.code, error.message);
  } else {
    throw error;
  }
}
```

HTTP 403 peut indiquer une permission B2C absente ; 404 couvre les ressources inconnues ou inaccessibles ; 409 indique un conflit. Corrigez le conflit au lieu d’émettre un nouveau retrait. Après un résultat réseau incertain, utilisez la référence et la clé d’idempotence enregistrées pour retrouver l’opération. Ne journalisez ni clés secrètes, ni numéros complets, ni détails d’erreur non filtrés.

## TypeScript

Le paquet inclut les déclarations de types ESM et CommonJS. Les types sont exportés depuis `malipo-node` :

```typescript
import { Malipo } from 'malipo-node';
import type {
  DisbursementCreateParams,
  MalipoDisbursement,
  MalipoBeneficiary,
  B2CPage,
} from 'malipo-node';

const apiKey = process.env.MALIPO_SECRET_KEY;
if (!apiKey) throw new Error('MALIPO_SECRET_KEY is required');
const malipo = new Malipo({ apiKey });
const params: DisbursementCreateParams = {
  beneficiary_id: 'beneficiary-id',
  amount: '20.00',
  currency: 'USD',
  reference: 'withdrawal-123',
};
const payout: MalipoDisbursement = await malipo.disbursements.create(params, {
  idempotencyKey: 'withdrawal-123',
});
const page: B2CPage<MalipoBeneficiary> = await malipo.beneficiaries.list();
```

Autres types exportés : `ChargeCreateParams`, `RefundCreateParams`, `CheckoutSessionCreateParams`, `MalipoTransaction`, `MalipoRefund`, `MalipoBalance`, `BeneficiaryCreateParams`, `DisbursementStatus`, `SandboxPayoutScenario` et `MalipoEvent`.

## Guides associés

- [Intégration B2C complète](/fr/b2c/)
- [Authentification API](/fr/authentication/)
- [Idempotence](/fr/idempotency/)
- [Sources et README du SDK](https://github.com/bashizip/malipo-sdks/tree/main/malipo-node)
