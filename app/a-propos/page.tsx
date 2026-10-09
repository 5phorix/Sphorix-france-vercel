import type { Metadata } from "next";

import Navbar from "@/sections/Navbar";
import About from "@/sections/About";
import Footer from "@/sections/Footer";

export const metadata: Metadata = {
  title: "Notre vision | Sphorix France",
  description:
    "Découvrez la vision Sphorix : connecter les outils existants, automatiser les processus et rendre les données utiles aux décisions des PME.",
  alternates: {
    canonical: "/a-propos",
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <About />
      </main>
      <Footer />
    </>
  );
}
