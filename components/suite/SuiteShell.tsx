"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, type ReactNode } from "react";

import { MODULES_SADESK, type ModuleSadesk } from "@/lib/suite/modules";

import ModuleIcon from "./ModuleIcon";

type NavItem = { mod: ModuleSadesk };

/** Regroupe les modules par famille sans masquer leurs espaces distincts. */
function buildNav() {
  const groups = new Map<string, NavItem[]>();
  for (const mod of MODULES_SADESK) {
    groups.set(mod.group, [...(groups.get(mod.group) ?? []), { mod }]);
  }
  return [...groups.entries()];
}

/** Cadre commun des modules : navigation par familles à gauche, contenu à droite. */
export default function SuiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const nav = useMemo(() => buildNav(), []);

  return (
    <div className="sd">
      <div className="mx-auto flex min-h-screen max-w-[96rem] flex-col lg:flex-row">
        <aside className="sd-noprint shrink-0 bg-[var(--sd-navy)] p-3 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:overflow-y-auto lg:p-4" aria-label="Navigation de la suite">
          <Link href="/produits/pilotage" aria-label="Accueil Sadesk" className="mb-4 flex items-center gap-3 rounded-xl px-2 py-2 text-lg font-semibold text-white lg:mb-7">
            <span className="sd-logo-mark relative grid h-10 w-10 place-items-center rounded-xl text-base font-bold">
              S
              <span aria-hidden="true" className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-[var(--sd-accent)]" />
            </span>
            <span className="leading-tight">Sadesk<span className="mt-1 block text-[.65rem] font-medium uppercase tracking-[.18em] text-white/55">Gestion d’entreprise</span></span>
          </Link>
          <nav className="flex gap-4 overflow-x-auto lg:flex-col lg:gap-5">
            {nav.map(([group, items]) => (
              <div key={group} className="min-w-max lg:min-w-0">
                <p className="px-3 pb-1 text-[.68rem] font-semibold uppercase tracking-widest text-[#7f90b3]">{group}</p>
                {items.map(({ mod }) =>
                  mod.href ? (
                    <Link key={mod.id} href={mod.href} className="sd-nav-link" aria-current={pathname === mod.href ? "page" : undefined} title={mod.description}>
                      <ModuleIcon id={mod.id} size={26} />
                      <span className="min-w-0 flex-1">{mod.name}</span>
                      {mod.status === "partial" && <span className="text-[.58rem] uppercase tracking-wide text-white/50">partiel</span>}
                    </Link>
                  ) : (
                    <div key={mod.id} className="sd-nav-soon" aria-disabled="true" title={mod.description}>
                      <span>{mod.name}</span>
                      <span className="text-[.66rem] uppercase tracking-wide">à venir</span>
                    </div>
                  ),
                )}
              </div>
            ))}
          </nav>
          <div className="mt-8 hidden rounded-xl border border-white/10 bg-white/[.05] p-3 text-xs leading-relaxed text-white/60 lg:block">
            Un espace unique pour piloter vos comptes, vos ventes et votre activité.
          </div>
        </aside>
        <div className="min-w-0 flex-1 space-y-6 px-4 py-6 md:px-8 lg:py-9">{children}</div>
      </div>
    </div>
  );
}
