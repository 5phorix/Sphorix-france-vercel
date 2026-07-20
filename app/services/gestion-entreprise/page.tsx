import type { Metadata } from "next";
import ServiceDetailPage from "@/components/services/ServiceDetailPage";

export const metadata: Metadata = {
  title: "Organisation d'entreprise | Clarté, efficacité et structuration",
  description:
    "Structuration de l'organisation d'entreprise: processus clairs, priorités définies et suivi opérationnel fiable pour gagner en efficacité.",
  alternates: {
    canonical: "/services/gestion-entreprise",
  },
  openGraph: {
    title: "Organisation d'entreprise | Sphorix France",
    description:
      "Des repères simples pour structurer l'organisation et gagner en lisibilité.",
    url: "/services/gestion-entreprise",
    type: "article",
  },
};

export default function GestionEntreprisePage() {
  return (
    <ServiceDetailPage
      eyebrow="Organisation d'entreprise"
      title="Structurez votre activité pour gagner en clarté et en efficacité"
      description="Une organisation efficace repose sur des processus clairs, des priorités bien définies et une vision fiable de votre activité. Sphorix France accompagne les entreprises dans la structuration de leur fonctionnement interne afin de simplifier la gestion quotidienne, améliorer le suivi des opérations et créer un cadre de travail plus fluide."
      highlightsTitle="Des solutions adaptées à votre fonctionnement"
      highlights={[
        {
          title: "Organisation administrative et gestion des tâches clés",
          description:
            "Clarifiez les responsabilités, centralisez les informations importantes et facilitez le suivi des actions quotidiennes.",
        },
        {
          title: "Structuration des processus internes",
          description:
            "Formalisez vos méthodes de travail pour gagner en efficacité et assurer une meilleure continuité dans vos opérations.",
        },
        {
          title: "Suivi des échéances, documents et flux de travail",
          description:
            "Mettez en place des outils et des méthodes pour mieux maîtriser vos délais, vos ressources et vos informations essentielles.",
        },
        {
          title: "Pilotage des priorités de gestion",
          description:
            "Disposez d'une vision plus claire de vos objectifs, de vos actions en cours et des points nécessitant votre attention.",
        },
      ]}
      extraSections={[
        {
          title: "Les bénéfices pour votre entreprise",
          paragraphs: [
            "Une organisation plus simple, plus maîtrisée et plus évolutive.",
            "Une structure claire permet à vos équipes de travailler plus efficacement, de réduire les pertes de temps et de prendre de meilleures décisions au quotidien.",
            "Vous bénéficiez d'un fonctionnement plus lisible, de processus mieux maîtrisés et d'une meilleure capacité à accompagner le développement de votre activité.",
          ],
        },
        {
          title: "Une approche pragmatique et adaptée à votre réalité",
          paragraphs: [
            "Chaque entreprise possède ses propres contraintes et méthodes de travail. Nous analysons votre fonctionnement actuel pour identifier les points d'amélioration et construire une organisation adaptée à vos besoins.",
            "Notre objectif : créer un cadre simple, durable et réellement utilisé par vos équipes.",
          ],
        },
      ]}
      primaryCtaLabel="Demander un échange"
      primaryHref="/demande-devis"
      secondaryCtaLabel="Voir tous les services"
      secondaryHref="/services"
      resultEyebrow="Résultat attendu"
      resultTitle="Une organisation plus lisible et mieux pilotée"
      resultDescription="Des processus clarifiés et une meilleure coordination pour faire avancer l'activité avec plus de sérénité."
      resultPoints={[
        {
          label: "Clarté",
          text: "Responsabilités et actions mieux définies pour les équipes.",
        },
        {
          label: "Efficacité",
          text: "Moins de friction dans les processus et le suivi opérationnel.",
        },
        {
          label: "Évolution",
          text: "Un cadre structuré capable d'accompagner votre croissance.",
        },
      ]}
      ctaLead="Vous souhaitez mieux structurer votre activité et gagner en efficacité ?"
      ctaEmphasis="Échangeons sur vos enjeux d'organisation."
      theme={{
        pageAccent: "from-emerald-500/15 via-teal-500/8",
        orbLeft: "bg-emerald-500/15",
        orbRight: "bg-teal-400/15",
        heroGradient: "from-slate-950 via-emerald-950 to-teal-950",
        eyebrowClassName: "text-emerald-200",
        highlightDot: "bg-emerald-500",
        asideGradient: "from-emerald-950 to-teal-950",
        asideBorder: "border-emerald-100/20",
      }}
    />
  );
}