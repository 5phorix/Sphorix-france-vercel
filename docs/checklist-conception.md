# Checklist de conception Sphorix France

Cette checklist sert de référence avant et pendant la construction de la plateforme premium Sphorix France.

## Règle de livraison

- [x] Production conservée sur `main`.
- [x] Version de travail isolée sur `version/1.0-supabase-boutique`.
- [ ] Valider la version localement et sur Vercel Preview avant fusion.
- [ ] Fusionner vers `main` uniquement après validation complète.

## 1. Vision et positionnement

- [x] Valider la promesse principale : des outils numériques pour mieux gérer, mesurer et décider.
- [x] Valider l’axe central : outils de gestion comptable, analytique, budgétaire et financière sur mesure.
- [x] Positionner le développement web comme une capacité complémentaire au service de la gestion.
- [x] Définir les offres prioritaires pour le lancement.
- [ ] Définir le ton éditorial : expert, clair, accessible, concret.
- [ ] Éviter le vocabulaire trop technique pour les entrepreneurs et petites structures.
- [ ] Définir les preuves de confiance : parcours, méthode, exemples, garanties, témoignages.
- [ ] Définir les indicateurs de succès : demandes de devis, contacts qualifiés, ventes, taux de conversion.

## 2. Architecture de l’information

- [x] Accueil
- [x] Services
- [x] Création de site internet
- [x] Outils de gestion personnalisés
- [x] Tableaux de bord et suivi d'activité
- [x] Accompagnement
- [x] Boutique
- [x] Catégories boutique
- [x] Fiche produit
- [x] Panier
- [x] Paiement
- [x] Confirmation de commande
- [x] À propos
- [x] Contact
- [x] Demande de devis
- [x] Trouver la solution adaptée
- [x] Compte client
- [x] Commandes et téléchargements
- [x] Mentions légales
- [x] Politique de confidentialité
- [x] Conditions générales de vente
- [x] Politique de remboursement et produits numériques

## 3. Parcours utilisateurs

### Découverte et prestation

- [x] Comprendre l'activité en moins de quelques secondes depuis l'accueil.
- [x] Choisir entre une prestation, un outil prêt à l'emploi ou une solution personnalisée.
- [x] Consulter une page service avec bénéfices, méthode, livrables et appel à l'action.
- [x] Demander un devis depuis chaque service.
- [x] Contacter Sphorix sans chercher l'information.

### Orientation vers une solution

- [x] Identifier le besoin du visiteur.
- [x] Proposer une ou plusieurs solutions pertinentes.
- [x] Orienter vers un service, un produit ou le formulaire de contact.
- [x] Prévoir un résultat compréhensible même si aucune réponse exacte n'est disponible.
- [ ] Mesurer les orientations et les abandons.

### Boutique

- [x] Parcourir les catégories.
- [x] Rechercher un produit.
- [x] Filtrer par type, prix et besoin.
- [x] Consulter une fiche produit complète.
- [x] Ajouter au panier.
- [x] Modifier ou supprimer une ligne.
- [x] Voir le total avant paiement.
- [x] Se connecter ou créer un compte au bon moment.
- [x] Payer sans friction.
- [x] Recevoir une confirmation.
- [x] Télécharger le produit acheté.

### Compte client

- [x] Créer un compte par email.
- [x] Confirmer l’adresse email.
- [x] Se connecter et se déconnecter.
- [x] Réinitialiser le mot de passe.
- [x] Modifier ses informations.
- [x] Voir ses commandes.
- [x] Retrouver ses fichiers.
- [x] Régénérer un lien de téléchargement sécurisé.

## 4. Design premium

- [x] Définir une identité visuelle stable : couleurs, typographies, espacements, bordures et ombres.
- [x] Construire une hiérarchie visuelle claire, sans surcharge.
- [x] Donner une place forte aux deux axes de l'activité.
- [x] Concevoir des CTA distincts pour acheter, demander un devis et contacter.
- [ ] Prévoir des états loading, succès, erreur, vide et indisponible.
- [ ] Concevoir les vues desktop, tablette et mobile avant intégration.
- [ ] Prévoir une navigation clavier complète.
- [ ] Respecter les contrastes et les tailles de texte.
- [ ] Respecter `prefers-reduced-motion`.
- [ ] Prévoir des images et aperçus cohérents pour chaque produit.

## 5. Modèle de données Supabase

