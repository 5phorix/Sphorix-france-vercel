import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { insertContactLead } from "@/lib/contact-leads-db";

export const runtime = "nodejs";

type ContactType = "particulier" | "entreprise";

interface ContactPayload {
  contactType: ContactType;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  companyName?: string;
  companyRole?: string;
  siret?: string;
  activity?: string;
  consent: boolean;
  marketingConsent?: boolean;
  retentionMonths?: number;
  policyVersion?: string;
  website?: string;
  startedAt?: number;
}

const rateLimitStore = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 6;
const MIN_FORM_COMPLETION_MS = 2500;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }

  current.count += 1;
  rateLimitStore.set(ip, current);

  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

function sanitizeText(value: string, maxLength: number): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[+0-9().\s-]{6,25}$/.test(phone);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizePayload(body: ContactPayload): ContactPayload {
  return {
    contactType: body.contactType,
    fullName: sanitizeText(body.fullName || "", 120),
    email: sanitizeText(body.email || "", 160).toLowerCase(),
    phone: sanitizeText(body.phone || "", 25),
    subject: sanitizeText(body.subject || "", 140),
    message: sanitizeText(body.message || "", 2500),
    companyName: sanitizeText(body.companyName || "", 120),
    companyRole: sanitizeText(body.companyRole || "", 80),
    siret: sanitizeText(body.siret || "", 14),
    activity: sanitizeText(body.activity || "", 120),
    consent: body.consent === true,
    marketingConsent: body.marketingConsent === true,
    retentionMonths: Number(body.retentionMonths || 0),
    policyVersion: sanitizeText(body.policyVersion || "", 24),
    website: sanitizeText(body.website || "", 120),
    startedAt: Number(body.startedAt || 0),
  };
}

