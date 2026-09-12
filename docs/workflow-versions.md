# Workflow des versions

`main` représente la version actuellement en production. Aucun développement de nouvelle fonctionnalité ne doit être effectué directement sur `main`.

## Convention de branches

- `main` : production stable.
- `version/<version>-<objectif>` : version complète en préparation.
- `feature/<version>-<fonctionnalite>` : fonctionnalité isolée lorsque la version nécessite plusieurs travaux parallèles.
- `fix/<version>-<probleme>` : correction ciblée d’une version en validation.

Exemples :

- `version/1.0-supabase-boutique`
- `feature/1.0-paiement-stripe`
- `fix/1.0-webhook-commande`

## Cycle de livraison

1. Créer une branche `version/*` depuis `main`.
2. Développer et tester uniquement sur cette branche.
3. Créer des branches `feature/*` si une fonctionnalité doit être isolée.
4. Fusionner les fonctionnalités dans la branche de version.
5. Valider localement : `npm run lint`, `npm test`, `npm run build`.
6. Déployer la branche de version sur un environnement Vercel Preview.
7. Tester les intégrations distantes : Supabase, authentification, paiement, emails et téléchargements.
8. Corriger les problèmes dans la branche de version, jamais directement dans `main`.
9. Ouvrir une Pull Request de la branche de version vers `main`.
10. Fusionner uniquement après validation fonctionnelle et technique.
11. Déployer `main` en production.
12. Marquer la version fusionnée avec un tag, par exemple `v1.0.0`.

## Règles de protection

- Ne jamais utiliser `--force` sur `main`.
- Ne jamais mettre de secret dans Git, `.env.local` ou une migration SQL.
- Les migrations Supabase doivent être testées localement avant `supabase db push`.
- Les paiements et webhooks doivent être testés en mode Stripe test sur Preview.
- Une validation de build est obligatoire avant la fusion.
- Une sauvegarde ou un point de restauration Supabase doit être identifié avant une migration destructive.
- Les changements de schéma doivent être rétrocompatibles avec la version actuellement en production autant que possible.

## État actuel

La branche active est `version/1.0-supabase-boutique`. Elle contient la préparation Supabase locale et distante, la migration initiale du catalogue et les bases nécessaires à la future boutique.
