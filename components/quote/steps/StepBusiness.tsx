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
    title: "TPE / PME",
    description: "Entreprise souhaitant structurer ou améliorer sa gestion.",
  },
  {
    id: "independant",
    title: "Indépendant",
    description: "Professionnel souhaitant optimiser son organisation.",
  },
  {
    id: "commerce",
    title: "Commerce",
    description: "Point de vente, réseau ou activité commerciale.",
  },
  {
    id: "association",
    title: "Association",
    description: "Structure ayant besoin d'un meilleur pilotage.",
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
      <h2 className="text-2xl font-semibold text-white">
        Quel est votre profil ?
      </h2>

      <p className="mt-3 text-slate-300">
        Choisissez la situation qui correspond le mieux à votre activité.
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
                  ? "border-orange-400 bg-blue-800"
                  : "border-blue-800 bg-blue-950/50 hover:border-blue-500"
              }
            `}
          >
            <h3 className="font-semibold text-white">
              {profile.title}
            </h3>

            <p className="mt-2 text-sm text-slate-300">
              {profile.description}
            </p>
          </button>
        ))}
      </div>

      {value === "autre" && (
        <div className="mt-6">
          <label className="mb-2 block text-sm text-slate-300">
            Précisez votre activité
          </label>

          <input
            type="text"
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="Exemple : cabinet médical, artisan, organisme de formation..."
            className="w-full rounded-xl border border-blue-800 bg-blue-950/70 px-4 py-3 text-sm text-white outline-none focus:border-orange-400"
          />
        </div>
      )}
    </div>
  );
}