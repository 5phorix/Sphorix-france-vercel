import type { Metadata } from "next";
import Script from "next/script";

import Navbar from "@/sections/Navbar";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Services from "@/sections/Services";
import Projects from "@/sections/Approche";
import Contact from "@/sections/Contact";
import Footer from "@/sections/Footer";

export const metadata: Metadata = {
  title: "Applications sur mesure pour PME | Sphorix France",
  description:
    "Nous concevons des applications qui connectent vos outils, automatisent vos processus et transforment vos données en informations utiles pour piloter votre activité et prendre de meilleures décisions.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Quels outils Sphorix peut-il connecter ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sphorix connecte les plateformes, logiciels comptables et banques via API, webhooks ou imports de fichiers, et automatise les échanges et processus adaptés à vos besoins.",
        },
      },
      {
        "@type": "Question",
        name: "Comment les données sont-elles fiabilisées ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Le moteur commun normalise les données, détecte les doublons, applique des contrôles et conserve la traçabilité des échanges.",
        },
      },
      {
        "@type": "Question",
        name: "Que retrouve-t-on dans l’application Sphorix ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "L’application rassemble dépenses, factures, échéances, alertes et indicateurs pour transformer les données en informations utiles et prendre de meilleures décisions.",
        },
      },
    ],
  };

  return (
    <main>
      <Script
        id="schema-org-faq"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <Hero />
      <Services summary />
      <About summary />
      <Projects summary />
      <Contact />
      <Footer />
    </main>
  );
}