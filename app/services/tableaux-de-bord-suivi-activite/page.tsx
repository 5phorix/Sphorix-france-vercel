import type { Metadata } from "next";
import ServiceDetailPage from "@/components/services/ServiceDetailPage";

export const metadata: Metadata = {
  title: "Tableaux de bord et suivi d'activité | Indicateurs clairs pour mieux décider",
  description:
    "Création de tableaux de bord sur mesure pour centraliser vos données, suivre vos performances et piloter votre activité avec des indicateurs pertinents.",
  alternates: {
    canonical: "/services/tableaux-de-bord-suivi-activite",
  },
  openGraph: {
    title: "Tableaux de bord et suivi d'activité | Sphorix France",
    description:
      "Des indicateurs clairs et un suivi d'activité lisible pour prendre de meilleures décisions.",
    url: "/services/tableaux-de-bord-suivi-activite",
    type: "article",
  },
};

export default function TableauxDeBordSuiviActivitePage() {
  return (
    <ServiceDetailPage
      eyebrow="Tableaux de bord et suivi d'activité"
      title="Pilotez votre activité avec des indicateurs clairs et pertinents"
      description="Prendre de bonnes décisions nécessite une vision fiable de son activité. Nous concevons des tableaux de bord adaptés à votre entreprise pour centraliser vos données essentielles, suivre vos performances et vous donner une meilleure compréhension de vos résultats au quotidien."
      highlightsTitle="Des outils de pilotage adaptés à vos besoins"
      highlights={[
        {
          title: "Suivi du chiffre d'affaires, des charges et de la rentabilité",
          description:
            "Visualisez vos principaux indicateurs financiers pour mieux comprendre l'évolution de votre activité.",
        },
        {
          title: "Tableaux de bord hebdomadaires ou mensuels",
          description:
            "Centralisez vos informations importantes dans une vue simple et accessible pour un suivi régulier.",
        },
        {
          title: "Indicateurs de performance personnalisés",
          description:
            "Sélectionnez les données réellement utiles à votre métier pour suivre vos priorités opérationnelles.",
        },
        {
          title: "Analyse et interprétation des résultats",
          description:
            "Transformez vos données en informations exploitables pour identifier les tendances, anticiper les écarts et ajuster vos actions.",
        },
      ]}
      extraSections={[
        {
          title: "Les bénéfices pour votre entreprise",
          paragraphs: [
            "Une vision plus claire pour mieux décider.",
            "Un bon tableau de bord ne se contente pas d'afficher des chiffres : il vous aide à comprendre ce qui fonctionne, ce qui doit évoluer et où concentrer vos efforts.",
            "Vous gagnez en visibilité, en réactivité et en maîtrise de votre activité.",
          ],
        },
        {
          title: "Une approche basée sur vos objectifs métier",
          paragraphs: [
            "Nous définissons avec vous les indicateurs les plus pertinents selon votre secteur, votre organisation et vos enjeux.",
            "L'objectif : créer un outil simple à utiliser, compréhensible par vos équipes et réellement utile dans vos prises de décision.",
          ],
        },
      ]}
      primaryCtaLabel="Mettre en place un tableau de bord"
      primaryHref="/demande-devis"
      secondaryCtaLabel="Voir tous les services"
      secondaryHref="/services"
      resultEyebrow="Résultat attendu"
      resultTitle="Une lecture fiable de votre activité pour agir plus vite"
      resultDescription="Des indicateurs bien choisis, un suivi régulier et des décisions appuyées sur des données utiles."
      resultPoints={[
        {
          label: "Visibilité",
          text: "Compréhension rapide des performances et des écarts.",
        },
        {
          label: "Réactivité",
          text: "Détection plus précoce des tendances et des points d'alerte.",
        },
        {
          label: "Décision",
          text: "Arbitrages plus clairs grâce à des données exploitables.",
        },
      ]}
      ctaLead="Vous souhaitez mieux suivre votre activité et disposer d'une vision fiable de vos performances ?"
      ctaEmphasis="Mettons en place un tableau de bord adapté à votre entreprise."
      theme={{
        pageAccent: "from-amber-500/15 via-orange-500/8",
        orbLeft: "bg-amber-500/15",
        orbRight: "bg-orange-400/15",
        heroGradient: "from-slate-950 via-amber-950 to-orange-950",
        eyebrowClassName: "text-amber-200",
        highlightDot: "bg-amber-500",
        asideGradient: "from-amber-950 to-orange-950",
        asideBorder: "border-amber-100/20",
      }}
    />
  );
}