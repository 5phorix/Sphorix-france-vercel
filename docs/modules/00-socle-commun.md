# Socle commun : checklist

Éléments partagés par tous les modules de la suite.

## S1. Identité et vocabulaire
- [x] Noms propres à Sadesk, sans reprise de noms ou acronymes d'éditeurs tiers.
- [x] Registre des modules : source unique des noms (`lib/suite/modules.ts`).
- [x] Icônes à style propre (tuiles à dégradé, glyphes blancs).
- [ ] Glossaire des termes de l'interface, relu par un professionnel du domaine.

## S2. Design
- [x] Jetons, composants, clair et sombre.
- [x] Cadre commun avec navigation par familles.
- [ ] Page d'accueil de la suite.
- [ ] Recherche globale et raccourcis clavier.
- [ ] Impression et PDF communs.
- [ ] Accessibilité vérifiée (clavier, contrastes, lecteurs d'écran).

## S3. Intégration
- [x] Contrat de comptabilisation (`SourceComptable`).
- [ ] Tiers uniques partagés (clients, fournisseurs, salariés).
- [ ] Catalogue d'articles partagé.
- [ ] Piste documentaire entre modules.

## S4. Données et sécurité
- [x] Stockage local (Dexie).
- [ ] Stockage serveur multi-utilisateurs (Supabase) et synchronisation.
- [ ] Rôles et droits, journal d'activité.
- [ ] Sauvegarde, export, restauration.
- [ ] Multi-sociétés.

## S5. Qualité
- [x] Tests de la logique métier (42).
- [ ] Tests d'interface de bout en bout pour chaque parcours.
- [ ] Intégration continue : typecheck, lint, tests à chaque modification.
