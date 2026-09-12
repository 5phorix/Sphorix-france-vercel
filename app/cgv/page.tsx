"use client";

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold tracking-[-0.04em] text-slate-950">Conditions générales de vente</h1>
        <p className="mt-4 text-slate-600">Dernière mise à jour : 12 septembre 2026</p>

        <div className="prose prose-slate mt-12 max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">1. Objet et champ d'application</h2>
            <p>
              Les présentes conditions générales de vente (ci-après « CGV ») régissent les relations commerciales entre
              <strong> Sphorix France</strong> (ci-après « le Vendeur ») et ses clients personnes physiques ou morales
              (ci-après « le Client ») pour l'achat de produits numériques (fichiers, outils, modèles Excel, tableaux
              de bord) proposés sur le site <strong>sphorix-france.fr</strong> (ci-après « la Plateforme »).
            </p>
            <p>
              Toute commande implique l'acceptation sans réserve des présentes CGV. L'absence de protestation du Client
              vaut acceptation.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">2. Offre et prix</h2>
            <p>
              Les prix affichés sont exprimés en euros TTC (toutes taxes comprises). Ils sont valables au moment de la
              commande et peuvent être modifiés à tout moment sans préavis, sauf pour les commandes en cours de traitement.
            </p>
            <p>
              Les produits numériques proposés sont décrits sur les fiches produit de la Plateforme. Les photographies,
              schémas et descriptions sont fournis à titre informatif et non contractuel.
            </p>
            <p>
              Le Vendeur se réserve le droit de modifier l'offre, de suspendre ou de cesser la vente de produits à tout
              moment, en particulier en cas de rupture de stock numérique ou de problème technique.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">3. Commande et paiement</h2>
            <p>
              Le Client confirme sa commande via la Plateforme. Une commande n'est valide que lorsque le paiement a été
              entièrement reçu et traité.
            </p>
            <p>
              <strong>Modalités de paiement :</strong>
            </p>
            <ul>
              <li>Paiement par carte bancaire via Stripe (sécurisé)</li>
              <li>Tous les paiements sont traités en EUR (euros)</li>
              <li>Le client doit utiliser une adresse email valide pour recevoir la confirmation de commande</li>
            </ul>
            <p>
              En cas de refus ou d'échec du paiement, la commande est automatiquement annulée et le Client ne peut pas
              accéder aux produits. Les coordonnées bancaires ne sont jamais conservées sur nos serveurs.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">4. Livraison des produits numériques</h2>
            <p>
              Les produits numériques sont des biens immatériels. Une fois le paiement confirmé, le Client reçoit :
            </p>
            <ul>
              <li>Un email de confirmation avec un lien de téléchargement sécurisé</li>
              <li>L'accès à son espace client pour consulter ses commandes et téléchargements</li>
              <li>Une durée de disponibilité des liens de téléchargement : <strong>30 jours</strong> à partir de la
                commande</li>
            </ul>
            <p>
              Après ce délai, les liens expirent. Le Client doit se connecter à son espace pour régénérer les liens si
              nécessaire.
            </p>
            <p>
              <strong>Importante limitation :</strong> En accord avec la politique de l'UE sur les produits numériques,
              il n'y a <strong>pas de droit de rétractation</strong> une fois le téléchargement effectué ou l'accès au
              produit commencé.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">5. Responsabilités du Vendeur</h2>
            <p>
              Le Vendeur s'engage à fournir des produits de qualité, testés et fonctionnels. Cependant :
            </p>
            <ul>
              <li>Les produits numériques sont fournis « en l'état »</li>
              <li>Le Vendeur ne peut être tenu responsable des dysfonctionnements liés à la version logicielle du Client
                (Excel, navigateur, système d'exploitation)</li>
              <li>Aucune assistance personnalisée n'est incluse sauf mention explicite dans l'offre</li>
              <li>Le Vendeur ne garantit pas la compatibilité totale avec toutes les versions logicielles futures</li>
            </ul>
            <p>
              Les produits sont commercialisés à titre de modèles ou d'outils. Ils ne remplacent pas un conseil
              professionnel adapté à votre situation spécifique.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">6. Propriété intellectuelle</h2>
            <p>
              Tous les produits numériques vendus par Sphorix France sont protégés par les droits d'auteur. Le Client
              acquiert une licence d'utilisation personnelle, non exclusive et incessible.
            </p>
            <p>
              Le Client s'engage à :
            </p>
            <ul>
              <li>Utiliser les produits pour un usage personnel ou professionnel uniquement</li>
              <li>Ne pas reproduire, copier, modifier ou partager les produits sans autorisation</li>
              <li>Ne pas revendre ou redistribuer les produits</li>
              <li>Respecter les droits d'auteur et les marques du Vendeur</li>
            </ul>
            <p>
              Toute utilisation non autorisée expose le Client à des poursuites légales.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">7. Données personnelles</h2>
            <p>
              Les données personnelles fournies lors de la commande (adresse email, informations de facturation) sont
              collectées et traitées conformément à la
              <a href="/politique-confidentialite" className="text-orange-600 hover:text-orange-700"> politique de
                confidentialité</a>.
            </p>
            <p>
              Le Client consent à recevoir des communications marketing optionnelles. Il peut se désabonner à tout moment
              via le lien présent dans les emails.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">8. Garantie et limitations</h2>
            <p>
              <strong>Garantie limitée :</strong> Si un produit ne fonctionne pas correctement du fait du Vendeur, le
              Client peut demander un remboursement complet dans les 7 jours suivant la commande, à condition que le
              produit n'ait pas été modifié.
            </p>
            <p>
              <strong>Limitations de responsabilité :</strong> Le Vendeur décline toute responsabilité quant aux
              dommages indirects, pertes de données, pertes de profits ou interruptions commerciales résultant de
              l'utilisation ou de l'incapacité à utiliser les produits.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">9. Droit de rétractation</h2>
            <p>
              Conformément à la directive UE 2011/83/UE sur les produits numériques :
            </p>
            <ul>
              <li><strong>Avant accès/téléchargement :</strong> 14 jours pour exercer le droit de rétractation</li>
              <li><strong>Après accès/téléchargement :</strong> Pas de droit de rétractation, le produit devient
                consommé</li>
            </ul>
            <p>
              Les demandes de rétractation doivent être adressées à <a href="mailto:contact@sphorix-france.fr"
                className="text-orange-600 hover:text-orange-700">contact@sphorix-france.fr</a> avec
              la preuve d'achat.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">10. Remboursement</h2>
            <p>
              Voir la <a href="/politique-remboursement" className="text-orange-600 hover:text-orange-700">politique de
                remboursement</a> détaillée.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">11. Litiges et droit applicable</h2>
            <p>
              Les présentes CGV sont régies par le droit français. En cas de litiges, le Client engage d'abord une
              procédure amiable en contactant <a href="mailto:contact@sphorix-france.fr"
                className="text-orange-600 hover:text-orange-700">contact@sphorix-france.fr</a>.
            </p>
            <p>
              À défaut de résolution, les litiges sont soumis à la compétence des tribunaux français selon les règles
              de juridiction applicables.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">12. Modification des CGV</h2>
            <p>
              Sphorix France se réserve le droit de modifier ces CGV à tout moment. Les modifications s'appliqueront aux
              nouvelles commandes. Les commandes passées avant la modification restent régies par les CGV en vigueur à la
              date de commande.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">13. Contact</h2>
            <p>
              Pour toute question sur ces CGV ou pour exercer vos droits :
            </p>
            <ul>
              <li><strong>Email :</strong> contact@sphorix-france.fr</li>
              <li><strong>Site :</strong> https://sphorix-france.fr</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