- [x] Projet local Supabase configuré.
- [x] Projet distant Supabase lié.
- [x] Migration initiale poussée sur le distant.
- [x] Types TypeScript générés.
- [x] Catégories.
- [x] Produits simples et packs.
- [x] Fichiers produits privés.
- [x] Composition des packs.
- [x] Profils utilisateurs.
- [x] Commandes.
- [x] Lignes de commande.
- [x] Téléchargements.
- [x] RLS de base.
- [x] Ajouter les champs SEO des produits et catégories.
- [ ] Ajouter les statuts de publication et d’archivage détaillés.
- [ ] Ajouter les coupons ou promotions si nécessaire.
- [x] Ajouter la traçabilité des événements de paiement.
- [x] Définir les règles de conservation et suppression des leads.
- [ ] Remplacer progressivement SQLite pour les leads et le rate limiting.

## 6. Catalogue et administration

- [x] Définir les trois produits de lancement : trésorerie, dépenses, tableau de bord.
- [x] Rédiger les descriptions courtes et longues.
- [x] Définir les fonctionnalités et éléments inclus.
- [x] Définir les formats, versions et conditions d’utilisation.
- [x] Préparer les captures et aperçus.
- [x] Définir les prix TTC et règles de TVA.
- [x] Définir le pack Gestion essentielle et son prix indicatif.
- [ ] Définir le rôle administrateur.
- [ ] Créer l’interface de gestion des produits.
- [ ] Créer l’interface de gestion des catégories.
- [x] Gérer les fichiers privés sans les exposer publiquement.
- [ ] Prévoir publication, brouillon, archivage et suppression contrôlée.
- [ ] Prévoir journal des modifications sensibles.

## 7. Paiement et commandes

- [x] Créer le compte Stripe.
- [x] Définir le mode test et le mode production.
- [x] Créer Checkout côté serveur.
- [x] Ne jamais accepter le prix final envoyé par le navigateur.
- [x] Recalculer le panier depuis Supabase côté serveur.
- [x] Créer la commande en statut `pending`.
- [x] Valider le paiement uniquement via webhook Stripe signé.
- [x] Rendre le traitement du webhook idempotent.
- [x] Passer la commande à `paid` après confirmation.
- [x] Gérer annulation, échec et remboursement.
- [x] Empêcher l'accès à un produit non payé.
- [x] Envoyer la confirmation d'achat.
- [x] Prévoir les règles de remboursement pour produits numériques.

## 8. Téléchargements numériques

- [x] Créer un bucket privé Supabase Storage.
- [x] Stocker les fichiers hors du dossier public Next.js.
- [x] Vérifier l’utilisateur et la commande payée avant chaque accès.
- [x] Générer des URLs signées à durée limitée.
- [x] Limiter éventuellement le nombre de téléchargements.
- [x] Enregistrer la date et le nombre de téléchargements.
- [x] Ne jamais exposer le chemin de stockage brut.
- [ ] Prévoir le remplacement d’un fichier sans casser les commandes existantes.
- [x] Tester les accès directs, expirés, anonymes et non autorisés.

## 9. Authentification et autorisations

- [x] Configurer Supabase Auth par email.
- [ ] Définir les URLs de redirection locale, Preview et Production.
- [x] Ajouter le middleware de rafraîchissement de session Next.js.
- [x] Protéger les routes compte et téléchargements.
- [ ] Protéger les routes d'administration.
- [x] Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` au navigateur.
- [ ] Vérifier les politiques RLS avec un utilisateur anonyme, client et administrateur.
- [ ] Prévoir la suppression du compte et des données personnelles.

## 10. Formulaires et demandes de service

- [x] Migrer les leads contact vers Supabase.
- [x] Migrer les demandes de devis vers Supabase.
- [x] Conserver la validation serveur.
- [x] Conserver l'échappement HTML des emails.
- [ ] Remplacer le rate limiting SQLite par une solution partagée.
- [x] Ajouter des messages accessibles avec `aria-live`.
- [x] Ajouter validation et erreurs par champ.
- [x] Ajouter confirmation anti-spam robuste.
- [x] Ajouter notification email interne.
- [x] Ajouter accusé de réception client.
- [ ] Prévoir export ou consultation des leads pour l’administration.

## 11. Intégrations externes

- [x] Supabase Database.
- [x] Supabase Auth.
- [x] Supabase Storage.
- [x] Stripe Checkout.
- [x] Stripe Webhooks.
- [x] SMTP transactionnel.
- [x] Vercel.
- [ ] Domaine et DNS.
- [ ] Outil d'analytics respectueux du RGPD, uniquement si nécessaire.
- [ ] Monitoring des erreurs et logs serveur.
- [x] Réseaux sociaux et liens professionnels.

## 12. Vercel et environnements

- [ ] Importer le dépôt Git dans Vercel.
- [ ] Configurer Preview, Development et Production.
- [ ] Ajouter `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] Ajouter `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Ajouter `SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur.
- [ ] Ajouter `STRIPE_SECRET_KEY`.
- [ ] Ajouter `STRIPE_WEBHOOK_SECRET`.
- [ ] Ajouter les variables SMTP.
- [ ] Ajouter `NEXT_PUBLIC_SITE_URL`.
- [ ] Désactiver SQLite en production Vercel.
- [ ] Configurer les domaines et redirections.
- [ ] Tester les webhooks sur Preview puis Production.
- [ ] Vérifier les logs et les déploiements automatiques.

