import Link from "next/link";

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-14 text-slate-900 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-[#172b27] sm:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="mt-3 text-sm text-slate-500">Dernière mise à jour : 2 novembre 2026</p>
        <p className="mt-6 leading-relaxed text-slate-600">
          Cette politique explique comment Sphorix France traite les données personnelles
          lors de la navigation sur le site, de l&apos;envoi d&apos;une demande, de la création
          d&apos;un compte ou d&apos;une commande.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600 sm:text-base">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">Responsable du traitement</h2>
            <p className="mt-2">
              Le responsable du traitement est Sphorix France. Pour toute question ou demande
              concernant vos données :{" "}
              <a className="font-semibold text-[#b94d2d] underline underline-offset-2" href="mailto:contact@sphorix.fr">
                contact@sphorix.fr
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Données traitées</h2>
            <p className="mt-2">Selon les services que vous utilisez, les données peuvent comprendre :</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Pour les demandes de contact ou d&apos;estimation : nom, adresse email, téléphone
                si renseigné, entreprise, activité, besoins et contenu du message.
              </li>
              <li>
                Pour un compte : adresse email, nom, entreprise, téléphone et informations
                nécessaires à l&apos;authentification.
              </li>
              <li>
                Pour l&apos;espace de suivi client : dossiers et étapes de travaux, statuts,
                échéances, messages échangés avec Sphorix, logiciels ou abonnements associés,
                ainsi que les documents partagés (par exemple devis, factures et livrables).
                Lorsqu&apos;un accès est créé sur invitation, les informations de l&apos;invitation,
                son état et sa date d&apos;expiration sont également traités. Le lien contient un
                jeton à usage unique ; seul son empreinte est conservée dans la base.
              </li>
              <li>
                Pour une commande : produits, quantités, montant, statut, email associé à la
                commande et informations de téléchargement.
              </li>
              <li>
                Lorsque l&apos;assistant conversationnel est activé : contenu des messages,
                réponses, identifiant technique de conversation, sources consultées et, lors
                de sa clôture, un compte rendu généré automatiquement. Les coordonnées ne
                sont retenues dans ce compte rendu que si vous les communiquez volontairement.
              </li>
              <li>
                L&apos;adresse IP peut être utilisée temporairement pour limiter les abus et
                sécuriser les formulaires et le chatbot. Pour le chatbot, elle est hachée
                avant d&apos;être utilisée pour la limitation du débit.
              </li>
            </ul>
            <p className="mt-3">
              Les paiements en ligne sont traités par Stripe. Sphorix France ne reçoit pas et
              ne conserve pas le numéro complet de votre carte bancaire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Pourquoi et sur quelle base</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                Répondre aux demandes de contact et d&apos;estimation : mesures précontractuelles
                prises à votre demande.
              </li>
              <li>
                Créer et gérer un compte, une commande ou un téléchargement : exécution du
                service demandé ou du contrat.
              </li>
              <li>
                Donner accès au suivi des travaux, aux logiciels associés et aux documents
                partagés : exécution du service ou du contrat demandé.
              </li>
              <li>
                Créer et sécuriser un accès client sur invitation, puis vérifier son
                acceptation : exécution du service demandé et intérêt légitime à protéger
                l&apos;espace client.
              </li>
              <li>
                Traiter les paiements et respecter les obligations comptables : exécution du
                contrat et obligations légales applicables.
              </li>
              <li>
                Prévenir les soumissions abusives et sécuriser le site : intérêt légitime de
                Sphorix France à protéger ses services.
              </li>
              <li>
                Fournir des réponses à partir des informations publiques du site, orienter
                les visiteurs et assurer le suivi des demandes adressées à l&apos;assistant :
                intérêt légitime de Sphorix France ; lorsqu&apos;une demande de devis ou de
                rendez-vous est formulée, mesures précontractuelles prises à votre demande.
              </li>
              <li>
                Lorsque le formulaire de contact vous le demande, votre accord sert à utiliser
                les informations pour vous recontacter. Vous pouvez le retirer en écrivant à
                l&apos;adresse indiquée ci-dessus.
              </li>
            </ul>
            <p className="mt-3">
              Les informations marquées comme obligatoires sont nécessaires pour traiter la
              demande ou fournir le service. Sans elles, nous pourrions ne pas être en mesure
              de vous répondre ou d&apos;exécuter votre commande.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Durées de conservation</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                Les demandes de contact et d&apos;estimation enregistrées dans notre base sont
                conservées au maximum 24 mois à compter de leur réception, puis supprimées
                automatiquement. La purge est planifiée chaque jour.
              </li>
              <li>
                Lorsque le chatbot est activé, ses conversations, messages et comptes rendus
                sont conservés au maximum 24 mois à compter de leur création, puis supprimés
                automatiquement. Vous pouvez aussi supprimer une conversation depuis le
                chatbot. Les données techniques de limitation du débit sont supprimées après
                24 heures.
              </li>
              <li>
                Les données de compte sont conservées tant que le compte est actif. Vous pouvez
                demander sa suppression par email ; les données nécessaires au respect
                d&apos;obligations légales peuvent être conservées séparément pendant la durée
                requise.
              </li>
              <li>
                Les dossiers de suivi, échanges et documents client sont conservés pendant la
                relation de service et le temps nécessaire à son suivi, sous réserve des durées
                de conservation légales applicables, notamment pour les pièces comptables.
              </li>
              <li>
                Les pièces et informations relatives aux commandes sont conservées pendant
                les durées imposées par les obligations légales applicables.
              </li>
              <li>
                Les copies d&apos;échanges présentes dans les boîtes de messagerie sont utilisées
                pour traiter les demandes et sont supprimées lorsqu&apos;elles ne sont plus
                nécessaires.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Destinataires et prestataires</h2>
            <p className="mt-2">
              Les données sont accessibles aux personnes autorisées de Sphorix France et, dans
              la mesure nécessaire, aux prestataires qui contribuent au fonctionnement du site :
              Vercel pour l&apos;hébergement, Supabase pour l&apos;authentification et le stockage
              des données, Stripe pour le paiement et le fournisseur de messagerie configuré
              pour l&apos;envoi des emails. Lorsque le chatbot est activé, Microsoft Azure
              (Azure AI Foundry et Azure AI Search) traite les messages nécessaires à la
              génération des réponses et à la recherche dans les pages publiques du site.
              Les conversations et comptes rendus sont stockés dans Supabase et accessibles
              aux administrateurs autorisés.
            </p>
            <p className="mt-3">
              Les documents de l&apos;espace client sont stockés dans un espace privé Supabase.
              Ils ne sont accessibles qu&apos;aux personnes autorisées de Sphorix France et au
              compte client auquel ils sont associés ; les liens de téléchargement sont
              temporaires.
            </p>
            <p className="mt-3">
              Ces prestataires traitent les données selon leurs rôles et engagements
              contractuels. Pour Azure, l&apos;emplacement dépend de la région configurée pour
              les ressources utilisées. Selon cette région et la configuration des
              prestataires, certains traitements peuvent impliquer un transfert hors de
              l&apos;Espace économique européen ; les garanties prévues par la réglementation
              applicable doivent alors être mises en œuvre.
            </p>
            <p className="mt-3">
              Les données ne sont pas vendues ni utilisées pour envoyer de la publicité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Cookies et stockage dans le navigateur</h2>
            <p className="mt-2">
              Des cookies nécessaires sont utilisés pour maintenir la session de connexion
              à un compte et mémoriser votre choix relatif aux cookies. Le cookie de préférence
              est conservé pendant 6 mois. Ces cookies ne servent pas à la publicité ni à la
              mesure d&apos;audience.
            </p>
            <p className="mt-3">
              Lorsque le chatbot est activé, un cookie technique strictement nécessaire,
              inaccessible au JavaScript de la page, permet de rattacher vos échanges à votre
              session et de reprendre la conversation. Il est conservé au maximum 24 mois.
              Il ne sert ni à la publicité ni au suivi de navigation.
            </p>
            <p className="mt-3">
              À ce jour, aucun outil facultatif de mesure d&apos;audience ou de publicité n&apos;est
              activé. Le bandeau vous permet d&apos;enregistrer vos préférences ; ce choix
              n&apos;active aucun outil absent du site. Si de tels outils sont ajoutés, ils ne
              seront activés qu&apos;après votre choix et nous vous informerons de leurs
              finalités.
            </p>
            <p className="mt-3">
              Le panier et certains outils de gestion enregistrent des données dans le stockage
              local de votre navigateur. Il ne s&apos;agit pas de cookies. Vous pouvez effacer
              ces données depuis les paramètres de votre navigateur ; cela peut supprimer le
              panier ou les données conservées localement dans ces outils.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Vos droits</h2>
            <p className="mt-2">
              Dans les conditions prévues par la réglementation, vous pouvez demander l&apos;accès,
              la rectification ou l&apos;effacement de vos données, la limitation ou l&apos;opposition
              à certains traitements, ainsi que la portabilité des données lorsque ce droit
              s&apos;applique. Lorsque le traitement repose sur votre consentement, vous pouvez
              le retirer à tout moment ; cela ne remet pas en cause les traitements antérieurs.
            </p>
            <p className="mt-3">
              Vous pouvez supprimer une conversation directement dans le chatbot. Pour exercer
              vos autres droits sur les échanges ou demander leur effacement, écrivez à
              l&apos;adresse ci-dessous en précisant la période approximative de la conversation.
            </p>
            <p className="mt-3">
              Adressez votre demande à{" "}
              <a className="font-semibold text-[#b94d2d] underline underline-offset-2" href="mailto:contact@sphorix.fr">
                contact@sphorix.fr
              </a>. Une preuve d&apos;identité ne sera demandée qu&apos;en cas de doute raisonnable
              sur votre identité. Nous répondrons dans un délai d&apos;un mois, susceptible d&apos;être
              prolongé dans les conditions prévues par la réglementation.
            </p>
            <p className="mt-3">
              Vous pouvez également introduire une réclamation auprès de la{" "}
              <Link
                className="font-semibold text-[#b94d2d] underline underline-offset-2"
                href="https://www.cnil.fr/fr/plaintes"
                target="_blank"
                rel="noopener noreferrer"
              >
                CNIL
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Sécurité et contact</h2>
            <p className="mt-2">
              Des mesures techniques et organisationnelles adaptées sont mises en œuvre pour
              protéger les données. Pour toute question sur cette politique ou sur le traitement
              de vos données, écrivez à{" "}
              <a className="font-semibold text-[#b94d2d] underline underline-offset-2" href="mailto:contact@sphorix.fr">
                contact@sphorix.fr
              </a>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
