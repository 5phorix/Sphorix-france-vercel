# Configuration SMTP pour Sphorix France

## Variables d'environnement requises

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```
# Email transactionnel (SMTP)
SMTP_HOST=smtp.votre-fournisseur.fr
SMTP_PORT=587
SMTP_USER=votre-email@votre-domaine.fr
SMTP_PASS=votre-mot-de-passe-app
SMTP_SECURE=false
SMTP_FROM=noreply@sphorix-france.fr

# Stripe (déjà configuré)
STRIPE_SECRET_KEY=sk_test_... ou sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000 (ou votre domaine en prod)
```

## Fournisseurs SMTP recommandés

### 1. **Sendgrid** (très fiable, API simple)
- **Host** : smtp.sendgrid.net
- **Port** : 587
- **User** : apikey
- **Pass** : SG.xxxx... (clé API)
- **Avantage** : 100 emails gratuits/jour

### 2. **Brevo (ancien Sendinblue)** (excellent pour SME)
- **Host** : smtp-relay.brevo.com
- **Port** : 587
- **User** : votre email
- **Pass** : clé SMTP
- **Avantage** : 300 emails/jour gratuits

### 3. **MailerSend** (moderne et fiable)
- **Host** : smtp.mailersend.net
- **Port** : 587
- **User** : votre email
- **Pass** : clé SMTP
- **Avantage** : interface claire, webhooks

### 4. **OVH / votre hébergeur**
- Utilisez les paramètres SMTP de votre hébergeur
- Port généralement 587 ou 25

## Étapes pour configurer Brevo (recommandé pour Sphorix)

1. **Créer un compte** sur [brevo.com](https://www.brevo.com)
2. **Aller dans** `Settings > SMTP & API`
3. **Activer SMTP** et récupérer :
   - **SMTP Server** : smtp-relay.brevo.com
   - **Port** : 587
   - **Username** : votre email
   - **Password** : clé SMTP (générée)
4. **Tester l'envoi** de test emails
5. **Remplir `.env.local`** avec les données

## Tester la configuration localement

```bash
# Démarrer Supabase (incluant ngrok pour webhooks)
npm run supabase:start

# Démarrer le serveur Next.js
npm run dev

# Tester un paiement Stripe en sandbox
# → Se connecter à stripe.com (test)
# → Utiliser les cartes de test fournies
```

## Variables d'environnement en production (Vercel)

Dans votre dashboard Vercel :

1. **Aller à** `Settings > Environment Variables`
2. **Ajouter les variables SMTP** (les mêmes que `.env.local`)
3. **Redéployer** votre application

```
Environment: Production, Preview, Development
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=votre-email@votre-domaine.fr
SMTP_PASS=votre-clé-smtp
SMTP_FROM=noreply@sphorix-france.fr
SMTP_SECURE=false
```

## Emails envoyés par Sphorix

### 1. **Confirmation de commande** (`sendConfirmationEmail`)
- **Quand** : Immédiatement après paiement Stripe confirmé
- **Contient** : Numéro de commande, détails, liens de téléchargement
- **Template** : lib/email.ts

### 2. **Email de bienvenue** (`sendWelcomeEmail`)
- **Quand** : À l'inscription (optionnel)
- **Contient** : Accueil, liens vers compte et boutique
- **À implémenter** : Route `/api/auth/signup`

### 3. **Réinitialisation mot de passe** (`sendPasswordResetEmail`)
- **Quand** : Demande de reset password
- **Contient** : Lien de reset sécurisé (valide 1h)
- **À implémenter** : Route `/api/auth/reset-password`

### 4. **Notification contact** (optionnel)
- **Quand** : Formulaire contact reçu
- **À implémenter** : Route `/api/contact`

## Monitoring des emails

### Logs locaux
Les logs d'envoi apparaissent dans la console :
```
Erreur envoi email confirmation: [erreur]
```

### En production
- **Vercel Functions Logs** : Dashboard Vercel > Functions
- **Emails échoués** : Vérifier les logs SMTP chez Brevo/Sendgrid
- **Rebonds/Plaintes** : Configurer les webhooks chez le fournisseur SMTP

## Dépannage

### Les emails ne s'envoient pas
1. Vérifier les credentials SMTP dans `.env.local`
2. Tester la connexion SMTP (utiliser un client SMTP)
3. Vérifier les logs Vercel
4. S'assurer que le port n'est pas bloqué par le firewall

### Les emails arrivent en spam
1. Configurer **SPF**, **DKIM**, **DMARC** chez votre fournisseur SMTP
2. Utiliser un email `From` officiel du domaine
3. Utiliser TLS/SSL sécurisé
4. Éviter les mots-clés spam dans le contenu

### Le webhook Stripe ne déclenche pas les emails
1. Vérifier que `STRIPE_WEBHOOK_SECRET` est correcte
2. Tester le webhook dans le tableau de bord Stripe
3. Vérifier les logs Vercel pour les erreurs

## Sécurité

✅ **Bonnes pratiques appliquées** :
- Pas de credentials en dur dans le code
- Échappement HTML pour éviter les injections
- Headers sécurisés (Reply-To officiel)
- Validation email avant envoi
- Idempotence des webhooks Stripe

⚠️ **À implémenter** :
- Rate limiting sur les formulaires (flood protection)
- Validation supplémentaire côté serveur
- Audit des emails envoyés (historique)
