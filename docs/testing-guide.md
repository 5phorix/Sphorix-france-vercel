# 🧪 Guide de test complet - Sphorix France Phase 1

Ce guide couvre tous les tests manuels et automatisés pour valider l'intégration Stripe, email et pages légales.

---

## ✅ Checklist avant test

- [ ] Variables d'env configurées (.env.local ou Vercel)
- [ ] Migrations Supabase appliquées (`db reset` ou `db push`)
- [ ] Serveur local lancé (`npm run dev`)
- [ ] Dashboard Stripe ouvert (cartes de test)
- [ ] Email transactionnel configuré

---

## Partie 1 : Tests Paiement Stripe

### 1.1 - Ajouter produit au panier

**Étapes:**
1. Aller à `/boutique`
2. Sélectionner un produit (ex: "Trésorerie")
3. Cliquer "Ajouter au panier"

**Validations:**
- [ ] Produit apparaît dans le panier
- [ ] Prix affiché correctement
- [ ] Quantité modifiable
- [ ] Total correct (prix × quantité)

---

### 1.2 - Checkout (avant paiement)

**Étapes:**
1. Aller à `/panier`
2. Cliquer "Valider la commande"
3. Entrer adresse email: `test@exemple.fr`
4. Cliquer "Procéder au paiement"

**Validations:**
- [ ] Email validé (format @exemple.fr)
- [ ] Redirection Stripe Checkout
- [ ] Produits et prix affichés dans Stripe
- [ ] Total TTC correct en EUR
- [ ] Adresse email préremplie

---

### 1.3 - Paiement (mode test Stripe)

**Étapes:**
1. Dans Stripe Checkout, remplir:
   - **Nom:** Test User
   - **Email:** test@exemple.fr
   - **Carte bancaire:** `4242 4242 4242 4242` (test card)
   - **Exp:** `12/26`
   - **CVC:** `123`
   - **Adresse postale:** Test, France
2. Cliquer "Payer"

**Validations:**
- [ ] Paiement accepté (statut Stripe = "paid")
- [ ] Redirection vers `/paiement/succes`
- [ ] Session ID dans URL ou réponse

---

### 1.4 - Webhook Stripe

**Tests locaux:**
1. Dans le dashboard Stripe test:
   - Aller à **Events** (Webhooks)
   - Chercher événement `checkout.session.completed`
   - Vérifier status = "200" (succès)

**Validations:**
- [ ] Webhook reçu (délai < 5 sec)
- [ ] Status HTTP = 200
- [ ] Pas d'erreurs dans logs

---

### 1.5 - Commande créée en base

**Tests manuels:**
1. Ouvrir Supabase Dashboard
2. Aller à `orders`
3. Chercher la commande par email `test@exemple.fr`

**Validations:**
- [ ] Commande existe
- [ ] Status = "paid" (pas "pending")
- [ ] total_cents correct (ex: 4900 = 49€)
- [ ] customer_email = test@exemple.fr
- [ ] paid_at rempli (datetime récent)
- [ ] stripe_payment_intent_id rempli
- [ ] stripe_checkout_session_id rempli

---

### 1.6 - Enregistrement événement paiement

