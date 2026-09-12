"use client";

import { useState } from "react";

interface StepEstimateProps {
  businessType: string;
  needs: string[];
  companySize: string;
  urgency: string;
  objective: string;
  details: string;
}

export default function StepEstimate({
  businessType,
  needs,
  companySize,
  urgency,
  objective,
  details,
}: StepEstimateProps) {

  const dailyRate = 200;


  let minDays = 1;
  let maxDays = 1;


  // =========================
  // PROFIL ENTREPRISE
  // =========================

  if (businessType === "tpe-pme") {
    minDays += 1;
    maxDays += 3;
  }


  if (businessType === "independant") {
    maxDays += 1;
  }


  if (businessType === "commerce") {
    minDays += 2;
    maxDays += 5;
  }


  if (businessType === "association") {
    minDays += 1;
    maxDays += 2;
  }



  // =========================
  // BESOINS
  // =========================

  needs.forEach((need) => {

    switch (need) {

      case "organisation":
        minDays += 2;
        maxDays += 4;
        break;


      case "kpi":
        minDays += 2;
        maxDays += 5;
        break;


      case "couts":
        minDays += 2;
        maxDays += 4;
        break;


      case "digital":
        minDays += 3;
        maxDays += 8;
        break;


      case "gestion":
        minDays += 1;
        maxDays += 3;
        break;


      default:
        break;

    }

  });



  // =========================
  // TAILLE ENTREPRISE
  // =========================

  if (companySize === "11 à 50 salariés") {
    minDays += 2;
    maxDays += 4;
  }


  if (companySize === "Plus de 50 salariés") {
    minDays += 5;
    maxDays += 8;
  }



  // =========================
  // URGENCE
  // =========================

  if (urgency === "Besoin rapide") {

    minDays = Math.ceil(minDays * 1.2);
    maxDays = Math.ceil(maxDays * 1.2);

  }



  const minPrice = minDays * dailyRate;
  const maxPrice = maxDays * dailyRate;



  // =========================
  // FORMULAIRE EMAIL
  // =========================

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const handleSendEstimate = async (
  event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setIsSending(true);


    try {

      const data = {
        name,
        company,
        email,
        phone,

        businessType,
        needs,
        companySize,
        urgency,
        objective,
        details,

        minPrice,
        maxPrice,
        minDays,
        maxDays,
      };


      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      console.log("Status :", response.status);
      console.log("Réponse API :", result);

      if (!response.ok) {
        throw new Error(
          result.error || "Erreur lors de l'envoi de votre demande."
        );
      }

      // =========================
      // NETTOYAGE FORMULAIRE
      // =========================

      setName("");
      setCompany("");
      setEmail("");
      setPhone("");



      // =========================
      // MESSAGE SUCCÈS
      // =========================

      setSubmitted(true);



    } catch (error) {

    console.error("Erreur :", error);
    alert(error instanceof Error ? error.message : "Erreur inconnue");

    } finally {

      setIsSending(false);

    }

  };
    return (
    <div>

      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
        Votre estimation personnalisée
      </h2>


      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Cette première estimation est calculée selon votre activité,
          vos besoins et la charge d&apos;accompagnement nécessaire.
      </p>



      {/* ESTIMATION */}

      <div className="mt-8 rounded-3xl border border-orange-200 bg-orange-50/70 p-6 sm:p-8">

        <p className="text-xs font-bold uppercase tracking-wider text-orange-700">
            Estimation indicative de l&apos;accompagnement
        </p>


        <div className="mt-3 text-3xl font-extrabold text-slate-950 sm:text-4xl">

          {minPrice.toLocaleString("fr-FR")} € -{" "}
          {maxPrice.toLocaleString("fr-FR")} € HT

        </div>


        <p className="mt-3 text-sm font-medium text-slate-600">

          Soit environ {minDays} à {maxDays} jour(s)
            d&apos;accompagnement selon le périmètre retenu.

        </p>

      </div>





      {/* FORMULAIRE EMAIL */}

      <div className="mt-8 rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 sm:p-8">


        <h3 className="text-xl font-bold text-slate-950">
          Votre estimation est prête.
        </h3>


        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Recevez votre synthèse personnalisée par email.
        </p>



        {!submitted ? (

          <form
            onSubmit={handleSendEstimate}
            className="mt-6 space-y-4"
          >


            <input
              type="text"
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400"
            />



            <input
              type="text"
              placeholder="Entreprise (optionnel)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400"
            />



            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400"
            />



            <input
              type="tel"
              placeholder="Téléphone (optionnel)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400"
            />



            <button
              type="submit"
              disabled={isSending}
              className="rounded-full bg-slate-950 px-7 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >

              {isSending
                ? "Préparation..."
                : "Recevoir mon estimation"
              }

            </button>


          </form>



        ) : (


          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">


            <p className="font-bold text-emerald-800">
              Merci pour votre demande.
            </p>


            <p className="mt-1 text-sm text-emerald-700">

              Votre synthèse personnalisée sera envoyée rapidement
              après vérification des informations.

            </p>


          </div>


        )}


      </div>





      {/* SYNTHÈSE */}

      <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6">


        <h3 className="font-bold text-slate-950">
          Synthèse de votre demande
        </h3>



        <div className="mt-3 space-y-2 text-sm text-slate-600">


          <p>
            Profil : <span className="font-semibold text-slate-950">{businessType || "Non renseigné"}</span>
          </p>



          <p>
            Besoins : <span className="font-semibold text-slate-950">{needs.length} sélectionné(s)</span>
          </p>



          <p>
            Taille : <span className="font-semibold text-slate-950">{companySize || "Non renseignée"}</span>
          </p>



          <p>
            Objectif : <span className="font-semibold text-slate-950">{objective || "Non renseigné"}</span>
          </p>



          <p>
            Taux journalier appliqué : <span className="font-semibold text-slate-950">{dailyRate} €/jour</span>
          </p>


        </div>


      </div>





      {/* INFORMATION TARIFAIRE */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">


        <p className="text-sm leading-relaxed text-slate-600">

            Cette estimation est indicative et permet d&apos;obtenir
          une première visibilité budgétaire.
          Le périmètre définitif sera confirmé après un échange
          sur vos objectifs, vos contraintes et vos attentes.

        </p>


      </div>


    </div>
  );
}