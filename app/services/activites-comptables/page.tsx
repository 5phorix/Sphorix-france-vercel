import type { Metadata } from "next";
import ServiceDetailPage from "@/components/services/ServiceDetailPage";

export const metadata: Metadata = {
  title: "Activités comptables | Accompagnement administratif comptable fiable",
  description:
    "Accompagnement administratif comptable pour structurer le suivi quotidien, faciliter les échanges avec votre expert-comptable et mieux maîtriser vos opérations.",
  alternates: {
    canonical: "/services/activites-comptables",
  },
  openGraph: {
    title: "Activités comptables | Sphorix France",
    description:
      "Un appui sur les activités comptables administratives, sans mission d'expertise comptable.",
    url: "/services/activites-comptables",
    type: "article",
  },
};

export default function ActivitesComptablesPage() {
  return (
    <ServiceDetailPage
      eyebrow="Activités comptables"
      title="Un accompagnement administratif comptable fiable pour mieux suivre votre activité"
      description="La gestion quotidienne des documents comptables demande du temps, de la rigueur et une organisation efficace. Sphorix France vous accompagne dans vos tâches administratives comptables afin de structurer votre suivi, faciliter vos échanges avec votre expert-comptable et vous permettre de garder une meilleure maîtrise de vos opérations courantes."
      highlightsTitle="Un soutien adapté à vos besoins administratifs"
      highlights={[
        {
          title: "Organisation des pièces et justificatifs",
          description:
            "Classez et structurez vos documents pour simplifier leur consultation et leur transmission.",
        },
        {
          title: "Préparation des éléments comptables",
          description:
            "Rassemblez les informations nécessaires afin de faciliter le travail de votre expert-comptable.",
        },
        {
          title: "Suivi des factures et des règlements",
          description:
            "Gardez une meilleure visibilité sur vos échéances, vos paiements et vos relances administratives.",
        },
        {
          title: "Contrôles et rapprochements administratifs courants",
          description:
            "Vérifiez la cohérence de vos informations et identifiez plus facilement les éventuels écarts.",
        },
      ]}
      extraSections={[
        {
          title: "Les bénéfices pour votre entreprise",
          paragraphs: [
            "Une gestion administrative plus organisée et plus sereine.",
            "Un suivi comptable administratif bien structuré vous permet de gagner du temps, de limiter les oublis et de disposer d'informations plus fiables pour piloter votre activité.",
            "Vous restez concentré sur votre métier tout en conservant une meilleure visibilité sur vos opérations quotidiennes.",
          ],
        },
        {
          title: "Un accompagnement complémentaire à votre expert-comptable",
          paragraphs: [
            "Notre intervention concerne uniquement les tâches administratives et organisationnelles liées au suivi comptable.",
            "Elle ne constitue pas une mission d'expertise comptable, d'attestation, de certification ou toute autre prestation relevant du périmètre réglementé de l'expertise comptable.",
          ],
        },
      ]}
      primaryCtaLabel="Demander un échange"
      primaryHref="/demande-devis"
      secondaryCtaLabel="Voir tous les services"
      secondaryHref="/services"
      resultEyebrow="Résultat attendu"
      resultTitle="Une gestion administrative plus claire et mieux sécurisée"
      resultDescription="Des tâches comptables administratives mieux organisées, un suivi plus fiable et des échanges facilités avec votre expert-comptable."
      resultPoints={[
        {
          label: "Organisation",
          text: "Documents et informations plus faciles à retrouver et à transmettre.",
        },
        {
          label: "Fiabilité",
          text: "Moins d'oublis et plus de cohérence dans le suivi courant.",
        },
        {
          label: "Sérénité",
          text: "Meilleure visibilité sur vos opérations pour vous concentrer sur votre métier.",
        },
      ]}
      ctaLead="Vous souhaitez mieux organiser vos tâches administratives comptables et gagner en efficacité ?"
      ctaEmphasis="Échangeons sur vos besoins d'accompagnement."
      note="Cette intervention reste strictement administrative et ne remplace pas une mission réglementée d'expertise comptable."
      theme={{
        pageAccent: "from-rose-500/15 via-pink-500/8",
        orbLeft: "bg-rose-500/15",
        orbRight: "bg-pink-400/15",
        heroGradient: "from-slate-950 via-rose-950 to-pink-950",
        eyebrowClassName: "text-rose-200",
        highlightDot: "bg-rose-500",
        asideGradient: "from-rose-950 to-pink-950",
        asideBorder: "border-rose-100/20",
        noteClassName: "border border-rose-200 bg-rose-50 text-rose-950",
      }}
    />
  );
}