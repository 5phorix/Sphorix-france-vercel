import type { Metadata } from "next";

import Contact from "@/sections/Contact";

export const metadata: Metadata = {
  title: "Contact & Devis | Sphorix France",
  description:
    "Prenez contact avec Sphorix France pour échanger sur vos besoins en outils numériques, tableaux de bord et gestion d'entreprise.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-20">
      <Contact />
    </main>
  );
}
