"use client";

interface StepProjectProps {
  companySize: string;
  urgency: string;
  objective: string;
  details: string;

  onCompanySizeChange: (value: string) => void;
  onUrgencyChange: (value: string) => void;
  onObjectiveChange: (value: string) => void;
  onDetailsChange: (value: string) => void;
}


const companySizes = [
  "Seul / indépendant",
  "1 à 10 salariés",
  "11 à 50 salariés",
  "Plus de 50 salariés",
];


const urgencies = [
  "Projet à préparer",
  "Dans les 3 prochains mois",
  "Besoin rapide",
];


const objectives = [
  "Améliorer l'organisation",
  "Réduire les coûts",
  "Mieux piloter l'activité",
  "Digitaliser les outils",
];


export default function StepProject({
  companySize,
  urgency,
  objective,
  details,
  onCompanySizeChange,
  onUrgencyChange,
  onObjectiveChange,
  onDetailsChange,
}: StepProjectProps) {


  return (
    <div>

      <h2 className="text-2xl font-semibold text-white">
        Décrivez votre projet
      </h2>


      <p className="mt-3 text-slate-300">
        Ces informations nous permettent d'adapter notre estimation.
      </p>


      <div className="mt-8 space-y-6">


        <div>
          <label className="mb-3 block text-sm text-slate-300">
            Taille de votre structure
          </label>

          <div className="grid gap-3 sm:grid-cols-2">

            {companySizes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onCompanySizeChange(item)}
                className={`
                  rounded-xl border p-3 text-left text-sm transition
                  ${
                    companySize === item
                    ? "border-orange-400 bg-blue-800 text-white"
                    : "border-blue-800 bg-blue-950/50 text-slate-300"
                  }
                `}
              >
                {item}
              </button>
            ))}

          </div>
        </div>



        <div>
          <label className="mb-3 block text-sm text-slate-300">
            Quand souhaitez-vous avancer ?
          </label>


          <div className="grid gap-3 sm:grid-cols-3">

            {urgencies.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onUrgencyChange(item)}
                className={`
                  rounded-xl border p-3 text-sm transition
                  ${
                    urgency === item
                    ? "border-orange-400 bg-blue-800 text-white"
                    : "border-blue-800 bg-blue-950/50 text-slate-300"
                  }
                `}
              >
                {item}
              </button>
            ))}

          </div>
        </div>



        <div>
          <label className="mb-3 block text-sm text-slate-300">
            Votre objectif principal
          </label>


          <div className="grid gap-3 sm:grid-cols-2">

            {objectives.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onObjectiveChange(item)}
                className={`
                  rounded-xl border p-3 text-left text-sm transition
                  ${
                    objective === item
                    ? "border-orange-400 bg-blue-800 text-white"
                    : "border-blue-800 bg-blue-950/50 text-slate-300"
                  }
                `}
              >
                {item}
              </button>
            ))}

          </div>
        </div>



        <div>
          <label className="mb-3 block text-sm text-slate-300">
            Quelques précisions sur votre projet
          </label>

          <textarea
            rows={5}
            value={details}
            onChange={(e) => onDetailsChange(e.target.value)}
            placeholder="Décrivez votre situation actuelle, vos difficultés ou vos attentes..."
            className="w-full rounded-xl border border-blue-800 bg-blue-950/70 px-4 py-3 text-sm text-white outline-none focus:border-orange-400"
          />

        </div>


      </div>

    </div>
  );
}