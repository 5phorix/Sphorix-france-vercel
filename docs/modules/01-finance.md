# Finance : checklist détaillée

Le module Finance regroupe quatre domaines qui partagent **une seule source de vérité** : les écritures comptables.

| Domaine | Nom dans l'interface | Rôle |
|---|---|---|
| Comptabilité | Comptes | Écritures, journaux, grand livre, balance, bilan, compte de résultat |
| Finance | Trésorerie | Banque, encaissements, décaissements, prévisions de trésorerie |
| Contrôle de gestion | Pilotage | Centres de coûts, budgets, écarts, indicateurs |
| Fiscalité | TVA et impôts | TVA, impôt sur les sociétés, liasse, FEC |

Légende : `[x]` fait · `[ ]` à faire.
Chaque étape se développe puis se valide (tests, relecture, contrôle visuel) avant la suivante.

## F0. Socle comptable (noyau)

- [x] Partie double, montants en centimes entiers, aucun calcul en virgule flottante.
- [x] Plan comptable personnalisable (extrait du plan comptable général).
- [x] Écriture équilibrée obligatoire, comptes 4xx avec tiers, charges avec centre de coûts.
- [x] Numérotation continue et personnalisable (`{JNL}-{YYYY}-{SEQ}`).
- [x] Pièce comptabilisée immuable : correction par extourne.
- [x] Périodes clôturables.
- [x] Exercice décalable (mois de début paramétrable).
- [x] Lettrage automatique des règlements.
- [x] Contrôles de cohérence (balance, bilan, TVA, brouillons, retards).
- [x] Tests automatisés de la logique (12).
- [ ] Piste d'audit : qui a fait quoi, quand (journal d'activité horodaté).
- [ ] Verrouillage de l'exercice avec reprise des à-nouveaux.
- [ ] Multi-sociétés (dossiers séparés) et multi-établissements.
- [ ] Devises étrangères et écarts de change.
- [ ] Stockage serveur (Supabase) avec droits par rôle, en plus du stockage local.
- [ ] Sauvegarde, export et restauration complète des données.

## F1. Comptes (comptabilité)

### Saisie
- [x] Facture client et facture fournisseur avec TVA automatique.
- [x] Encaissement et paiement.
- [x] Import UBL/CII et Factur-X (CII intégré au PDF), avec OCR local pour les PDF/images et correction humaine avant comptabilisation.
- [ ] Réception des imports Sphorix Connect en brouillon par API, avec identifiant externe et validation humaine.
- [ ] Écriture manuelle libre (journal des opérations diverses), multi-lignes.
- [ ] Modèles d'écritures récurrentes (loyers, abonnements, salaires).
- [ ] Journaux paramétrables : ventes, achats, banque, caisse, opérations diverses, à-nouveaux.
- [ ] Brouillons modifiables avant comptabilisation.
- [ ] Pièce justificative jointe à chaque écriture.
- [ ] Saisie rapide au clavier (tabulation, raccourcis, duplication de ligne).

### Consultation
- [x] Journal avec recherche.
- [x] Balance générale.
- [ ] Grand livre par compte, avec filtre de période et solde progressif.
- [ ] Grand livre auxiliaire clients et fournisseurs.
- [ ] Balance âgée clients et fournisseurs.
- [ ] Tri, filtres multi-critères et export tableur de chaque liste.
- [ ] Navigation d'un chiffre vers l'écriture, puis vers le document d'origine.

### États
- [x] Compte de résultat et bilan calculés.
- [ ] Compte de résultat et bilan présentés à l'écran, avec comparaison N / N-1.
- [ ] Soldes intermédiaires de gestion.
- [ ] Tableau de flux de trésorerie.
- [ ] Impression et PDF de chaque état, en-tête société.

### Clôture
- [ ] Rapprochement bancaire (import relevé, pointage, écarts).
- [ ] Écritures de fin d'exercice : amortissements, provisions, charges à payer, produits constatés d'avance.
- [ ] Immobilisations et tableau d'amortissement.
- [ ] Clôture mensuelle, puis annuelle, avec liste de contrôle.
- [ ] Reprise des à-nouveaux à l'ouverture.

### Paramétrage
- [x] Ajout de comptes personnalisés, centres de coûts, numérotation, clôture de période.
- [ ] Plan comptable complet, import et export du plan.
- [ ] Modification et désactivation d'un compte, avec contrôle d'usage.
- [ ] Gestion des taux de TVA et de leurs comptes.
- [ ] Gestion des tiers (clients, fournisseurs) partagée avec Commerce et Approvisionnement.

## F2. Trésorerie (finance)

