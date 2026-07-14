"use client";

import { useState } from "react";

import QuoteProgress from "./QuoteProgress";
import StepBusiness from "./steps/StepBusiness";
import StepNeed from "./steps/StepNeed";
import StepProject from "./steps/StepProject";
import StepEstimate from "./steps/StepEstimate";

export default function QuoteWizard() {
  const [step, setStep] = useState(1);

  // Étape 1
  const [businessType, setBusinessType] = useState("");
  const [customBusiness, setCustomBusiness] = useState("");

  // Étape 2
  const [needs, setNeeds] = useState<string[]>([]);

  // Étape 3
  const [companySize, setCompanySize] = useState("");
  const [urgency, setUrgency] = useState("");
  const [objective, setObjective] = useState("");
  const [details, setDetails] = useState("");

  // Validation des étapes
  const canContinue =
    (step !== 1 ||
      (businessType !== "" &&
        (businessType !== "autre" ||
          customBusiness.trim() !== ""))) &&
    (step !== 2 || needs.length > 0) &&
    (step !== 3 ||
      (companySize !== "" &&
        urgency !== "" &&
        objective !== ""));

  return (
    <div className="rounded-[32px] border border-blue-800/60 bg-blue-900/60 p-6 sm:p-10">

      {/* Barre de progression */}
      <QuoteProgress step={step} />

      {/* Contenu */}
      <div className="mt-8">

        {step === 1 && (
          <StepBusiness
            value={businessType}
            customValue={customBusiness}
            onChange={setBusinessType}
            onCustomChange={setCustomBusiness}
          />
        )}

        {step === 2 && (
          <StepNeed
            value={needs}
            onChange={setNeeds}
          />
        )}

        {step === 3 && (
          <StepProject
            companySize={companySize}
            urgency={urgency}
            objective={objective}
            details={details}
            onCompanySizeChange={setCompanySize}
            onUrgencyChange={setUrgency}
            onObjectiveChange={setObjective}
            onDetailsChange={setDetails}
          />
        )}

        {step === 4 && (
          <StepEstimate
            businessType={businessType}
            needs={needs}
            companySize={companySize}
            urgency={urgency}
            objective={objective}
          />
        )}

      </div>

      {/* Navigation */}

      <div className="mt-10 flex justify-between">

        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep((current) => Math.max(current - 1, 1))}
          className="rounded-full border border-blue-700 px-5 py-2 text-white transition hover:border-orange-400 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Retour
        </button>

        {step < 4 && (
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => setStep((current) => Math.min(current + 1, 4))}
            className="rounded-full bg-orange-500 px-6 py-2 font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Continuer
          </button>
        )}

      </div>

    </div>
  );
}