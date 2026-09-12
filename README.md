# Sphorix France

Plateforme Next.js de Sphorix France : outils numériques, tableaux de bord et applications de gestion sur mesure pour les artisans et les PME, avec une offre web complémentaire.
## Prérequis

- Node.js 22 recommandé
- npm
- Un compte SMTP pour les formulaires de contact et de devis
- Docker Desktop pour Supabase local
- Supabase CLI pour lancer la base locale et pousser les migrations

## Installation

```bash
npm install
cp .env.example .env.local
cp docs/env.remote.example .env.remote
```

Renseignez ensuite les variables SMTP dans `.env.local`.

## Commandes

```bash
npm run dev      # serveur de développement
npm run lint     # contrôle ESLint
npm test         # tests des routes API
npm run build    # build de production
npm start        # démarrage du build
supabase start   # démarrer Supabase localement
supabase db reset # rejouer les migrations locales
supabase link --project-ref <project-ref> # lier le projet distant
supabase db push  # appliquer les migrations distantes
```

## Supabase local et distant

Le schéma versionné se trouve dans `supabase/migrations/`. Le développement local utilise les conteneurs Docker Supabase et le projet distant utilise le même historique de migrations.

```bash
supabase start
supabase db reset
supabase gen types typescript --local > types/supabase.ts
```

Pour envoyer les fichiers Excel dans le bucket privé après avoir configuré les variables Supabase :

```bash
npm run products:upload          # bucket Supabase local
npm run products:upload:remote   # bucket Supabase distant
```

`.env.local` doit contenir les clés du projet Supabase local. `.env.remote` doit contenir les clés du projet distant et reste uniquement sur la machine ou dans le gestionnaire de secrets. Les deux fichiers sont ignorés par Git. Ne mélangez jamais une URL locale avec une clé service role distante.

Pour créer le projet distant, crée d’abord un projet dans le tableau de bord Supabase, puis lie-le avec `supabase link`. Les clés `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` doivent être configurées séparément dans `.env.local` et dans Vercel. La clé service role reste strictement côté serveur.

## Vercel

Le projet est compatible avec Vercel via `npm run build`. Après import du dépôt dans Vercel, ajoute les variables Supabase, SMTP et `NEXT_PUBLIC_SITE_URL` dans les environnements Preview et Production. La base SQLite locale ne doit pas être utilisée comme stockage de production sur Vercel ; les leads seront migrés vers Supabase dans l’étape de branchement des API.

## Configuration SMTP

Les routes `/api/contact` et `/api/quote` utilisent `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` et, facultativement, `SMTP_TO`. Si `SMTP_TO` est absent, `SMTP_USER` est utilisé comme destinataire.

Les alias `EMAIL_*` et `MAIL_*` restent acceptés pour faciliter une migration.

## Stockage des demandes

Les contacts sont archivés dans SQLite. Par défaut, le fichier est créé dans `data/contact-leads.sqlite`. En production sur un serveur avec disque persistant, utilisez `CONTACT_DB_PATH` pour définir son emplacement.

Le rate limiting contact/devis utilise la même base SQLite et survit aux redémarrages. Une architecture serverless ou multi-instance doit remplacer cet adaptateur par une base ou un service de limitation partagé avant mise en production.

## Gestion des versions

`main` représente la production. Les évolutions sont développées dans des branches `version/*`, validées localement et sur Vercel Preview, puis fusionnées vers `main` après validation. Voir [docs/workflow-versions.md](docs/workflow-versions.md).

## Structure principale

- `app/` : routes Next.js, pages, sitemap, robots et endpoints API
- `components/` : composants réutilisables et assistant de devis
- `sections/` : sections de la page d’accueil
- `lib/` : persistance SQLite et logique serveur
- `tests/` : tests des routes contact et devis

## Stripe en mode test

Le panier utilise Checkout Stripe côté serveur. Configurez `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` dans `.env.local`. Les prix sont relus depuis Supabase avant création de la session de paiement.

Pour tester le webhook en local avec Stripe CLI :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copiez le secret `whsec_...` affiché par Stripe CLI dans `STRIPE_WEBHOOK_SECRET`, puis utilisez une clé `sk_test_...`. Le webhook doit être configuré sur `/api/stripe/webhook` en Preview et Production. Ne commitez jamais ces valeurs.
