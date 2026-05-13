export default function About() {
  return (
    <section
      id="about"
      className="bg-white px-6 py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2">
        
        <div>
          <p className="mb-3 font-semibold text-orange-500">
            À PROPOS
          </p>

          <h2 className="mb-6 text-4xl font-bold text-slate-900">
            Sphorix France accompagne les entreprises dans leur évolution
          </h2>

          <p className="mb-6 text-lg leading-relaxed text-slate-600">
            Nous intervenons dans les domaines de la gestion, de la
            transformation digitale et de l’accompagnement administratif
            afin d’aider les entreprises à gagner en efficacité.
          </p>

          <p className="text-lg leading-relaxed text-slate-600">
            Sphorix France n’est pas un cabinet d’expertise comptable,
            mais peut mettre ses clients en relation avec des experts
            partenaires selon leurs besoins.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-100 p-10 shadow-lg">
          
          <h3 className="mb-8 text-2xl font-bold text-slate-900">
            Domaines de compétences
          </h3>

          <div className="space-y-5">
            
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="mb-2 font-semibold text-slate-900">
                Comptabilité & Organisation
              </h4>

              <p className="text-slate-600">
                Suivi administratif, organisation documentaire,
                préparation des éléments comptables.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="mb-2 font-semibold text-slate-900">
                Transformation Digitale
              </h4>

              <p className="text-slate-600">
                Mise en place d’outils digitaux,
                automatisation et optimisation des processus.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="mb-2 font-semibold text-slate-900">
                Gestion d’Entreprise
              </h4>

              <p className="text-slate-600">
                Accompagnement des entreprises dans le suivi
                et l’organisation de leurs activités.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}