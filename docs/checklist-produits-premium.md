# Checklist produits premium

Branche de travail : `feature/produits-premium-laboratoire`.

## Règles de sortie communes

- [ ] Une version de démonstration contient des données fictives représentatives d'une TPE ou d'un artisan.
- [ ] Chaque zone de saisie est visuellement identifiable, protégée contre les formules et accompagnée d'une validation de données.
- [ ] Le classeur inclut une feuille `Démarrer ici`, une feuille `Paramètres` et une feuille `Glossaire`.
- [ ] Chaque calcul important affiche une explication métier accessible sans ouvrir de formule.
- [ ] Les formules sont testées sur douze mois, une activité sans vente, une activité avec retard de paiement et une activité saisonnière.
- [ ] Les montants, dates, taux et pourcentages utilisent des formats français cohérents.
- [ ] Les tableaux ne contiennent aucune donnée réelle, clé, adresse e-mail ou élément personnel.
- [ ] Le fichier est ouvert et testé dans Excel desktop et LibreOffice Calc.
- [ ] Une notice PDF de démarrage, une fiche de version et une licence d'utilisation sont livrées avec le fichier.
- [ ] Les captures produit correspondent exactement à la version livrée.
- [ ] Un testeur non concepteur réalise le parcours de démarrage en moins de quinze minutes.

## Tableau de suivi de trésorerie - 29,00 EUR

### Fonctionnalités attendues

- [ ] Saisie d'encaissements et décaissements sur au moins 500 lignes avec contrôles date, catégorie, statut et montant.
- [ ] Solde initial paramétrable et calcul du solde réel cumulé.
- [ ] Vue hebdomadaire sur 13 semaines et vue mensuelle sur 12 mois.
- [ ] Distinction entre flux prévu, réalisé et en retard.
- [ ] Échéances fournisseurs et clients avec statut de relance.
- [ ] Seuil d'alerte paramétrable et alertes visuelles sur les semaines négatives.
- [ ] Scénario prudent, central et optimiste configurable.
- [ ] Tableau de bord avec solde courant, besoin maximal, encaissements à venir et alertes.
- [ ] Graphique de solde prévisionnel et répartition des sorties.

### Validation commerciale

- [ ] Un artisan peut saisir ses 30 premiers flux sans modifier les formules.
- [ ] Le solde hebdomadaire est vérifié manuellement sur un jeu de test.
- [ ] Les alertes réagissent aux retards de paiement et aux sorties exceptionnelles.
- [ ] La notice explique clairement que l'outil est un support de gestion, pas une comptabilité.

## Tableau de suivi des dépenses - 19,00 EUR

### Fonctionnalités attendues

- [ ] Saisie structurée : date, fournisseur, catégorie, sous-catégorie, montant HT, TVA, montant TTC, échéance et statut de paiement.
- [ ] Plan de catégories et sous-catégories modifiable sans casser les listes déroulantes.
- [ ] Budget mensuel et annuel par catégorie.
- [ ] Analyse des dépenses réelles, engagées, payées et à payer.
- [ ] Comparaison budget/réel avec écart en euros et en pourcentage.
- [ ] Détection des dépenses récurrentes et des hausses inhabituelles.
- [ ] Top fournisseurs, top catégories et évolution mensuelle.
- [ ] Filtres utilisables et zones de saisie extensibles.

### Validation commerciale

- [ ] Les totaux TTC et les écarts budget/réel sont vérifiés sur un jeu de données de 100 lignes.
- [ ] Les nouvelles catégories deviennent disponibles dans la saisie.
- [ ] Les graphiques restent lisibles avec zéro dépense et avec une catégorie dominante.
- [ ] La notice décrit le traitement de la TVA et ses limites.

## Tableau de bord petite entreprise - 49,00 EUR

### Fonctionnalités attendues

- [ ] Période sélectionnable et comparaison au mois précédent, à l'objectif et à l'année précédente.
- [ ] Indicateurs : chiffre d'affaires, marge, charges, résultat de gestion, trésorerie, factures en attente et clients actifs.
- [ ] Objectifs éditables et code couleur d'atteinte sans ambiguïté.
- [ ] Données source séparées du tableau de bord et zones de saisie clairement signalées.
- [ ] Tendances sur 12 mois, graphique de revenus/charges et alertes de variation.
- [ ] Commentaires de décision mensuels et liste d'actions à suivre.
- [ ] Version compatible avec les données des deux autres produits pour le futur pack.

### Validation commerciale

- [ ] Chaque indicateur est rapproché d'une cellule source dans un jeu de test documenté.
- [ ] Les objectifs modifiés actualisent tous les écarts et graphiques.
- [ ] Le tableau est lisible sur un écran 13 pouces et imprimable en PDF sans découpe critique.
- [ ] Un dirigeant comprend les trois alertes principales sans ouvrir les onglets source.

## Pack Gestion essentielle - 79,00 EUR

- [ ] Les trois outils utilisent les mêmes conventions de date, catégorie et montant.
- [ ] Un fichier `Démarrer le pack` explique l'ordre de mise en route et les liens entre outils.
- [ ] Les données de trésorerie et de dépenses peuvent alimenter le tableau de bord par import guidé ou copier-coller contrôlé.
- [ ] Le pack inclut une routine mensuelle de 30 minutes et une routine hebdomadaire de 10 minutes.
- [ ] Une archive ZIP versionnée contient les trois fichiers, les PDF, la licence et un changelog.
- [ ] Le parcours complet est testé de l'ouverture à la première décision de gestion sans connaissance Excel avancée.

## Parcours de test hors boutique

- [ ] Démarrer l'application en développement avec `npm run dev`.
- [ ] Ouvrir `/laboratoire-produits`.
- [ ] Télécharger chaque prototype individuel depuis le bouton `Tester`.
- [ ] Ouvrir le fichier et exécuter les cas de test correspondant à sa section ci-dessus.
- [ ] Le pack reste signalé `À produire` tant qu'une archive de livraison n'existe pas.