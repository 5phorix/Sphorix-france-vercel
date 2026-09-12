import Link from "next/link";
import { ArrowRight, BarChart3, FileSpreadsheet, LockKeyhole, Package } from "lucide-react";

const availableProducts = [
  {
    label: "Pack Gestion essentielle",
    description: "Trésorerie, dépenses et tableau de bord réunis dans une formule complète.",
    icon: Package,
    badge: "Pack complet",
  },
  {
    label: "Suivi de trésorerie",
    description: "Entrées, sorties et solde mensuel dans une vue simple et directement exploitable.",
    icon: BarChart3,
    badge: "Disponible",
  },
  {
    label: "Suivi des dépenses",
    description: "Catégoriser les charges et garder une lecture nette de vos coûts.",
    icon: FileSpreadsheet,
    badge: "Disponible",
  },
];

export default function BoutiquePreview() {
  return (
    <section id="boutique" className="relative overflow-hidden bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="pointer-events-none absolute right-[-8rem] top-[-8rem] h-80 w-80 rounded-full border border-orange-400/20" />
      <div className="pointer-events-none absolute bottom-[-10rem] left-[-6rem] h-96 w-96 rounded-full border border-blue-400/15" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-300">La boutique Sphorix</p>
            <h2 className="mt-4 max-w-xl text-4xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">
              Des outils prêts à utiliser pour gagner en clarté.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
              Explorez nos modèles de gestion et nos tableaux de bord conçus pour les artisans, indépendants et PME. Achetez, téléchargez et commencez immédiatement.
            </p>
            <Link
              href="/boutique"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-300 hover:text-orange-200"
            >
              Explorer la boutique
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {availableProducts.map(({ label, description, icon: Icon, badge }) => (
              <article key={label} className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-400/15 text-orange-300">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      {badge}
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold">{label}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{description}</p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                  Téléchargement immédiat
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
