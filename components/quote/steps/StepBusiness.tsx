"use client";

interface StepBusinessProps {
  value: string;
  customValue: string;
  onChange: (value: string) => void;
  onCustomChange: (value: string) => void;
}

const profiles = [
  {
    id: "tpe-pme",
    title: "Entreprise",
    description: "Structure souhaitant mieux organiser son activité.",
  },
  {
    id: "independant",
    title: "Professionnel",
    description: "Activité souhaitant clarifier ses méthodes de travail.",
  },
  {
    id: "commerce",
    title: "Commerce",
    description: "Point de vente, réseau ou activité commerciale.",
  },
  {
    id: "association",
    title: "Association",
    description: "Structure ayant besoin d'un meilleur suivi.",
  },
  {
    id: "autre",
    title: "Autre",
    description: "Votre activité n'est pas dans cette liste.",
  },
];

export default function StepBusiness({
  value,
  customValue,
  onChange,
  onCustomChange,
}: StepBusinessProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
        Quel est votre profil ?
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Choisissez la situation qui correspond le mieux à votre besoin.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            onClick={() => onChange(profile.id)}
            className={`
              rounded-2xl border p-5 text-left transition-all duration-300
              ${
                value === profile.id
                  ? "border-orange-500 bg-orange-50/70 shadow-sm"
                  : "border-slate-200 bg-slate-50/50 hover:border-orange-300 hover:bg-orange-50/30"
              }
            `}
          >
            <h3 className={`font-bold ${value === profile.id ? "text-slate-950" : "text-slate-900"}`}>
              {profile.title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {profile.description}
            </p>
          </button>
        ))}
      </div>

      {value === "autre" && (
        <div className="mt-6">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Précisez votre activité
          </label>

          <input
            type="text"
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="Exemple : cabinet médical, artisan, organisme de formation..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white"
          />
        </div>
      )}
    </div>
  );
}