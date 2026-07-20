import type { Metadata } from "next";
import ServiceDetailPage from "@/components/services/ServiceDetailPage";

export const metadata: Metadata = {
  title: "Design web & UI/UX | Inspirer confiance et guider vos utilisateurs",
  description:
    "Design web et UI/UX pour rendre votre offre plus claire, renforcer votre crédibilité et améliorer l'expérience utilisateur sur mobile et desktop.",
  alternates: {
    canonical: "/services/design-web-ui-ux",
  },
  openGraph: {
    title: "Design web & UI/UX | Sphorix France",
    description:
      "Des interfaces claires et orientées conversion pour vos visiteurs et clients.",
    url: "/services/design-web-ui-ux",
    type: "article",
  },
};

export default function DesignWebPage() {
  return (
    <ServiceDetailPage
      eyebrow="Design web & UI/UX"
      title="Un design pensé pour inspirer confiance et guider vos utilisateurs"
      description="Un bon design ne se limite pas à l'esthétique : il doit rendre votre offre plus claire, renforcer votre crédibilité et faciliter chaque interaction avec vos visiteurs. Nous concevons des interfaces web cohérentes, intuitives et performantes, en alignant l'expérience utilisateur avec vos objectifs commerciaux."
      highlightsTitle="Des interfaces conçues autour de vos enjeux"
      highlights={[
        {
          title: "Refonte UI/UX de sites existants",
          description:
            "Modernisez votre interface, améliorez l'expérience utilisateur et donnez une nouvelle cohérence à votre image en ligne.",
        },
        {
          title: "Création de systèmes visuels cohérents",
          description:
            "Définissez une identité digitale structurée avec des composants réutilisables, des règles graphiques claires et une meilleure cohérence entre vos pages.",
        },
        {
          title: "Optimisation des parcours utilisateurs",
          description:
            "Simplifiez la navigation, améliorez vos formulaires et facilitez les actions importantes comme la prise de contact ou la demande de devis.",
        },
        {
          title: "Adaptation mobile et desktop",
          description:
            "Garantissez une expérience fluide sur tous les écrans avec une hiérarchie visuelle adaptée aux usages actuels.",
        },
      ]}
      extraSections={[
        {
          title: "Les bénéfices pour votre activité",
          paragraphs: [
            "Un design qui améliore la compréhension et la conversion.",
            "Une interface bien pensée permet à vos visiteurs de trouver rapidement l'information recherchée, de mieux comprendre votre valeur et de passer plus facilement à l'action.",
            "Vous obtenez une expérience digitale plus professionnelle, plus intuitive et mieux alignée avec vos objectifs.",
          ],
        },
        {
          title: "Une approche centrée sur l'utilisateur",
          paragraphs: [
            "Nous analysons vos utilisateurs, vos objectifs et vos contraintes pour construire des interfaces qui combinent esthétique, efficacité et simplicité d'utilisation.",
            "Chaque choix de design répond à un objectif : mieux présenter votre offre, faciliter les interactions et créer une expérience mémorable.",
          ],
        },
      ]}
      primaryCtaLabel="Parler de votre design"
      primaryHref="/demande-devis"
      secondaryCtaLabel="Retour aux services"
      secondaryHref="/services"
      resultEyebrow="Résultat attendu"
      resultTitle="Une interface plus claire, plus crédible et plus engageante"
      resultDescription="Un design utile qui guide vos utilisateurs, améliore la compréhension de votre offre et soutient vos objectifs de conversion."
      resultPoints={[
        {
          label: "Clarté",
          text: "Hiérarchie visuelle et navigation plus faciles à comprendre.",
        },
        {
          label: "Confiance",
          text: "Image plus professionnelle et cohérente sur l'ensemble des pages.",
        },
        {
          label: "Résultats",
          text: "Parcours optimisés pour faciliter la prise de contact et l'action.",
        },
      ]}
      ctaLead="Vous souhaitez améliorer votre interface ou repenser complètement votre expérience utilisateur ?"
      ctaEmphasis="Construisons un design web clair, cohérent et orienté résultats."
      theme={{
        pageAccent: "from-fuchsia-500/15 via-violet-500/8",
        orbLeft: "bg-fuchsia-500/15",
        orbRight: "bg-violet-500/15",
        heroGradient: "from-slate-950 via-fuchsia-950 to-violet-950",
        eyebrowClassName: "text-fuchsia-200",
        highlightDot: "bg-fuchsia-500",
        asideGradient: "from-fuchsia-950 to-violet-950",
        asideBorder: "border-fuchsia-100/20",
      }}
    />
  );
}
