"use client";

import { useState } from "react";

interface StepEstimateProps {
  businessType: string;
  needs: string[];
  companySize: string;
  urgency: string;
  objective: string;
}

export default function StepEstimate({
  businessType,
  needs,
  companySize,
  urgency,
  objective,
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

        estimation: {
          minPrice,
          maxPrice,
          minDays,
          maxDays,
        },
      };



      const response = await fetch("/api/quote", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),

      });



      if (!response.ok) {

        throw new Error(
          "Erreur lors de l'envoi de votre demande."
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

      console.error(error);

    } finally {

      setIsSending(false);

    }

  };
    return (
    <div>

      <h2 className="text-2xl font-semibold text-white">
        Votre estimation personnalisée
      </h2>


      <p className="mt-3 text-slate-300">
        Cette première estimation est calculée selon votre activité,
        vos besoins et la charge d'accompagnement nécessaire.
      </p>



      {/* ESTIMATION */}

      <div className="mt-8 rounded-3xl border border-orange-400/50 bg-blue-950/70 p-6">

        <p className="text-sm text-slate-300">
          Estimation indicative de l'accompagnement
        </p>


        <div className="mt-3 text-3xl font-bold text-white">

          {minPrice.toLocaleString("fr-FR")} € -{" "}
          {maxPrice.toLocaleString("fr-FR")} € HT

        </div>


        <p className="mt-4 text-sm text-slate-300">

          Soit environ {minDays} à {maxDays} jour(s)
          d'accompagnement selon le périmètre retenu.

        </p>

      </div>





      {/* FORMULAIRE EMAIL */}

      <div className="mt-8 rounded-3xl border border-blue-800 bg-blue-950/70 p-6">


        <h3 className="text-xl font-semibold text-white">
          Votre estimation est prête.
        </h3>


        <p className="mt-2 text-sm text-slate-300">
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
              className="w-full rounded-xl border border-blue-800 bg-blue-900 px-4 py-3 text-white outline-none focus:border-orange-400"
            />



            <input
              type="text"
              placeholder="Entreprise (optionnel)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-xl border border-blue-800 bg-blue-900 px-4 py-3 text-white outline-none focus:border-orange-400"
            />



            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-blue-800 bg-blue-900 px-4 py-3 text-white outline-none focus:border-orange-400"
            />



            <input
              type="tel"
              placeholder="Téléphone (optionnel)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-blue-800 bg-blue-900 px-4 py-3 text-white outline-none focus:border-orange-400"
            />



            <button
              type="submit"
              disabled={isSending}
              className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-400 disabled:opacity-50"
            >

              {isSending
                ? "Préparation..."
                : "Recevoir mon estimation"
              }

            </button>


          </form>



        ) : (


          <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">


            <p className="font-medium text-green-400">
              Merci pour votre demande.
            </p>


            <p className="mt-2 text-sm text-slate-300">

              Votre synthèse personnalisée sera envoyée rapidement
              après vérification des informations.

            </p>


          </div>


        )}


      </div>





      {/* SYNTHÈSE */}

      <div className="mt-8 rounded-2xl bg-blue-950/50 p-5">


        <h3 className="font-semibold text-white">
          Synthèse de votre demande
        </h3>



        <div className="mt-4 space-y-2 text-sm text-slate-300">


          <p>
            Profil : {businessType || "Non renseigné"}
          </p>



          <p>
            Besoins : {needs.length} sélectionné(s)
          </p>



          <p>
            Taille : {companySize || "Non renseignée"}
          </p>



          <p>
            Objectif : {objective || "Non renseigné"}
          </p>



          <p>
            Taux journalier appliqué : {dailyRate} €/jour
          </p>


        </div>


      </div>





      {/* INFORMATION TARIFAIRE */}

      <div className="mt-6 rounded-xl border border-blue-800 bg-blue-900/50 p-4">


        <p className="text-sm leading-relaxed text-slate-300">

          Cette estimation est indicative et permet d'obtenir
          une première visibilité budgétaire.
          Le périmètre définitif sera confirmé après un échange
          sur vos objectifs, vos contraintes et vos attentes.

        </p>


      </div>


    </div>
  );
}