**Tests manuels:**
1. Supabase Dashboard → `payment_events`
2. Filtrer par order_id (de l'étape 1.5)

**Validations:**
- [ ] Event trouvé: event_type = "payment_succeeded"
- [ ] stripe_event_id rempli
- [ ] details contient session_id, amount, currency, email
- [ ] created_at récent

---

### 1.7 - Paiement refusé (test)

**Étapes:**
1. Ajouter produit au panier → Checkout
2. Email: `declined@test.fr`
3. Carte: `4000 0000 0000 0002` (carte refusée Stripe)
4. Soumettre

**Validations:**
- [ ] Paiement refusé dans Stripe
- [ ] Message d'erreur affiché au client
- [ ] Commande créée mais status = "cancelled" (pas "pending")
- [ ] Email NO pas envoyé (ou envoyé mais statut echec)
- [ ] payment_events enregistre "payment_failed"

---

### 1.8 - Session expiée

**Étapes:**
1. Stripe Checkout démarré
2. Attendre 30 minutes (ou simuler via Stripe test webhook)
3. Revenir au checkout

**Validations:**
- [ ] Stripe renvoie erreur "session_expired"
- [ ] Webhook reçu: event_type = "checkout.session.expired"
- [ ] Commande status passe à "cancelled"

---

## Partie 2 : Tests Email SMTP

### 2.1 - Email de confirmation

**Conditions:**
- SMTP_HOST, SMTP_USER, SMTP_PASS configurés
- Paiement Stripe complété (cf. 1.3)

**Validations:**
- [ ] Email reçu dans 2-5 minutes
- [ ] Adresse `from` = SMTP_FROM
- [ ] Subject = "Confirmation de commande #[id]"
- [ ] HTML correctement rendu
- [ ] Numéro commande visible
- [ ] Détails produits listés
- [ ] Total TTC affiché
- [ ] Lien vers espace client `/compte`
- [ ] Lien vers contact en footer

**Dépannage:**
- Email en spam ? → Vérifier SPF/DKIM/DMARC
- Email pas reçu ? → Logs Vercel ou Dashboard SMTP
- Format HTML cassé ? → Vérifier rendu Outlook/Gmail

---

### 2.2 - Test adresse email invalide

**Étapes:**
1. Checkout avec email invalide: `invalid@`
2. Soumettre

**Validations:**
- [ ] Erreur "Email invalide" avant Stripe
- [ ] Pas de commande créée
- [ ] Pas de webhook triggeré

---

## Partie 3 : Tests Pages légales

### 3.1 - CGV

**Étapes:**
1. Aller à `/cgv`
2. Consulter le contenu

**Validations:**
- [ ] Page charge sans erreur
- [ ] Titre "Conditions générales de vente"
- [ ] Sections numérotées (1-13)
- [ ] Contenu lisible (pas de formattage cassé)
- [ ] Mentions légales complètes:
  - [ ] Objet et champ d'application
  - [ ] Prix et offre
  - [ ] Commande et paiement
  - [ ] Livraison produits numériques
  - [ ] Propriété intellectuelle
  - [ ] Droit de rétractation (14j)
  - [ ] Remboursement
  - [ ] Responsabilités

---

### 3.2 - Politique remboursement

**Étapes:**
1. Aller à `/politique-remboursement`
2. Consulter le contenu

**Validations:**
- [ ] Page charge sans erreur
- [ ] Titre "Politique de remboursement et retour"
- [ ] Sections complètes (14)
- [ ] Délais clairs:
  - [ ] 14 jours avant accès
  - [ ] 7 jours après accès pour défaut
- [ ] Processus remboursement expliqué
- [ ] Email de contact: contact@sphorix-france.fr
- [ ] FAQ section présente

---

### 3.3 - Liens footer

**Étapes:**
1. Footer en bas de page
2. Tester chaque lien légal

**Validations:**
- [ ] `/cgv` cliquable et fonctionnelle
- [ ] `/politique-remboursement` cliquable et fonctionnelle
- [ ] `/politique-confidentialite` cliquable et fonctionnelle
- [ ] `/boutique` cliquable
- [ ] Contact "Planifier un échange" fonctionne

---

## Partie 4 : Tests d'accès produit

### 4.1 - Accès après paiement

**Étapes:**
1. Paiement complété (cf. 1.3)
2. Se connecter à `/compte`
3. Voir "Vos téléchargements"
4. Cliquer sur le lien de produit

**Validations:**
- [ ] Produit listé dans "Vos téléchargements"
- [ ] Lien `/api/downloads/[id]` fonctionnel
- [ ] Fichier téléchargé (XLSX, PDF, etc.)
- [ ] Fichier valide (pas corrompu)

---

### 4.2 - Accès SANS paiement

**Étapes:**
1. Créer une fausse commande en base (pending)
2. Essayer d'accéder: `/api/downloads/[id-faux]`

**Validations:**
- [ ] Erreur 401 ou 403 (Unauthorized)
- [ ] Pas d'accès au fichier
- [ ] Redirection vers `/connexion`

---

## Partie 5 : Tests de sécurité

### 5.1 - Validation prix côté serveur

**Étapes:**
1. Ouvrir DevTools (F12) → Console
2. Modifier prix dans le DOM: `document.body.innerHTML = document.body.innerHTML.replace('49€', '1€')`
3. Soumettre commande

**Validations:**
- [ ] Commande crée avec VRAI prix (49€)
- [ ] Prix modifié par JS ignoré
- [ ] Stripe charge le bon montant

---

### 5.2 - Validation email côté serveur

**Étapes:**
1. Checkout form
2. DevTools → Network
3. Intercepter POST `/api/stripe/checkout`
4. Modifier `email` en `hacker@malicious.com`

**Validations:**
- [ ] Requête acceptée (pour ne pas révéler la validation)
- [ ] Commande créée avec email VRAI (d'avant)
- [ ] Webhook confirmé avec email VRAI
- [ ] Email de confirmation envoyé au VRAI email

---

### 5.3 - Webhook signature

**Étapes:**
1. Récupérer un webhook Stripe réel
2. Modifier la signature
3. POST `/api/stripe/webhook` avec mauvaise signature

**Validations:**
- [ ] Réponse 400 "Signature invalide"
- [ ] Pas de commande mise à jour
- [ ] Pas d'email envoyé

---

### 5.4 - Idempotence webhook

**Étapes:**
1. Webhook Stripe reçu et traité (commande paid)
2. Renvoyer exactement le MÊME webhook
3. (Stripe resend button ou replay CLI)

**Validations:**
- [ ] 2ème appel traité sans erreur (200 OK)
- [ ] Commande NOT updated (status reste "paid")
- [ ] Email NOT envoyé 2 fois
- [ ] Logs confirment: "Order already paid"

---

## Partie 6 : Tests de performance

### 6.1 - Temps webhook

**Mesure:**
1. Webhook reçu → Vérifier timestamp Stripe
2. Commande mis à jour → Vérifier timestamp Supabase
3. Email envoyé → Vérifier timestamp logs

**Validations:**
- [ ] Temps total webhook < 5 sec
- [ ] Pas de timeouts

---

### 6.2 - Emails sous charge

**Étapes:**
1. Créer 5 commandes rapides
2. Vérifier que 5 emails arrivent

**Validations:**
- [ ] Tous les 5 emails reçus
- [ ] Aucun dedupliqué ou perdu

---

## ✅ Checklist de validation finale

### Avant déploiement Preview

- [ ] Paiement Stripe complet (1.1 → 1.8)
- [ ] Email confirmation reçu (2.1)
- [ ] Pages légales lisibles (3.1 → 3.3)
- [ ] Accès produit OK (4.1)
- [ ] Sécurité validée (5.1 → 5.4)
- [ ] Aucune erreur console JS
- [ ] Aucune erreur Vercel logs
- [ ] Base de données cohérente

### Avant déploiement Production

- [ ] Identique Preview (tous tests)
- [ ] Mode production Stripe activé (pas test)
- [ ] SMTP configuré sur domaine officiel
- [ ] DNS SPF/DKIM/DMARC vérifiés
- [ ] Rate limiting SMTP OK
- [ ] Webhooks Stripe pointent URL prod
- [ ] Certificats SSL valides
- [ ] Monitoring activé

---

## 📊 Rapports à générer

### Après tests locaux
```bash
# Logs d'erreur
tail -f .vercel/output.log

# Statistiques base de données
SELECT COUNT(*) FROM orders WHERE status = 'paid';
SELECT COUNT(*) FROM payment_events;
```

### Avant production
```bash
# Vérifier migrations
supabase migrations list --local

# Vérifier env vars Vercel
vercel env ls --prod
```

---

## 🆘 Dépannage

### Email ne reçu pas
1. Vérifier logs SMTP (Brevo/Sendgrid dashboard)
2. Vérifier `.env` : SMTP_HOST/USER/PASS corrects
3. Vérifier firewall/antivirus bloque port 587
4. Test simple: `node -e "require('nodemailer').createTransport({...}).sendMail({...})"`

### Stripe webhook non reçu
1. Vérifier webhook URL dans Dashboard Stripe
2. Vérifier `STRIPE_WEBHOOK_SECRET` correct
3. Logs: `vercel logs`
4. Test replay: Dashboard Stripe → Webhooks → Resend

### Commande pas créée
1. Vérifier Supabase RLS policies
2. Vérifier `user_id` NOT NULL constraint
3. Vérifier `SUPABASE_SERVICE_ROLE_KEY` en production

---

## 📞 Escalade

**Si tous les tests passent:** ✅ Prêt pour Preview/Production!

**Si des tests échouent:**
1. Documenter l'erreur exacte
2. Vérifier logs détaillés (Vercel, Supabase, SMTP)
3. Tester en isolation (ex: curl webhook, nodemailer test)
4. Contacter support Stripe/Supabase si nécessaire

---

**Bonne chance! 🚀**
