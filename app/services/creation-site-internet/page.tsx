import type { Metadata } from "next";
import ServiceDetailPage from "@/components/services/ServiceDetailPage";

export const metadata: Metadata = {
  title: "Création de site internet | Attirer des prospects et développer votre activité",
  description:
    "Création de site internet moderne, rapide et optimisé SEO pour présenter votre offre, renforcer votre crédibilité et générer des contacts qualifiés.",
  alternates: {
    canonical: "/services/creation-site-internet",
  },
  openGraph: {
    title: "Création de site internet | Sphorix France",
    description:
      "Un site internet conçu pour être trouvé sur Google et transformer vos visiteurs en prospects.",
    url: "/services/creation-site-internet",
    type: "article",
  },
};

export default function CreationSiteInternetPage() {
  return (
    <ServiceDetailPage
      eyebrow="Création de site internet"
      title="Un site web conçu pour attirer vos prospects et développer votre activité"
      description="Votre site internet est souvent le premier point de contact avec vos clients. Nous concevons des sites modernes, rapides et optimisés pour présenter clairement votre offre, renforcer votre crédibilité et transformer vos visiteurs en opportunités commerciales. Chaque site est pensé autour de vos objectifs : visibilité sur les moteurs de recherche, expérience utilisateur fluide et génération de contacts qualifiés."
      highlightsTitle="Une création web pensée pour la performance"
      highlights={[
        {
          title: "Architecture SEO et structure des contenus",
          description:
            "Organisation des pages selon les recherches de vos clients pour améliorer votre visibilité et faciliter la compréhension de votre offre.",
        },
        {
          title: "Design responsive sur tous les supports",
          description:
            "Une expérience cohérente et professionnelle sur ordinateur, tablette et mobile.",
        },
        {
          title: "Contenus orientés conversion",
          description:
            "Des textes clairs, des messages impactants et des appels à l'action conçus pour guider vos visiteurs.",
        },
        {
          title: "Optimisation technique et performance",
          description:
            "Un site rapide, proprement structuré et préparé pour une bonne indexation par les moteurs de recherche.",
        },
      ]}
      extraSections={[
        {
          title: "Les bénéfices pour votre entreprise",
          paragraphs: [
            "Un site qui travaille pour votre développement.",
            "Nous créons des sites qui ne se limitent pas à présenter votre activité : ils valorisent votre expertise, facilitent la prise de contact et accompagnent vos prospects dans leur décision.",
            "Vous obtenez une présence en ligne plus professionnelle, un message plus clair et une meilleure capacité à générer de nouvelles opportunités.",
          ],
        },
        {
          title: "Une approche centrée sur vos objectifs",
          paragraphs: [
            "Avant de concevoir votre site, nous définissons ensemble votre positionnement, vos audiences prioritaires et les actions que vous souhaitez déclencher.",
            "Chaque élément est pensé pour servir votre stratégie : structure, design, contenu et parcours utilisateur.",
          ],
        },
      ]}
      primaryCtaLabel="Demander un site internet"
      primaryHref="/demande-devis"
      secondaryCtaLabel="Voir toutes les offres"
      secondaryHref="/services"
      resultEyebrow="Résultat attendu"
      resultTitle="Un site plus lisible, plus crédible et plus efficace"
      resultDescription="Une présence en ligne professionnelle qui valorise votre offre et facilite la génération de contacts qualifiés."
      resultPoints={[
        {
          label: "Visibilité",
          text: "Meilleure compréhension par les moteurs de recherche et vos visiteurs.",
        },
        {
          label: "Conversion",
          text: "Parcours plus clair et appels à l'action orientés prise de contact.",
        },
        {
          label: "Image",
          text: "Site moderne et cohérent avec votre positionnement professionnel.",
        },
      ]}
      ctaLead="Vous souhaitez créer un site internet professionnel adapté à vos enjeux ?"
      ctaEmphasis="Construisons un site pensé pour votre croissance."
      theme={{
        pageAccent: "from-sky-500/15 via-cyan-500/8",
        orbLeft: "bg-sky-500/15",
        orbRight: "bg-cyan-400/15",
        heroGradient: "from-slate-950 via-sky-950 to-cyan-950",
        eyebrowClassName: "text-cyan-200",
        highlightDot: "bg-sky-500",
        asideGradient: "from-sky-950 to-cyan-950",
        asideBorder: "border-sky-100/20",
        noteClassName: "border border-sky-200 bg-sky-50 text-sky-950",
      }}
    />
  );
}