- [x] Solde de trésorerie calculé depuis les écritures.
- [ ] Comptes bancaires et caisses multiples.
- [ ] Import de relevés bancaires (CSV, OFX, CAMT).
- [ ] Rapprochement bancaire automatique et manuel.
- [ ] Prévision de trésorerie : encaissements et décaissements attendus issus des échéanciers.
- [ ] Scénarios (optimiste, prudent) et alertes de seuil.
- [ ] Remises en banque, chèques, virements, prélèvements.
- [ ] Fichier de virement (SEPA) pour payer les fournisseurs.
- [ ] Gestion des emprunts et échéanciers de remboursement.
- [ ] Relances clients (niveaux, modèles de courrier, historique).
- [ ] Lien avec le module Trésorerie existant dans la boutique.

## F3. Pilotage (contrôle de gestion)

- [x] Centres de coûts, réalisé par centre.
- [x] Budgets mensuels par centre et écarts.
- [x] Indicateurs clés : chiffre d'affaires, résultat, marge, trésorerie, besoin en fonds de roulement, créances, dettes.
- [ ] Budget annuel multi-comptes avec répartition mensuelle (lissage, saisonnalité).
- [ ] Versions de budget (initial, révisé) et comparaison.
- [ ] Axes analytiques multiples : centre, projet, produit, client, activité.
- [ ] Répartition des charges indirectes (clés de répartition).
- [ ] Rentabilité par client, produit et projet.
- [ ] Seuil de rentabilité et point mort.
- [ ] Tableaux de bord personnalisables (indicateurs, période, comparaison).
- [ ] Graphiques d'évolution et de comparaison.
- [ ] Alertes (dépassement de budget, trésorerie basse, retards clients).
- [ ] Prévisionnel : réalisé + reste à faire, atterrissage de fin d'exercice.
- [ ] Reporting périodique exportable (PDF et tableur).

## F4. TVA et impôts (fiscalité)

- [x] TVA collectée, déductible, à décaisser, bases par taux.
- [x] Impôt sur les sociétés estimé avec barème paramétrable, écriture de constatation.
- [ ] Déclaration de TVA (CA3 et CA12) avec rapprochement des bases.
- [ ] TVA sur encaissements ou sur débits (option par activité).
- [ ] Autoliquidation, opérations intracommunautaires, export.
- [ ] Régularisations et crédits de TVA, remboursement.
- [ ] Acomptes d'impôt sur les sociétés et solde.
- [ ] Contribution économique territoriale et taxes assimilées.
- [ ] Liasse fiscale : bilan et compte de résultat au format attendu.
- [ ] Fichier des écritures comptables (FEC) conforme, avec contrôles préalables.
- [ ] Calendrier fiscal et rappels d'échéances.
- [ ] Régimes (micro, réel simplifié, réel normal) pris en compte dans les calculs.

## F5. Conformité et qualité

- [ ] Mentions légales obligatoires sur devis et factures.
- [x] Prévisualisation et validation humaine des factures UBL/CII, Factur-X PDF et PDF/images OCR avant création de l’écriture.
- [ ] Facturation électronique réglementaire complète : plateforme, transmission, accusés de réception et calendrier légal.
- [ ] Conservation et archivage des pièces (durée légale, horodatage).
- [ ] Inaltérabilité, traçabilité et sécurisation des données.
- [ ] Accessibilité (clavier, contrastes, lecteurs d'écran).
- [ ] Respect du RGPD pour les données de tiers.
- [ ] Jeux de données de test réalistes pour chaque scénario.
- [ ] Tests automatisés pour chaque règle de gestion ajoutée.

## F6. Interface

- [x] Système de design commun (jetons, composants, clair et sombre).
- [x] Navigation de la suite par familles.
- [x] Écran Pilotage refait (tableau de bord, écritures, TVA, budgets, paramétrage).
- [ ] Contrôle visuel de chaque onglet en clair, sombre et mobile.
- [ ] Tableaux : tri, pagination, colonnes personnalisables.
- [ ] Raccourcis clavier et recherche globale.
- [ ] Impression soignée de chaque état.
- [ ] Textes d'aide et vocabulaire relus.

## Ordre de développement proposé

1. **F1 Saisie manuelle et grand livre** : permet de tout vérifier à l'écran.
2. **F1 États** : compte de résultat et bilan lisibles, impression.
3. **F4 TVA** : déclaration, option sur encaissements.
4. **F2 Banque** : comptes, import, rapprochement.
5. **F1 Clôture** : amortissements, régularisations, à-nouveaux.
6. **F4 FEC et liasse**.
7. **F3 Budgets et analytique avancés**.
8. **F2 Prévisions de trésorerie et relances**.
9. **F0 Piste d'audit, multi-sociétés, stockage serveur**.
10. **F5 Conformité** en continu, **F6 Interface** à chaque étape.
