"use client";

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold tracking-[-0.04em] text-slate-950">Conditions générales de vente</h1>
        <p className="mt-4 text-slate-600">Dernière mise à jour : 2 novembre 2026</p>

        <div className="prose prose-slate mt-12 max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">1. Objet et champ d’application</h2>
            <p>
              Les présentes conditions générales de vente (ci-après « CGV ») régissent les ventes de produits
              numériques proposées sur <strong>sphorix.fr</strong>, ainsi que les prestations de services lorsque
              le devis ou le contrat accepté par le Client les soumet aux présentes CGV. Sphorix France est désigné
              comme le « Vendeur » et l&apos;acheteur comme le « Client ».
            </p>
            <p>
              Les caractéristiques essentielles, le prix, le contenu de la prestation et ses modalités sont précisés
              sur la fiche produit ou, pour une prestation sur mesure, dans le devis ou le contrat communiqué au
              Client avant son accord.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">2. Offre et prix</h2>
            <p>
              Les prix affichés sur le site sont exprimés en euros et les taxes applicables sont indiquées avant la
              validation de la commande. Pour une prestation sur devis, le prix et les éventuelles modalités de
              paiement sont ceux précisés dans le devis accepté. Les prix peuvent évoluer pour les commandes futures ;
              le prix d&apos;une commande déjà confirmée ou d&apos;un devis accepté ne change pas, sauf accord écrit
              des parties.
            </p>
            <p>
              Les produits numériques sont décrits sur leurs fiches produit. Les visuels sont illustratifs et les
              caractéristiques essentielles présentées dans la description de l&apos;offre restent celles qui
              déterminent la commande.
            </p>
            <p>
              Le Vendeur peut modifier ou retirer une offre pour les commandes futures, sans effet sur une commande
              déjà confirmée.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">3. Commande et paiement</h2>
            <p>
              Pour un produit vendu sur le site, la commande est confirmée après validation du paiement. Pour une
              prestation sur devis, elle est conclue selon les modalités et à la date d&apos;acceptation indiquées
              dans le devis ou le contrat.
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
              En cas de refus ou d&apos;échec du paiement en ligne, la commande n&apos;est pas confirmée et l&apos;accès
              au produit n&apos;est pas ouvert. Les paiements par carte sont traités par Stripe ; Sphorix France ne
              conserve pas le numéro complet de la carte bancaire.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">4. Livraison et suivi des prestations</h2>
            <p>
              Les produits numériques sont des biens immatériels. Une fois le paiement confirmé, le Client reçoit :
            </p>
            <ul>
              <li>Un email de confirmation et, selon le produit, un lien de téléchargement sécurisé</li>
              <li>L’accès à son espace client pour consulter ses commandes et téléchargements</li>
              <li>Une disponibilité du lien de téléchargement indiquée lors de la commande ; lorsqu&apos;il expire,
                le Client peut contacter Sphorix France pour obtenir de l&apos;aide</li>
            </ul>
            <p>
              Pour les prestations suivies dans l&apos;espace client, les dossiers, étapes, messages et documents mis
              à disposition servent au suivi de l&apos;avancement. Ils ne modifient pas le contenu du devis ou du
              contrat accepté. L&apos;espace client est un outil de suivi et de consultation ; il ne déclenche ni
              facturation ni paiement automatique.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">5. Responsabilités du Vendeur</h2>
            <p>
              Le Vendeur fournit les produits et prestations conformément à leur description et, le cas échéant, au
              devis ou contrat accepté. Les garanties légales applicables demeurent pleinement applicables.
            </p>
            <ul>
              <li>Les éventuelles limites de compatibilité ou prérequis techniques sont indiqués dans la description du produit ou du service.</li>
              <li>L’assistance ou la maintenance est incluse uniquement si l’offre, le devis ou le contrat le prévoit.</li>
              <li>Le Client reste responsable de la sauvegarde de ses données et de l’utilisation des produits selon les instructions fournies.</li>
            </ul>
            <p>
              Les produits numériques sont des outils ou modèles et ne remplacent pas un conseil professionnel adapté
              à la situation particulière du Client.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">6. Propriété intellectuelle</h2>
            <p>
              Tous les produits numériques vendus par Sphorix France sont protégés par les droits d’auteur. Le Client
              acquiert une licence d’utilisation personnelle, non exclusive et incessible.
            </p>
            <p>
              Le Client s’engage à :
            </p>
            <ul>
              <li>Utiliser les produits pour un usage personnel ou professionnel uniquement</li>
              <li>Ne pas reproduire, copier, modifier ou partager les produits sans autorisation</li>
              <li>Ne pas revendre ou redistribuer les produits</li>
              <li>Respecter les droits d’auteur et les marques du Vendeur</li>
            </ul>
            <p>
              Toute utilisation non autorisée expose le Client à des poursuites légales.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">7. Données personnelles</h2>
            <p>
              Les données liées aux commandes, comptes et prestations, y compris les échanges et documents transmis
              dans l&apos;espace client, sont traitées conformément à la{" "}
              <a href="/politique-confidentialite" className="text-orange-600 hover:text-orange-700">
                politique de confidentialité
              </a>.
            </p>
            <p>
              Les communications commerciales ne sont envoyées que lorsque la réglementation l&apos;autorise et, si
              nécessaire, après recueil du consentement du Client. Celui-ci peut retirer son consentement à tout moment.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">8. Garantie et limitations</h2>
            <p>
              Les garanties légales applicables aux consommateurs ne sont pas exclues par les présentes CGV. Pour
              signaler un problème avec un produit ou une prestation, le Client peut contacter Sphorix France à
              l&apos;adresse indiquée à la fin de ces CGV.
            </p>
            <p>
              Chaque partie répond des dommages directs dont elle est responsable dans les conditions prévues par la
              loi. Aucune stipulation des présentes ne limite une responsabilité qui ne peut légalement être limitée.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">9. Droit de rétractation</h2>
            <p>
              Lorsque le Client est un consommateur ou un non-professionnel, il bénéficie du droit de rétractation
              prévu par la réglementation applicable, sous réserve des exceptions prévues par celle-ci. Les
              informations et modalités d&apos;exercice sont communiquées avant la commande lorsque ce droit
              s&apos;applique.
            </p>
            <p>
              Pour un contenu numérique fourni sans support matériel avant la fin du délai de rétractation, la perte
              éventuelle de ce droit ne peut intervenir que dans les conditions légales, notamment après accord
              préalable exprès du Client et reconnaissance de cette perte. Le simple téléchargement ou l&apos;accès
              au contenu ne suffit pas à lui seul.
            </p>
            <p>
              Pour une prestation dont l&apos;exécution commence avant la fin de ce délai à la demande du Client,
              les conséquences éventuelles sur le droit de rétractation sont celles prévues par la loi. Toute demande
              doit être adressée à{" "}
              <a href="mailto:contact@sphorix.fr" className="text-orange-600 hover:text-orange-700">
                contact@sphorix.fr
              </a>.
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
              Les présentes CGV sont régies par le droit français. En cas de difficulté, le Client est invité à
              contacter Sphorix France afin de rechercher une solution amiable, sans préjudice de ses droits légaux.
              Les règles de compétence applicables s&apos;appliquent en cas de litige.
            </p>
            <p>
              À défaut de résolution, les litiges sont soumis à la compétence des tribunaux français selon les règles
              de juridiction applicables.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">12. Modification des CGV</h2>
            <p>
              Sphorix France se réserve le droit de modifier ces CGV à tout moment. Les modifications s’appliqueront aux
              nouvelles commandes. Les commandes passées avant la modification restent régies par les CGV en vigueur à la
              date de commande.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">13. Contact</h2>
            <p>
              Pour toute question concernant ces CGV :
            </p>
            <ul>
              <li><strong>Email :</strong> contact@sphorix.fr</li>
              <li><strong>Site :</strong> https://www.sphorix.fr</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
