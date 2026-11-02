import type { ReactNode, SVGProps } from "react";

import type { ModuleId } from "@/lib/suite/modules";

export type IconId = ModuleId | "finance" | "tresorerie" | "fiscalite" | "parametrage";

/**
 * Pictogrammes Sadesk : tuile arrondie colorée (une teinte par domaine)
 * portant un glyphe blanc en trait uniforme. Style volontairement sobre et propre à la suite.
 */
const TILE: Record<IconId, [string, string]> = {
  compta: ["#40516d", "#2b3950"],
  finance: ["#14213d", "#263b68"],
  tresorerie: ["#397563", "#285a4b"],
  depenses: ["#697586", "#4b5565"],
  fiscalite: ["#b65322", "#8f3d18"],
  gestion: ["#556578", "#3d4c60"],
  ventes: ["#b65322", "#8f3d18"],
  clients: ["#51657f", "#394d66"],
  achats: ["#8b6b45", "#6b5135"],
  production: ["#64748b", "#475569"],
  logistique: ["#496d78", "#35535d"],
  qualite: ["#348568", "#25664e"],
  maintenance: ["#a2762d", "#79561e"],
  rh: ["#6b617d", "#50475f"],
  parametrage: ["#667085", "#475467"],
};

const g = { fill: "none", stroke: "#fff", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const solid = { fill: "#fff", stroke: "none" } as const;

const glyphs: Record<IconId, ReactNode> = {
  compta: (
    <>
      <rect x="19" y="15" width="26" height="34" rx="4" {...g} />
      <path d="M25 24h14M25 32h14M25 40h8" {...g} />
    </>
  ),
  finance: (
    <>
      <path d="M17 47V17M17 47h31" {...g} />
      <path d="M24 38l8-9 6 5 10-13" {...g} />
      <circle cx="48" cy="21" r="2.6" {...solid} />
    </>
  ),
  tresorerie: (
    <>
      <ellipse cx="32" cy="22" rx="14" ry="6" {...g} />
      <path d="M18 22v10c0 3.3 6.3 6 14 6s14-2.7 14-6V22M18 32v10c0 3.3 6.3 6 14 6s14-2.7 14-6V32" {...g} />
    </>
  ),
  depenses: (
    <>
      <path d="M19 18h26v31H19z" {...g} />
      <path d="M25 26h14M25 33h14M25 40h9" {...g} />
    </>
  ),
  fiscalite: (
    <>
      <path d="M44 20L20 44" {...g} />
      <circle cx="23" cy="23" r="5" {...g} />
      <circle cx="41" cy="41" r="5" {...g} />
    </>
  ),
  gestion: (
    <>
      <circle cx="32" cy="32" r="16" {...g} />
      <circle cx="32" cy="32" r="8" {...g} />
      <circle cx="32" cy="32" r="2.4" {...solid} />
    </>
  ),
  ventes: (
    <>
      <path d="M16 19h6l5 20h20l4-14H25" {...g} />
      <circle cx="29" cy="47" r="2.8" {...solid} />
      <circle cx="44" cy="47" r="2.8" {...solid} />
    </>
  ),
  clients: (
    <>
      <circle cx="32" cy="24" r="8" {...g} />
      <path d="M17 48c1.5-8 7.5-12 15-12s13.500 4 15 12" {...g} />
    </>
  ),
  achats: (
    <>
      <path d="M32 14l15 8v18l-15 9-15-9V22z" {...g} />
      <path d="M17 22l15 8 15-8M32 30v19" {...g} />
    </>
  ),
  production: (
    <>
      <path d="M15 48V30l11 6v-6l11 6v-6l12 6v12z" {...g} />
      <path d="M41 30V16h6v18" {...g} />
    </>
  ),
  logistique: (
    <>
      <path d="M14 20h22v22H14zM36 28h9l5 6v8H36" {...g} />
      <circle cx="23" cy="45" r="3" fill="#fff" stroke="none" />
      <circle cx="43" cy="45" r="3" fill="#fff" stroke="none" />
    </>
  ),
  qualite: (
    <>
      <path d="M32 14l15 5v12c0 9-6 15-15 19-9-4-15-10-15-19V19z" {...g} />
      <path d="M25 31l5 5 9-10" {...g} />
    </>
  ),
  maintenance: (
    <>
      <path d="M43 17a9 9 0 0 0-11 11L17 43a4 4 0 0 0 6 6l15-15a9 9 0 0 0 11-11l-6 6-5-1-1-5z" {...g} />
    </>
  ),
  rh: (
    <>
      <circle cx="25" cy="25" r="6" {...g} />
      <circle cx="42" cy="27" r="5" {...g} />
      <path d="M14 47c1-7 5-10 11-10s10 3 11 10M38 38c5 0 9 3 10 9" {...g} />
    </>
  ),
  parametrage: (
    <>
      <path d="M16 23h32M16 32h32M16 41h32" {...g} />
      <circle cx="26" cy="23" r="3.600" {...g} fill="#5b6577" />
      <circle cx="39" cy="32" r="3.600" {...g} fill="#5b6577" />
      <circle cx="28" cy="41" r="3.600" {...g} fill="#5b6577" />
    </>
  ),
};

export default function ModuleIcon({ id, size = 40, ...props }: { id: IconId; size?: number } & Omit<SVGProps<SVGSVGElement>, "id">) {
  const [from, to] = TILE[id];
  const gid = `sd-tile-${id}`;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false" {...props}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#${gid})`} />
      {glyphs[id]}
    </svg>
  );
}

export const ICON_IDS = Object.keys(glyphs) as IconId[];
