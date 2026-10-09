import type { Metadata } from "next";

import Navbar from "@/sections/Navbar";
import Projects from "@/sections/Approche";
import Footer from "@/sections/Footer";

export const metadata: Metadata = {
  title: "Notre méthode | Sphorix France",
  description:
    "Les étapes Sphorix pour comprendre vos outils, connecter vos sources, construire votre application et faire évoluer votre système.",
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