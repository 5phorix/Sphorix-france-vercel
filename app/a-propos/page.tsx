import type { Metadata } from "next";

import About from "@/sections/About";
import Contact from "@/sections/Contact";

export const metadata: Metadata = {
  title: "À propos | Expertise en gestion et outils sur mesure | Sphorix France",
  description:
    "Découvrez la démarche de Sphorix France : accompagnement des artisans et PME avec des outils numériques et de gestion sur mesure.",
  alternates: {
    canonical: "/a-propos",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-100 pt-20">
      <About />
      <Contact />
    </main>
  );
}
