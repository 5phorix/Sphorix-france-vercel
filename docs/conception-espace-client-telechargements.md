# Conception de l’espace client et des téléchargements

## Objectif

Permettre à un client ayant payé un produit numérique de retrouver sa commande et de télécharger ses fichiers sans exposer les fichiers Supabase Storage.

## Parcours principal

```text
Paiement Stripe confirmé
        |
        v
Commande passée à paid
        |
        v
Client ouvre le lien de connexion Supabase
        |
        v
Commande rattachée à son email
        |
        v
Droits de téléchargement créés
        |
        v
Espace client
        |
        v
URL signée temporaire vers le bucket privé
```

## 1. Commande payée

- Stripe confirme le paiement par webhook signé.
- Le webhook vérifie la signature avant toute modification.
- La commande passe de `pending` à `paid`.
- Le traitement doit être idempotent : un webhook rejoué ne doit pas créer de doublons.
- Les prix et produits utilisés restent ceux enregistrés dans `order_items`.

## 2. Rattachement au compte

- Le client se connecte avec l’adresse email utilisée lors du paiement.
- Après authentification, les commandes `paid` dont `customer_email` correspond à l’email du compte sont rattachées à `user_id`.
- Le rattachement doit être effectué côté serveur avec la clé service role.
- Une commande déjà rattachée à un autre compte ne doit jamais être réattribuée automatiquement.
- Les emails doivent être normalisés en minuscules avant comparaison.

## 3. Création des droits

Pour chaque ligne d’une commande payée :

- récupérer le produit correspondant ;
- récupérer ses fichiers dans `product_files` ;
- créer une entrée dans `downloads` pour chaque fichier ;
- utiliser la contrainte unique `(order_item_id, product_file_id)` pour garantir l’idempotence ;
- enregistrer l’utilisateur propriétaire du droit.

Un produit sans fichier doit apparaître comme acheté mais sans téléchargement disponible, avec un état explicite côté interface.

## 4. Stockage privé

- Bucket : `digital-products`.
- Bucket non public.
- Les fichiers ne doivent jamais être placés dans `public/`.
- Le chemin Storage brut ne doit jamais être affiché au navigateur.
- Les opérations d’écriture et de suppression utilisent uniquement la clé service role côté serveur.

## 5. Endpoint de téléchargement

Route prévue : `GET /api/downloads/[id]`.

Contrôles obligatoires :

1. récupérer l’utilisateur Supabase courant ;
2. refuser la requête si l’utilisateur est absent ;
3. rechercher le droit `downloads.id` avec `downloads.user_id = auth.uid()` ;
4. récupérer le fichier lié ;
5. générer une URL signée Supabase Storage de courte durée ;
6. incrémenter le compteur et enregistrer la date ;
7. rediriger vers l’URL signée.

Réponses attendues :

- `401` : utilisateur non connecté ;
- `404` : droit ou fichier introuvable ;
- `403` : tentative d’accès à un droit qui appartient à un autre utilisateur ;
- `500` : problème Storage ou serveur.

Durée recommandée de l’URL signée : 10 minutes.

## 6. Espace client

La page `/compte` doit présenter :

- email du compte connecté ;
- bouton de déconnexion ;
- commandes payées ;
- date et montant de chaque commande ;
- liste des fichiers disponibles ;
- nom original du fichier ;
- bouton Télécharger ;
- état “fichier en préparation” si aucun fichier n’est encore associé.

La page ne doit jamais afficher les commandes ou téléchargements d’un autre utilisateur.

## 7. Récupération par email

Solution recommandée : lien magique Supabase Auth.

- L’utilisateur saisit l’email de commande.
- Supabase envoie un lien de connexion.
- Le lien redirige vers `/auth/callback`.
- Après échange du code, l’utilisateur arrive sur `/compte`.
- Le rattachement des commandes s’effectue après authentification.

Évolution possible :

- email spécifique “Retrouver mes achats” ;
- lien signé à usage limité ;
- expiration et révocation des liens ;
- support client en cas d’adresse erronée.

## 8. Sécurité

- Ne jamais faire confiance à un `user_id` fourni par le navigateur.
- Ne jamais autoriser un téléchargement à partir du seul `order_id`.
- Ne jamais rendre le bucket public.
- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` au client.
- Vérifier l’idempotence du webhook Stripe.
- Journaliser les erreurs sans exposer les secrets.
- Limiter la durée des URLs signées.
- Prévoir une révocation des droits en cas de remboursement.

## 9. Cas particuliers

### Remboursement

- Passer la commande à `refunded`.
- Refuser les nouveaux téléchargements.
- Les URLs déjà générées restent limitées dans le temps.

### Email différent

- Ne pas rattacher automatiquement la commande.
- Proposer une procédure de support ou une preuve de paiement.

### Produit remplacé

- Conserver l’ancien fichier pour les anciennes commandes si nécessaire.
- Ajouter un nouveau `product_file` pour les futures commandes.

### Webhook rejoué

- Ne pas recréer la commande.
- Ne pas recréer les droits grâce aux contraintes uniques.

## 10. Critères d’acceptation

- [ ] Un paiement Stripe confirmé produit une commande `paid`.
- [ ] Un client peut se connecter par lien magique.
- [ ] Une commande payée est rattachée au bon compte.
- [ ] Les droits sont créés une seule fois.
- [ ] Un utilisateur ne peut pas télécharger le fichier d’un autre utilisateur.
- [ ] Un fichier n’est jamais accessible par URL publique.
- [ ] L’URL signée expire après la durée prévue.
- [ ] Un remboursement bloque les nouveaux téléchargements.
- [ ] Un webhook rejoué ne crée aucun doublon.
- [ ] Les cas d’absence de fichier sont visibles et compréhensibles.
