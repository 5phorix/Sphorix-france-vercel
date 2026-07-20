import type { Metadata } from "next";
import ServiceDetailPage from "@/components/services/ServiceDetailPage";

export const metadata: Metadata = {
  title: "Automatisation des tâches métier | Applications web sur mesure",
  description:
    "Automatisation des tâches métier avec des applications web sur mesure: workflows, validation, relances, tableaux de bord et connexions entre outils.",
  alternates: {
    canonical: "/services/applications-web-sur-mesure",
  },
  openGraph: {
    title: "Automatisation des tâches métier | Sphorix France",
    description:
      "Réduisez les tâches manuelles et fluidifiez vos opérations avec des outils web sur mesure adaptés à votre organisation.",
    url: "/services/applications-web-sur-mesure",
    type: "article",
  },
};

export default function ApplicationsWebSurMesurePage() {
  return (
    <ServiceDetailPage
      eyebrow="Automatisation métier"
      title="Transformez vos processus internes avec des solutions d'automatisation sur mesure"
      description="Les tâches répétitives ralentissent vos équipes et limitent votre capacité à vous concentrer sur les activités à forte valeur ajoutée. Nous concevons des applications web et des automatisations métier adaptées à votre organisation pour simplifier vos opérations, fiabiliser vos processus et améliorer votre efficacité au quotidien."
      highlightsTitle="Des solutions adaptées à vos besoins opérationnels"
      highlights={[
        {
          title: "Automatisation des validations, relances et suivis administratifs",
          description:
            "Réduisez les actions manuelles et assurez un meilleur suivi de vos demandes, dossiers et échéances.",
        },
        {
          title: "Workflows métier personnalisés",
          description:
            "Créez des circuits de traitement adaptés à vos règles internes, avec des actions automatiques à chaque étape.",
        },
        {
          title: "Tableaux de bord de pilotage en temps réel",
          description:
            "Centralisez vos informations clés pour suivre votre activité et prendre des décisions plus rapidement.",
        },
        {
          title: "Connexion de vos outils existants",
          description:
            "Faites communiquer vos CRM, logiciels de facturation, bases de données et fichiers internes pour éviter les ressaisies et fluidifier vos échanges.",
        },
      ]}
      extraSections={[
        {
          title: "Les bénéfices pour votre organisation",
          paragraphs: [
            "Gagnez du temps et améliorez votre efficacité.",
            "En automatisant les tâches chronophages, vos équipes peuvent se concentrer sur des missions à plus forte valeur.",
            "Vous bénéficiez de processus plus fiables, d'une meilleure visibilité sur vos opérations et d'un fonctionnement quotidien plus fluide.",
          ],
        },
        {
          title: "Une approche orientée métier",
          paragraphs: [
            "Chaque organisation possède ses propres méthodes de travail.",
            "Nous analysons vos processus, identifions les opportunités d'automatisation et construisons des solutions adaptées à vos contraintes et à vos objectifs.",
          ],
        },
      ]}
      primaryCtaLabel="Automatiser mes tâches métier"
      primaryHref="/demande-devis"
      secondaryCtaLabel="Retour aux services"
      secondaryHref="/services"
      resultEyebrow="Résultat attendu"
      resultTitle="Un fonctionnement plus fluide et mieux piloté"
      resultDescription="Des automatisations utiles, des processus fiables et une meilleure réactivité opérationnelle au quotidien."
      resultPoints={[
        {
          label: "Efficacité",
          text: "Réduction des tâches manuelles et des ressaisies.",
        },
        {
          label: "Fiabilité",
          text: "Moins d'erreurs dans le traitement et le suivi des opérations.",
        },
        {
          label: "Visibilité",
          text: "Pilotage en temps réel pour décider plus vite.",
        },
      ]}
      ctaLead="Vous avez identifié des tâches répétitives ou des processus qui pourraient être simplifiés ?"
      ctaEmphasis="Automatisons ensemble vos opérations métier."
      theme={{
        pageAccent: "from-indigo-500/15 via-slate-500/8",
        orbLeft: "bg-indigo-500/15",
        orbRight: "bg-slate-400/15",
        heroGradient: "from-slate-950 via-indigo-950 to-slate-900",
        eyebrowClassName: "text-indigo-200",
        highlightDot: "bg-indigo-500",
        asideGradient: "from-indigo-950 to-slate-900",
        asideBorder: "border-indigo-100/20",
      }}
    />
  );
}
