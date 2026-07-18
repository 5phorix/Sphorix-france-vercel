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

    // -----------------------------
    // Validation
    // -----------------------------

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Le nom et l'adresse email sont obligatoires.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Variables SMTP
    // -----------------------------

    const host = process.env.EMAIL_HOST;
    const port = Number(process.env.EMAIL_PORT);
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;

    if (!host || !port || !user || !pass) {
      console.error("Configuration SMTP incomplète.");

      return NextResponse.json(
        {
          success: false,
          error: "Configuration email incomplète.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------
    // Transporteur
    // -----------------------------

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    // -----------------------------
    // Envoi
    // -----------------------------

    await transporter.sendMail({
      from: `"Sphorix France" <${user}>`,
      to: "contact@sphorix.fr",
      replyTo: email,

      subject: `Nouvelle demande de devis - ${name}`,

      html: `
      <div style="font-family:Arial,sans-serif;font-size:15px;color:#333;line-height:1.6">

      <h2 style="color:#0F3D91">
      Nouvelle demande de devis
      </h2>

      <hr>

      <h3>Informations du client</h3>

      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Entreprise :</strong> ${company || "Non renseignée"}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Téléphone :</strong> ${phone || "Non renseigné"}</p>

      <hr>

      <h3>Projet</h3>

      <p><strong>Profil :</strong> ${businessType}</p>

      <p><strong>Besoins :</strong>
      ${
        Array.isArray(needs)
          ? needs.join(", ")
          : "Non renseigné"
      }
      </p>

      <p><strong>Taille :</strong> ${companySize}</p>

      <p><strong>Urgence :</strong> ${urgency}</p>

      <p><strong>Objectif :</strong> ${objective}</p>

      <p><strong>Détails :</strong></p>

      <p>${details || "Aucun détail fourni."}</p>

      <hr>

      <h3>Estimation automatique</h3>

      <p>
      <strong>Budget :</strong>
      ${minPrice} € HT à ${maxPrice} € HT
      </p>

      <p>
      <strong>Durée :</strong>
      ${minDays} à ${maxDays} jour(s)
      </p>

      <hr>

      <p style="font-size:13px;color:#777">
      Estimation automatique générée depuis le simulateur Sphorix.
      </p>

      </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Votre demande a été envoyée avec succès.",
    });
    } catch (error: unknown) {
    console.error("========== API QUOTE ==========");
    console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "Erreur interne du serveur.";

    return NextResponse.json(
      {
        success: false,
          error: message,
      },
      {
        status: 500,
      }
    );
  }
}