import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { consumeRateLimit } from "@/lib/contact-leads-db";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 6;

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

function textValue(value: unknown, maxLength: number): string {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, maxLength)
    : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br />");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}

export async function POST(request: NextRequest) {
  try {
    if (!consumeRateLimit(`quote:${getClientIp(request)}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { success: false, error: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Données invalides." }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const name = textValue(input.name, 120);
    const company = textValue(input.company, 120);
    const email = textValue(input.email, 160).toLowerCase();
    const phone = textValue(input.phone, 25);
    const businessType = textValue(input.businessType, 80);
    const needs = Array.isArray(input.needs)
      ? input.needs.filter((need): need is string => typeof need === "string").map((need) => textValue(need, 80)).slice(0, 12)
      : [];
    const companySize = textValue(input.companySize, 80);
    const urgency = textValue(input.urgency, 80);
    const objective = textValue(input.objective, 160);
    const details = textValue(input.details, 2500);
    const minPrice = Number(input.minPrice);
    const maxPrice = Number(input.maxPrice);
    const minDays = Number(input.minDays);
    const maxDays = Number(input.maxDays);

    // -----------------------------
    // Validation
    // -----------------------------

    if (!name || name.length < 2 || !isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Le nom et l'adresse email sont obligatoires.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice) || !Number.isFinite(minDays) || !Number.isFinite(maxDays)) {
      return NextResponse.json(
        { success: false, error: "Estimation invalide." },
        { status: 400 }
      );
    }

    // -----------------------------
    // Variables SMTP
    // -----------------------------

    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || process.env.MAIL_HOST;
    const portRaw = process.env.SMTP_PORT || process.env.EMAIL_PORT || process.env.MAIL_PORT;
    const port = Number(portRaw);
    const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.MAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || process.env.MAIL_PASSWORD;
    const to = process.env.SMTP_TO || process.env.EMAIL_TO || process.env.MAIL_TO || user;

    const missingConfig: string[] = [];
    if (!host) missingConfig.push("SMTP_HOST|EMAIL_HOST|MAIL_HOST");
    if (!portRaw || !Number.isFinite(port)) {
      missingConfig.push("SMTP_PORT|EMAIL_PORT|MAIL_PORT (nombre)");
    }
    if (!user) missingConfig.push("SMTP_USER|EMAIL_USER|MAIL_USER");
    if (!pass) missingConfig.push("SMTP_PASS|EMAIL_PASSWORD|MAIL_PASSWORD");
    if (!to) missingConfig.push("SMTP_TO|EMAIL_TO|MAIL_TO");

    if (missingConfig.length > 0) {
      console.error("Configuration SMTP incomplète:", missingConfig.join(", "));

      return NextResponse.json(
        {
          success: false,
          error:
            process.env.NODE_ENV === "production"
              ? "Configuration email incomplète."
              : `Configuration SMTP incomplète: ${missingConfig.join(", ")}`,
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
      to,
      replyTo: email,

      subject: `Nouvelle demande de devis - ${name}`,

      html: `
      <div style="font-family:Arial,sans-serif;font-size:15px;color:#333;line-height:1.6">

      <h2 style="color:#0F3D91">
      Nouvelle demande de devis
      </h2>

      <hr>

      <h3>Informations du client</h3>

      <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
      <p><strong>Entreprise :</strong> ${escapeHtml(company || "Non renseignée")}</p>
      <p><strong>Email :</strong> ${escapeHtml(email)}</p>
      <p><strong>Téléphone :</strong> ${escapeHtml(phone || "Non renseigné")}</p>

      <hr>

      <h3>Projet</h3>

      <p><strong>Profil :</strong> ${escapeHtml(businessType || "Non renseigné")}</p>

      <p><strong>Besoins :</strong>
      ${
        Array.isArray(needs)
          ? escapeHtml(needs.join(", "))
          : "Non renseigné"
      }
      </p>

      <p><strong>Taille :</strong> ${escapeHtml(companySize || "Non renseignée")}</p>

      <p><strong>Urgence :</strong> ${escapeHtml(urgency || "Non renseignée")}</p>

      <p><strong>Objectif :</strong> ${escapeHtml(objective || "Non renseigné")}</p>

      <p><strong>Détails :</strong></p>

      <p>${escapeHtml(details || "Aucun détail fourni.")}</p>

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