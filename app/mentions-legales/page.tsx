import Image from "next/image";

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-14 text-slate-900 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Mentions légales</h1>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-600 sm:text-base">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Éditeur du site</h2>
            <div className="mt-4 flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2">
                <Image
                  src="/logo/logo.png"
                  alt="Logo de Sphorix France"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <p className="text-xl font-bold tracking-tight text-[#172b27]">Sphorix <span className="text-[#df6a43]">France</span></p>
              </div>
            </div>
            <dl className="mt-4 grid gap-2 sm:grid-cols-[auto_1fr] sm:gap-x-4">
              <dt className="font-semibold text-slate-900">SIREN</dt>
              <dd>939 223 335</dd>
              <dt className="font-semibold text-slate-900">SIRET</dt>
              <dd>939 223 335 00026</dd>
              <dt className="font-semibold text-slate-900">TVA intracommunautaire</dt>
              <dd>FR49939223335</dd>
              <dt className="font-semibold text-slate-900">Téléphone</dt>
              <dd><a className="font-semibold text-blue-700 underline" href="tel:+33781525393">+33 7 81 52 53 93</a></dd>
              <dt className="font-semibold text-slate-900">Email</dt>
              <dd><a className="font-semibold text-blue-700 underline" href="mailto:contact@sphorix.fr">contact@sphorix.fr</a></dd>
            </dl>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Hébergement</h2>
            <p className="mt-2">
              Le site est hébergé par Vercel Inc.<br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
              <a className="font-semibold text-blue-700 underline" href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
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