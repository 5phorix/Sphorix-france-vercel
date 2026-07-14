import { NextResponse } from "next/server";
import nodemailer from "nodemailer";


export async function POST(request: Request) {

  try {

    const body = await request.json();


    const {
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
    } = body;



    if (!name || !email) {

      return NextResponse.json(
        {
          success: false,
          error: "Nom et email obligatoires.",
        },
        {
          status: 400,
        }
      );

    }



    const transporter = nodemailer.createTransport({

      host: process.env.EMAIL_HOST,

      port: Number(process.env.EMAIL_PORT),

      secure: true,

      auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASSWORD,

      },

    });



    await transporter.verify();



    await transporter.sendMail({

      from: `"Sphorix - Demande de devis" <${process.env.EMAIL_USER}>`,

      to: "contact@sphorix.fr",

      replyTo: email,


      subject:
        `Nouvelle demande de devis - ${name}`,


      html: `

      <div style="font-family:Arial,sans-serif;color:#333">


        <h2>
          Nouvelle demande de devis Sphorix
        </h2>


        <h3>
          Informations client
        </h3>


        <p>
          <strong>Nom :</strong>
          ${name}
        </p>


        <p>
          <strong>Entreprise :</strong>
          ${company || "Non renseignée"}
        </p>


        <p>
          <strong>Email :</strong>
          ${email}
        </p>


        <p>
          <strong>Téléphone :</strong>
          ${phone || "Non renseigné"}
        </p>



        <hr />


        <h3>
          Projet
        </h3>


        <p>
          <strong>Profil :</strong>
          ${businessType || "Non renseigné"}
        </p>


        <p>
          <strong>Besoins :</strong>
          ${
            Array.isArray(needs)
              ? needs.join(", ")
              : "Non renseigné"
          }
        </p>


        <p>
          <strong>Taille :</strong>
          ${companySize || "Non renseignée"}
        </p>


        <p>
          <strong>Urgence :</strong>
          ${urgency || "Non renseignée"}
        </p>


        <p>
          <strong>Objectif :</strong>
          ${objective || "Non renseigné"}
        </p>


        <p>
          <strong>Détails :</strong>
        </p>

        <p>
          ${details || "Aucun détail fourni"}
        </p>



        <hr />



        <h3>
          Estimation automatique
        </h3>


        <p>
          <strong>Budget estimatif :</strong>
          ${minPrice} € HT -
          ${maxPrice} € HT
        </p>


        <p>
          <strong>Durée estimée :</strong>
          ${minDays} à ${maxDays} jour(s)
        </p>



        <br />


        <p>
          Cette estimation est indicative.
          Une validation sera effectuée après échange avec le client.
        </p>


      </div>

      `,

    });



    return NextResponse.json({

      success: true,

      message:
        "Votre demande de devis a bien été envoyée.",

    });



  } catch (error) {


    console.error(
      "Erreur API devis :",
      error
    );


    return NextResponse.json(

      {

        success:false,

        error:
          "Erreur lors de l'envoi de votre demande.",

      },

      {

        status:500,

      }

    );

  }

}