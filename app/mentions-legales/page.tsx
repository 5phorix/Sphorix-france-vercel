export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-14 text-slate-900 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
          Informations légales
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Mentions légales</h1>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-600 sm:text-base">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Éditeur du site</h2>
            <p className="mt-2">
              Sphorix France<br />
              Email : <a className="font-semibold text-blue-700 underline" href="mailto:contact@sphorix.fr">contact@sphorix.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Hébergement</h2>
            <p className="mt-2">
              Les informations relatives à l&apos;hébergeur doivent être complétées avec le nom, l&apos;adresse et les coordonnées de l&apos;hébergeur effectivement utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Propriété intellectuelle</h2>
            <p className="mt-2">
              Les contenus présents sur ce site sont protégés par les règles applicables à la propriété intellectuelle. Toute reproduction non autorisée est interdite.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}