"use client";

export default function PolitiqueRemboursementPage() {
  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold tracking-[-0.04em] text-slate-950">Politique de remboursement et retour</h1>
        <p className="mt-4 text-slate-600">Dernière mise à jour : 12 septembre 2026</p>

        <div className="prose prose-slate mt-12 max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">1. Principes généraux</h2>
            <p>
              Sphorix France s'engage à garantir la satisfaction de ses clients. Cette politique explique comment fonctionnent
              les remboursements pour les produits numériques vendus sur notre plateforme.
            </p>
            <div
              className="rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4"
              role="note"
            >
              <p className="mb-0">
                <strong>Important :</strong> Les produits numériques étant des biens immatériels, les conditions de
                remboursement sont strictement encadrées par la loi française et européenne.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">2. Délais de remboursement</h2>
            <p>
              Vous bénéficiez d'un droit de rétractation de <strong>14 jours</strong> à compter de la date de votre commande,
              <strong>sous certaines conditions</strong>.
            </p>
            <p>
              <strong>Cas 1 : Avant téléchargement ou accès au produit</strong>
            </p>
            <ul>
              <li>Vous pouvez demander un remboursement dans les <strong>14 jours</strong></li>
              <li>Aucune condition supplémentaire</li>
              <li>Le remboursement est traité sous <strong>5 à 10 jours ouvrables</strong></li>
            </ul>
            <p>
              <strong>Cas 2 : Après téléchargement ou accès</strong>
            </p>
            <ul>
              <li>Vous <strong>acceptez implicitement</strong> que le produit numérique devient consommé</li>
              <li>Selon la loi UE 2011/83/UE, il n'existe <strong>pas de droit de rétractation</strong> une fois l'accès
                commencé</li>
              <li>Un remboursement est exceptionnellement possible uniquement si le produit est défectueux (voir section 3)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">3. Remboursement pour défaut ou dysfonctionnement</h2>
            <p>
              Si un produit ne fonctionne pas comme décrit ou présente un défaut technique attributable au Vendeur :
            </p>
            <ul>
              <li>Vous pouvez demander un remboursement dans les <strong>7 jours</strong> après achat</li>
              <li>Décrivez précisément le problème lors de votre demande</li>
              <li>Indiquez votre version d'Excel, de navigateur ou système d'exploitation</li>
              <li>Fournissez des preuves (captures d'écran, message d'erreur)</li>
            </ul>
            <p>
              <strong>Exclusions :</strong> Ne seront pas considérés comme des défauts :
            </p>
            <ul>
              <li>Les problèmes liés à votre version logicielle (Excel trop ancien, navigateur incompatible)</li>
              <li>Les incompatibilités avec vos paramètres système</li>
              <li>Les demandes de personnalisation ou d'adaptation à vos besoins spécifiques</li>
              <li>Les modifications que vous avez apportées au produit</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">4. Conditions pour un remboursement</h2>
            <p>
              Pour être admissible au remboursement, vous devez :
            </p>
            <ul>
              <li>Être le client d'origine (adresse email d'achat)</li>
              <li>Contacter <a href="mailto:contact@sphorix-france.fr"
                className="text-orange-600 hover:text-orange-700">contact@sphorix-france.fr</a> avec votre
                <strong> numéro de commande</strong></li>
              <li>Fournir une <strong>raison claire</strong> du remboursement</li>
              <li>Respecter les délais (14 jours avant accès, 7 jours après pour défaut)</li>
            </ul>
            <p>
              Les demandes incomplètes ou hors délai seront rejetées.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">5. Processus de remboursement</h2>
            <p>
              <strong>Étape 1 : Demande</strong>
            </p>
            <p>
              Envoyez un email à contact@sphorix-france.fr avec :
            </p>
            <ul>
              <li>Votre numéro de commande</li>
              <li>Votre adresse email d'achat</li>
              <li>La raison du remboursement</li>
              <li>Tout détail pertinent ou preuve</li>
            </ul>
            <p>
              <strong>Étape 2 : Évaluation</strong>
            </p>
            <p>
              Nous examinons votre demande sous <strong>3 à 5 jours ouvrables</strong>. Nous pouvons vous contacter pour
              plus d'informations.
            </p>
            <p>
              <strong>Étape 3 : Décision</strong>
            </p>
            <p>
              Vous recevez une réponse confirming ou refusant votre remboursement.
            </p>
            <p>
              <strong>Étape 4 : Traitement</strong>
            </p>
            <p>
              Si approuvé, le remboursement est traité sous <strong>5 à 10 jours ouvrables</strong> vers votre
              moyen de paiement d'origine.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">6. Remboursements partiels</h2>
            <p>
              En général, tous les remboursements sont complets. Cependant, Sphorix France se réserve le droit de
              retenir une partie du remboursement en cas de :
            </p>
            <ul>
              <li>Fraude ou utilisation malveillante</li>
              <li>Violation de nos conditions générales</li>
              <li>Revente ou partage non autorisé du produit</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">7. Cas spécifiques : produits numériques</h2>
            <p>
              <strong>Fichiers Excel, modèles et outils :</strong>
            </p>
            <ul>
              <li>Une fois téléchargés et ouverts, ils sont considérés comme consommés</li>
              <li>Pas de remboursement sauf pour défaut technique</li>
            </ul>
            <p>
              <strong>Abonnements ou services récurrents :</strong>
            </p>
            <ul>
              <li>Remboursement possible jusqu'à la fin du mois/cycle en cours</li>
              <li>Accès annulé immédiatement après approbation</li>
            </ul>
            <p>
              <strong>Packs ou bundles :</strong>
            </p>
            <ul>
              <li>Si un seul produit du pack est défectueux, remboursement partiel possible</li>
              <li>Contactez-nous pour discuter</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">8. Remboursements Stripe</h2>
            <p>
              <strong>Délai de rétrofacturation :</strong> Les remboursements sont traités via Stripe (notre processeur de
              paiement). Votre banque recevra le remboursement dans les
              <strong> 5 à 10 jours ouvrables</strong>, mais l'apparition sur votre compte peut prendre jusqu'à
              <strong> 2 à 3 semaines</strong> selon votre établissement.
            </p>
            <p>
              <strong>Frais de remboursement :</strong> Aucun frais supplémentaire n'est déduit. Vous recevez le montant
              complet remboursé.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">9. Réclamations et escalade</h2>
            <p>
              Si vous contestez un refus de remboursement :
            </p>
            <ul>
              <li>Contactez directement <a href="mailto:contact@sphorix-france.fr"
                className="text-orange-600 hover:text-orange-700">contact@sphorix-france.fr</a></li>
              <li>Fournissez tous les détails et preuves supplémentaires</li>
              <li>Nous vous répondrons sous <strong>7 jours</strong></li>
            </ul>
            <p>
              Si le différend n'est pas résolu à l'amiable, vous pouvez recourir à la médiation ou aux juridictions
              compétentes selon la loi française.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">10. Exceptions et limitations</h2>
            <p>
              Aucun remboursement ne sera accordé dans les cas suivants :
            </p>
            <ul>
              <li>Demande après le délai imparti</li>
              <li>Raison non documentée ou peu claire</li>
              <li>Produit acheté lors d'une promotion/solde sans raison valable</li>
              <li>Achat accidentel (erreur utilisateur)</li>
              <li>Modification ou utilisation commerciale du produit</li>
              <li>Fraude suspectée</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">11. Garantie de satisfaction</h2>
            <p>
              Nous sommes convaincus de la qualité de nos produits. Si vous ne êtes pas satisfait pour une raison valide
              <strong> avant d'accéder au produit</strong>, nous remboursons sans tracas.
            </p>
            <p>
              Notre objectif est d'assurer votre confiance dans les outils et ressources que vous achetez chez Sphorix France.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">12. Questions fréquentes</h2>
            <p>
              <strong>Q : Puis-je obtenir un remboursement après 14 jours ?</strong>
              <br />
              R : Non, sauf si le produit présente un défaut technique. Les demandes tardives seront rejetées.
            </p>
            <p>
              <strong>Q : Combien de temps avant que l'argent revienne dans mon compte ?</strong>
              <br />
              R : Le remboursement est traité sous 5 à 10 jours, mais votre banque peut prendre jusqu'à 2-3 semaines.
            </p>
            <p>
              <strong>Q : Que se passe-t-il si j'ai des questions sur mon remboursement ?</strong>
              <br />
              R : Contactez contact@sphorix-france.fr avec votre numéro de commande.
            </p>
            <p>
              <strong>Q : Puis-je demander un remboursement après avoir téléchargé le produit ?</strong>
              <br />
              R : En général, non. Une fois téléchargé, le produit est consommé.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">13. Modifications de cette politique</h2>
            <p>
              Sphorix France se réserve le droit de modifier cette politique à tout moment. Les modifications s'appliqueront
              uniquement aux commandes futures, sauf obligation légale.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-950">14. Contact</h2>
            <p>
              Pour toute question concernant les remboursements :
            </p>
            <ul>
              <li><strong>Email :</strong> <a href="mailto:contact@sphorix-france.fr"
                className="text-orange-600 hover:text-orange-700">contact@sphorix-france.fr</a></li>
              <li><strong>Site :</strong> https://sphorix-france.fr</li>
              <li><strong>Temps de réponse :</strong> 1 à 3 jours ouvrables</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