function validatePayload(payload: ContactPayload): string | null {
  if (payload.contactType !== "particulier" && payload.contactType !== "entreprise") {
    return "Type de contact invalide.";
  }

  if (payload.website) {
    return "OK_BOT";
  }

  if (!payload.consent) {
    return "Le consentement est obligatoire.";
  }

  if (!payload.policyVersion) {
    return "La version de politique de confidentialité est manquante.";
  }

  if (!payload.retentionMonths || payload.retentionMonths < 1 || payload.retentionMonths > 120) {
    return "Durée de conservation invalide.";
  }

  if (!payload.fullName || payload.fullName.length < 2) {
    return "Le nom complet est obligatoire.";
  }

  if (!payload.email || !isValidEmail(payload.email)) {
    return "Adresse email invalide.";
  }

  if (payload.phone && !isValidPhone(payload.phone)) {
    return "Numéro de téléphone invalide.";
  }

  if (!payload.subject || payload.subject.length < 4) {
    return "L'objet doit contenir au moins 4 caractères.";
  }

  if (!payload.message || payload.message.length < 20) {
    return "Le message doit contenir au moins 20 caractères.";
  }

  if (payload.contactType === "entreprise") {
    if (!payload.companyName || payload.companyName.length < 2) {
      return "Le nom de l'entreprise est obligatoire.";
    }

    if (!payload.activity || payload.activity.length < 2) {
      return "Le secteur d'activité est obligatoire.";
    }

    if (payload.siret && !/^\d{14}$/.test(payload.siret)) {
      return "Le SIRET doit contenir 14 chiffres.";
    }
  }

  const submissionDuration = Date.now() - Number(payload.startedAt || 0);
  if (!Number.isFinite(submissionDuration) || submissionDuration < MIN_FORM_COMPLETION_MS) {
    return "Soumission trop rapide. Veuillez réessayer.";
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Trop de tentatives. Réessayez dans quelques minutes.",
        },
        {
          status: 429,
        }
      );
    }

    const body = (await request.json()) as ContactPayload;
    const payload = normalizePayload(body);
    const validationError = validatePayload(payload);

    if (validationError === "OK_BOT") {
      return NextResponse.json({ success: true });
    }

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
        },
        {
          status: 400,
        }
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpTo = process.env.SMTP_TO || smtpUser;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpTo) {
      console.error("Configuration SMTP incomplète.");
      return NextResponse.json(
        {
          success: false,
          error: "Le service de contact est temporairement indisponible.",
        },
        {
          status: 500,
        }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const safe = {
      contactType: escapeHtml(payload.contactType),
      fullName: escapeHtml(payload.fullName),
      email: escapeHtml(payload.email),
      phone: escapeHtml(payload.phone || "Non renseigné"),
      subject: escapeHtml(payload.subject),
      message: escapeHtml(payload.message).replace(/\n/g, "<br/>"),
      companyName: escapeHtml(payload.companyName || "Non renseignée"),
      companyRole: escapeHtml(payload.companyRole || "Non renseignée"),
      siret: escapeHtml(payload.siret || "Non renseigné"),
      activity: escapeHtml(payload.activity || "Non renseigné"),
      retentionMonths: String(payload.retentionMonths || 0),
      policyVersion: escapeHtml(payload.policyVersion || "N/A"),
    };

    await transporter.sendMail({
      from: `"Site Sphorix" <${smtpUser}>`,
      to: smtpTo,
      replyTo: payload.email,
      subject: `[Contact] ${payload.subject}`,
      text: `
Type de contact : ${payload.contactType}
Nom complet : ${payload.fullName}
Email : ${payload.email}
Téléphone : ${payload.phone || "Non renseigné"}
Objet : ${payload.subject}
Entreprise : ${payload.companyName || "Non renseignée"}
Fonction : ${payload.companyRole || "Non renseignée"}
SIRET : ${payload.siret || "Non renseigné"}
Secteur d'activité : ${payload.activity || "Non renseigné"}
  Durée de conservation : ${payload.retentionMonths} mois
  Version politique : ${payload.policyVersion}
  Consentement marketing : ${payload.marketingConsent ? "Oui" : "Non"}

Message :
${payload.message}
      `,
      html: `
        <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#1f2937;">
          <h2 style="margin:0 0 12px;color:#0f3d91;">Nouveau message de contact</h2>
          <p><strong>Type de contact :</strong> ${safe.contactType}</p>
          <p><strong>Nom complet :</strong> ${safe.fullName}</p>
          <p><strong>Email :</strong> ${safe.email}</p>
          <p><strong>Téléphone :</strong> ${safe.phone}</p>
          <p><strong>Objet :</strong> ${safe.subject}</p>
          <hr style="border:0;border-top:1px solid #e5e7eb;margin:16px 0;"/>
          <p><strong>Entreprise :</strong> ${safe.companyName}</p>
          <p><strong>Fonction :</strong> ${safe.companyRole}</p>
          <p><strong>SIRET :</strong> ${safe.siret}</p>
          <p><strong>Secteur d'activité :</strong> ${safe.activity}</p>
            <p><strong>Durée de conservation :</strong> ${safe.retentionMonths} mois</p>
            <p><strong>Version politique :</strong> ${safe.policyVersion}</p>
            <p><strong>Consentement marketing :</strong> ${payload.marketingConsent ? "Oui" : "Non"}</p>
          <hr style="border:0;border-top:1px solid #e5e7eb;margin:16px 0;"/>
          <p><strong>Message :</strong></p>
          <p>${safe.message}</p>
        </div>
      `,
    });

    let acknowledgementSent = false;

    try {
      await transporter.sendMail({
        from: `"Sphorix France" <${smtpUser}>`,
        to: payload.email,
        subject: "Nous avons bien reçu votre message",
        text: `Bonjour ${payload.fullName},

Merci pour votre message. Votre demande a bien été reçue par Sphorix France.

Nous revenons vers vous rapidement avec une première réponse.

Récapitulatif:
- Objet: ${payload.subject}
- Date: ${new Date().toLocaleString("fr-FR")}

Cordialement,
Sphorix France`,
        html: `
          <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#1f2937;">
            <h2 style="margin:0 0 12px;color:#0f3d91;">Accusé de réception</h2>
            <p>Bonjour ${safe.fullName},</p>
            <p>Merci pour votre message. Votre demande a bien été reçue par Sphorix France.</p>
            <p>Nous revenons vers vous rapidement avec une première réponse.</p>
            <p><strong>Objet :</strong> ${safe.subject}</p>
            <p style="margin-top:20px;">Cordialement,<br/>Sphorix France</p>
          </div>
        `,
      });

      acknowledgementSent = true;
    } catch (ackError) {
      console.warn("Échec accusé de réception client :", ackError);
    }

    const leadId = insertContactLead({
      contactType: payload.contactType,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone || "",
      subject: payload.subject,
      message: payload.message,
      companyName: payload.companyName || "",
      companyRole: payload.companyRole || "",
      siret: payload.siret || "",
      activity: payload.activity || "",
      consent: payload.consent,
      marketingConsent: payload.marketingConsent === true,
      retentionMonths: payload.retentionMonths || 24,
      policyVersion: payload.policyVersion || "unknown",
      sourceIp: clientIp,
      userAgent: request.headers.get("user-agent") || "",
      adminEmailSent: true,
      acknowledgementSent,
    });

    return NextResponse.json({ success: true, leadId });

  } catch (error) {
    console.error("Erreur API contact :", error);

    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue. Veuillez réessayer plus tard.",
      },
      {
        status: 500,
      }
    );
  }
}