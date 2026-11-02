import type { Metadata } from "next";

import Navbar from "@/sections/Navbar";
import Projects from "@/sections/Approche";
import Footer from "@/sections/Footer";

export const metadata: Metadata = {
  title: "Méthode | Sphorix France",
  description:
    "Découvrez les étapes de l’accompagnement Sphorix : diagnostic, organisation des stocks, outils adaptés et suivi dans la durée.",
  alternates: {
    canonical: "/methode",
  },
};

export default function MethodePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <Projects />
      </main>
      <Footer />
    </>
  );
}