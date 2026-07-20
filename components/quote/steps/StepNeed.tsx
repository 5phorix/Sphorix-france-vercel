"use client";

interface StepNeedProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const needs = [
  {
    id: "organisation",
    title: "Organisation & méthode",
    description:
      "Structurer les activités, améliorer les méthodes de travail et gagner en efficacité.",
    icon: "⚙️",
  },
  {
    id: "kpi",
    title: "Indicateurs & KPI",
    description:
      "Mettre en place des tableaux de bord et des indicateurs pour mieux décider.",
    icon: "📊",
  },
  {
    id: "couts",
    title: "Analyse des coûts",
    description:
      "Identifier les leviers d'amélioration et optimiser la rentabilité.",
    icon: "💰",
  },
  {
    id: "digital",
    title: "Outils numériques",
    description:
      "Choisir et intégrer des outils numériques adaptés à votre activité.",
    icon: "💻",
  },
  {
    id: "gestion",
    title: "Gestion administrative",
    description:
      "Améliorer le suivi administratif, financier et opérationnel.",
    icon: "📁",
  },
];

export default function StepNeed({
  value,
  onChange,
}: StepNeedProps) {

  const toggleNeed = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id));
    } else {
      onChange([...value, id]);
    }
  };


  return (
    <div>

      <h2 className="text-2xl font-semibold text-white">
        Quels sont vos besoins principaux ?
      </h2>

      <p className="mt-3 text-slate-300">
        Sélectionnez une ou plusieurs réponses afin de mieux comprendre votre projet.
      </p>


      <div className="mt-8 grid gap-4 sm:grid-cols-2">

        {needs.map((need) => {

          const selected = value.includes(need.id);

          return (
            <button
              key={need.id}
              type="button"
              onClick={() => toggleNeed(need.id)}
              className={`
                rounded-2xl border p-5 text-left transition-all duration-300
                ${
                  selected
                    ? "border-orange-400 bg-blue-800"
                    : "border-blue-800 bg-blue-950/50 hover:border-blue-500"
                }
              `}
            >

              <div className="flex items-start gap-3">

                <span className="text-2xl">
                  {need.icon}
                </span>


                <div>

                  <h3 className="font-semibold text-white">
                    {need.title}
                  </h3>


                  <p className="mt-2 text-sm text-slate-300">
                    {need.description}
                  </p>

                </div>

              </div>

            </button>
          );

        })}

      </div>

    </div>
  );
}