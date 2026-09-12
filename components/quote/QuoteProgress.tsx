"use client";

interface QuoteProgressProps {
  step: number;
}

const labels = [
  "Activité",
  "Besoins",
  "Projet",
  "Estimation",
];

export default function QuoteProgress({
  step,
}: QuoteProgressProps) {
  return (
    <div className="mb-10">

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          Étape {step} sur 4
        </p>

        <p className="text-sm font-bold text-orange-600">
          {Math.round((step / 4) * 100)} %
        </p>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
          style={{
            width: `${(step / 4) * 100}%`,
          }}
        />
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">

        {labels.map((label, index) => {

          const current = index + 1;

          return (
            <div
              key={label}
              className="flex flex-col items-center"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all
                ${
                  current < step
                    ? "bg-emerald-600 text-white shadow-sm"
                    : current === step
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "border border-slate-200 bg-slate-100 text-slate-400"
                }`}
              >
                {current < step ? "✓" : current}
              </div>

              <span
                className={`mt-2 text-center text-xs font-semibold
                ${
                  current <= step
                    ? "text-slate-900"
                    : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
          );

        })}

      </div>

    </div>
  );
}