## 13. Sécurité et conformité

- [x] Vérifier toutes les politiques RLS.
- [x] Valider les entrées côté serveur.
- [x] Limiter la taille des requêtes et fichiers.
- [x] Protéger les webhooks par signature.
- [x] Ne jamais faire confiance au prix ou à l'identité transmis par le client.
- [x] Ajouter les mentions légales complètes.
- [x] Ajouter les CGV adaptées aux produits numériques.
- [x] Ajouter la politique de confidentialité finale.
- [ ] Définir les durées de conservation.
- [ ] Prévoir l'exercice des droits RGPD.
- [x] Vérifier les emails transactionnels et leur contenu.
- [ ] Auditer les dépendances et secrets avant mise en production.

## 14. SEO et contenu

- [x] Définir les titres et descriptions de chaque page.
- [x] Ajouter les données structurées pertinentes.
- [x] Créer les métadonnées produit.
- [x] Ajouter canonical, Open Graph et images sociales.
- [x] Vérifier sitemap et robots.
- [x] Ajouter des liens internes entre services et produits.
- [x] Préparer les contenus FAQ.
- [x] Optimiser les images et aperçus.
- [x] Vérifier les pages 404 et les redirections.
- [x] Éviter les promesses commerciales non démontrées.

## 15. Tests et qualité

- [ ] Tester les migrations localement.
- [ ] Tester la connexion et les permissions Supabase.
- [ ] Tester l’inscription, connexion et récupération de compte.
- [ ] Tester catalogue, panier et calcul du total.
- [ ] Tester les prix côté serveur.
- [ ] Tester paiement réussi, refusé, annulé et webhook rejoué.
- [ ] Tester téléchargement autorisé et refusé.
- [ ] Tester les formulaires et la limitation anti-spam.
- [ ] Tester mobile, clavier et lecteur d’écran.
- [ ] Tester les états vides et les erreurs réseau.
- [ ] Exécuter lint, tests, build et audit avant chaque mise en production.
- [ ] Tester une restauration de sauvegarde Supabase.

## 16. Découpage de livraison

### Version 1 : plateforme vitrine renforcée

- [x] Refonte premium de l’accueil.
- [x] Services, À propos, Contact et devis.
- [x] Orientation vers une solution.
- [x] Contenus légaux complets.

### Version 2 : boutique catalogue

- [x] Catégories.
- [x] Produits et packs.
- [x] Fiches produit.
- [x] Recherche et filtres.
- [x] Panier local.

### Version 3 : vente

- [x] Stripe Checkout.
- [x] Webhooks.
- [x] Commandes.
- [x] Emails de confirmation.

### Version 4 : espace client

- [x] Authentification.
- [x] Historique des commandes.
- [x] Téléchargements sécurisés.
- [x] Gestion du profil.

### Version 5 : administration et croissance

- [ ] Administration catalogue.
- [ ] Gestion des commandes et leads.
- [ ] Coupons et packs avancés.
- [ ] Analytics et optimisation des conversions.
- [ ] Blog, formations ou abonnements selon validation commerciale.

## 17. Décisions à prendre avant le paiement

- [ ] Nom et statut juridique affichés sur le site.
- [ ] Régime de TVA et prix TTC.
- [ ] Politique de remboursement.
- [ ] Compte Stripe et compte bancaire de versement.
- [ ] Produits exacts et prix de lancement.
- [ ] Limite ou non des téléchargements.
- [ ] Durée de validité des liens de téléchargement.
- [ ] Outil d’administration souhaité.
- [ ] Domaine de production définitif.
- [ ] Outil d’analytics retenu ou absence d’analytics.

## 18. Sadesk Compta et Sphorix Connect

Les deux produits ont des dépôts, interfaces, authentifications, bases de données, stockages et déploiements indépendants. Connect peut relier d’autres logiciels sans dépendre de Sadesk; leur seul échange passe par l’API publique Sadesk versionnée.

