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

      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
        Décrivez votre projet
      </h2>


      <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Ces informations nous permettent d&apos;adapter notre estimation.
      </p>


      <div className="mt-8 space-y-6">


        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Taille de votre structure
          </label>

          <div className="grid gap-3 sm:grid-cols-2">

            {companySizes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onCompanySizeChange(item)}
                className={`
                  rounded-xl border p-3.5 text-left text-sm font-medium transition
                  ${
                    companySize === item
                    ? "border-orange-500 bg-orange-50/70 text-slate-950 font-bold shadow-sm"
                    : "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-orange-300 hover:bg-orange-50/30"
                  }
                `}
              >
                {item}
              </button>
            ))}

          </div>
        </div>



        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Quand souhaitez-vous avancer ?
          </label>


          <div className="grid gap-3 sm:grid-cols-3">

            {urgencies.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onUrgencyChange(item)}
                className={`
                  rounded-xl border p-3.5 text-center text-sm font-medium transition
                  ${
                    urgency === item
                    ? "border-orange-500 bg-orange-50/70 text-slate-950 font-bold shadow-sm"
                    : "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-orange-300 hover:bg-orange-50/30"
                  }
                `}
              >
                {item}
              </button>
            ))}

          </div>
        </div>



        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Votre objectif principal
          </label>


          <div className="grid gap-3 sm:grid-cols-2">

            {objectives.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onObjectiveChange(item)}
                className={`
                  rounded-xl border p-3.5 text-left text-sm font-medium transition
                  ${
                    objective === item
                    ? "border-orange-500 bg-orange-50/70 text-slate-950 font-bold shadow-sm"
                    : "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-orange-300 hover:bg-orange-50/30"
                  }
                `}
              >
                {item}
              </button>
            ))}

          </div>
        </div>



        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Quelques précisions sur votre projet
          </label>

          <textarea
            rows={5}
            value={details}
            onChange={(e) => onDetailsChange(e.target.value)}
            placeholder="Décrivez votre situation actuelle, vos difficultés ou vos attentes..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white"
          />

        </div>


      </div>

    </div>
  );
}