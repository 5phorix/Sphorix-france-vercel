"use client";

import { useState } from "react";
import StepBusiness from "./steps/StepBusiness";
import StepNeed from "./steps/StepNeed";
import StepProject from "./steps/StepProject";
import StepEstimate from "./steps/StepEstimate";

export default function QuoteWizard() {
  const [step, setStep] = useState(1);

  const [businessType, setBusinessType] = useState("");
  const [customBusiness, setCustomBusiness] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [companySize, setCompanySize] = useState("");
  const [urgency, setUrgency] = useState("");
  const [objective, setObjective] = useState("");
  const [details, setDetails] = useState("");


  const canContinue =
    (step !== 1 ||
      (businessType !== "" &&
        (businessType !== "autre" || customBusiness.trim() !== ""))) &&
    (step !== 2 || needs.length > 0) &&
    (step !== 3 ||
    (
    companySize !== "" &&
    urgency !== "" &&
    objective !== ""
    ));

  return (
    <div className="rounded-[32px] border border-blue-800/60 bg-blue-900/60 p-6 sm:p-10">

      <div className="text-sm text-slate-300">
        Étape {step} sur 4
      </div>


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


      <div className="mt-10 flex justify-between">

        <button
          disabled={step === 1}
          onClick={() => setStep(Math.max(step - 1, 1))}
          className="rounded-full border border-blue-700 px-5 py-2 text-white disabled:opacity-30"
        >
          Retour
        </button>


        {step < 4 && (
          <button
            disabled={!canContinue}
            onClick={() => setStep(Math.min(step + 1, 4))}
            className="rounded-full bg-orange-500 px-6 py-2 font-semibold text-white transition hover:bg-orange-400 disabled:opacity-30"
          >
            Continuer
          </button>
        )}

      </div>

    </div>
  );
}