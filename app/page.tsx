import type { Metadata } from "next";
import Script from "next/script";

import Navbar from "@/sections/Navbar";
import Hero from "@/sections/Hero";
import Pillars from "@/sections/Pillars";
import HomeShowcase from "@/sections/HomeShowcase";
import Footer from "@/sections/Footer";

export const metadata: Metadata = {
  title: "Inventaire et suivi de stock pour commerces | Sphorix France",
  description:
    "Comptage physique, référencement des produits, fichier de stock sur mesure et suivi simple pour artisans et petits commerces.",
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
        name: "À qui s'adresse Sphorix ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Aux artisans, petites boutiques et commerces indépendants qui veulent connaître précisément leur stock.",
        },
      },
      {
        "@type": "Question",
        name: "Comment se déroule l'accompagnement ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Un comptage physique, le référencement de vos produits, un fichier de stock adapté, puis un outil de suivi simple.",
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
      <Pillars />
      <HomeShowcase />
      <Footer />
    </main>
  );
}