### Conception et fondations

- [x] Définir la propriété des organisations, connexions, secrets, transferts, identifiants externes et erreurs.
- [x] Créer le dépôt autonome `sphorix-connect` et le pousser sur GitHub (`main`, commit initial `f113777`).
- [x] Créer son API Fastify/OpenAPI et son projet Supabase local distinct, migrations `0001` à `0007`.
- [x] Ajouter le frontend Connect (connexion, organisations, applications, import, transferts, clés API) avec les modèles visuels fournis.
- [x] Chiffrer les credentials Sadesk dans Connect; ne jamais les placer dans la configuration ordinaire ni les réafficher.
- [x] Définir l’API publique Sadesk d’import scoped et l’interface d’émission/révocation des credentials `sds_live_...`.

### Connecteur fichier et validation locale

- [x] Implémenter l’aperçu CSV/JSON, la validation, les doublons et les erreurs paginées.
- [x] Traiter les transferts avec idempotence, lease et checkpoint; vérifier la reprise au-delà de 250 lignes avec une ligne invalide au milieu.
- [x] Valider l’import Sadesk local en brouillon, ses références de tiers et ses résultats par ligne.
- [x] Vérifier les interfaces d’authentification, connexions, clés, import et révocation dans les deux produits.
- [x] Tests Connect : 28 réussis; build et audit des dépendances validés.
- [x] Tests Sadesk : 211 unitaires et 89 d’intégration réussis; lint, typecheck et build validés.

### Bascule et retrait

- [ ] Déployer les deux produits indépendamment et exécuter des tests de contrat sur leurs environnements de validation.
- [ ] Migrer les connexions et exécutions historiques avec comparaison, consentement et procédure de retour arrière.
- [ ] Valider la bascule de production avant de retirer les routes, tables et écrans Connect historiques de Sadesk.
- [ ] Configurer les sauvegardes, la rétention/expiration des archives et l’observabilité dans les deux environnements.

### Commercialisation différée

- [x] Décider que Sadesk Compta et Sphorix Connect seront commercialisés comme deux produits distincts.
- [ ] Attendre la validation explicite de la conception, des parcours, de la sécurité, des tests et de l’exploitation avant tout chantier commercial.
- [ ] Définir le modèle de vente idéal pour chaque produit après cette validation; ne pas ajouter de tarification, abonnement, essai ou paiement maintenant.

## 19. Back-office plateforme (`/administration`)

Console interne Sphorix France de pilotage éditeur : produits, sociétés abonnées, abonnements et accès. Gestion manuelle, aucun paiement ni facturation Stripe déclenchés.

### Réalisé

- [x] Modèle Supabase : administrateurs, produits, offres, sociétés, abonnements, accès produit, journal d’événements (migrations `20261019000000` à `20261019040000`).
- [x] RLS réservée aux administrateurs plateforme (`is_platform_admin()`), journal d’audit en lecture/insertion admin.
- [x] Actions via fonctions SQL : créer société, offre, abonnement; changer le statut d’un abonnement; confirmer/mettre à jour l’accès et le tenant d’un produit.
- [x] Console (`AdministrationConsole`) : vue d’ensemble, sociétés, abonnements, provisionnement produit, catalogue produits/offres.
- [x] Connexion administrateur dédiée (`/administration/connexion`), redirection post-connexion selon le rôle, protection par `proxy.ts`.
- [x] Tests : `admin-proxy` et `post-login-destination`; suite complète 19 tests réussis, typecheck propre.

### Reste à faire

- [ ] Appliquer les migrations sur l’environnement Supabase distant et créer le premier administrateur.
- [ ] Recette manuelle de la console sur l’environnement de validation.
- [ ] Provisionnement automatisé des tenants Sadesk/Connect (actuellement confirmation manuelle).
- [ ] Facturation et paiement des abonnements (volontairement différés).

## 20. État réel par application

| Application | État | Prochaines étapes |
| --- | --- | --- |
| Back-office (Sphorix France) | Fonctionnel en local, tests et typecheck OK; migrations non déployées | Déploiement Supabase, premier admin, recette |
| Sadesk Compta | Import public scoped et émission/révocation de clés validés en local (211 unitaires, 89 intégration) | Déploiement indépendant, tests de contrat, sauvegardes/observabilité |
| Sphorix Connect | Dépôt autonome, API, frontend et connecteur fichier validés en local (28 tests) | Déploiement indépendant, migration de l’historique, retrait des écrans Connect de Sadesk |
