import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price_cents: number;
}

interface OrderData {
  id: string;
  customer_email: string;
  total_cents: number;
  currency: string;
  created_at: string;
  order_items?: OrderItem[];
}

function getEmailConfig(): EmailConfig | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return {
    host: SMTP_HOST,
    port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  };
}

async function getTransporter() {
  const config = getEmailConfig();
  if (!config) {
    console.warn("SMTP non configuré - emails non envoyés");
    return null;
  }

  return nodemailer.createTransport(config);
}

export async function sendConfirmationEmail(order: OrderData) {
  const transporter = await getTransporter();
  if (!transporter) return false;

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sphorix-france.fr";
    const totalEur = (order.total_cents / 100).toFixed(2);

    const itemsHtml = (order.order_items || [])
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(item.product_name)}</td>
            <td style="text-align: center; padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
            <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">${(item.unit_price_cents / 100).toFixed(2)} €</td>
            <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${((item.unit_price_cents * item.quantity) / 100).toFixed(2)} €</td>
          </tr>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a202c; font-size: 28px; margin-bottom: 24px;">Confirmation de commande</h1>
            
            <p>Merci pour votre achat ! Votre commande a été reçue et payée.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Numéro de commande :</strong> ${escapeHtml(order.id)}</p>
              <p style="margin: 0 0 8px 0;"><strong>Date :</strong> ${new Date(order.created_at).toLocaleDateString("fr-FR")}</p>
              <p style="margin: 0;"><strong>Email :</strong> ${escapeHtml(order.customer_email)}</p>
            </div>

            <h2 style="color: #1a202c; font-size: 18px; margin-top: 24px; margin-bottom: 12px;">Détails de votre commande</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Produit</th>
                  <th style="text-align: center; padding: 8px; border-bottom: 2px solid #ddd;">Quantité</th>
                  <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Prix unitaire</th>
                  <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="text-align: right; margin-top: 16px;">
              <p style="font-size: 18px; font-weight: bold; color: #1a202c;">
                Total : <span style="color: #f97316;">${totalEur} €</span>
              </p>
            </div>

            <div style="background: #e8f5e9; padding: 16px; border-radius: 8px; margin-top: 24px; border-left: 4px solid #4caf50;">
              <p style="margin: 0; color: #2e7d32;"><strong>✓ Paiement confirmé</strong></p>
              <p style="margin: 8px 0 0 0; color: #558b2f; font-size: 14px;">Vous recevrez bientôt l'accès à vos téléchargements.</p>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <a href="${siteUrl}/compte" style="color: #f97316; text-decoration: none;">Consulter votre espace client</a> pour accéder à vos fichiers.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 12px; color: #999;">
                Des questions ? <a href="mailto:contact@sphorix-france.fr" style="color: #f97316; text-decoration: none;">Contactez-nous</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@sphorix-france.fr",
      to: order.customer_email,
      subject: `Confirmation de commande #${order.id}`,
      html,
      replyTo: "contact@sphorix-france.fr",
    });

    return true;
  } catch (error) {
    console.error("Erreur envoi email confirmation:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
) {
  const transporter = await getTransporter();
  if (!transporter) return false;

  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a202c; font-size: 28px; margin-bottom: 24px;">Réinitialiser votre mot de passe</h1>
            
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${escapeHtml(resetLink)}" style="display: inline-block; background: #f97316; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Réinitialiser mon mot de passe
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              Ou copiez ce lien :
              <br>
              <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; word-break: break-all;">${escapeHtml(resetLink)}</code>
            </p>

            <div style="background: #fff3cd; padding: 16px; border-radius: 8px; margin-top: 24px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠ Attention :</strong> Ce lien n'est valide que pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
              </p>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                Des questions ? <a href="mailto:contact@sphorix-france.fr" style="color: #f97316; text-decoration: none;">Contactez-nous</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@sphorix-france.fr",
      to: email,
      subject: "Réinitialiser votre mot de passe Sphorix",
      html,
      replyTo: "contact@sphorix-france.fr",
    });

    return true;
  } catch (error) {
    console.error("Erreur envoi email réinitialisation:", error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string = "") {
  const transporter = await getTransporter();
  if (!transporter) return false;

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sphorix-france.fr";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a202c; font-size: 28px; margin-bottom: 24px;">Bienvenue chez Sphorix !</h1>
            
            <p>Votre compte a été créé avec succès. Vous pouvez désormais accéder à votre espace client et gérer vos commandes.</p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${siteUrl}/compte" style="display: inline-block; background: #f97316; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Accéder à mon compte
              </a>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0 0 12px 0;"><strong>Que faire maintenant ?</strong></p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Parcourir notre <a href="${siteUrl}/boutique" style="color: #f97316; text-decoration: none;">boutique</a></li>
                <li>Découvrir nos <a href="${siteUrl}/services" style="color: #f97316; text-decoration: none;">services</a></li>
                <li>Demander un <a href="${siteUrl}/demande-devis" style="color: #f97316; text-decoration: none;">devis personnalisé</a></li>
              </ul>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                Des questions ? <a href="mailto:contact@sphorix-france.fr" style="color: #f97316; text-decoration: none;">Contactez-nous</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@sphorix-france.fr",
      to: email,
      subject: "Bienvenue chez Sphorix France",
      html,
      replyTo: "contact@sphorix-france.fr",
    });

    return true;
  } catch (error) {
    console.error("Erreur envoi email bienvenue:", error);
    return false;
  }
}

/**
 * Échappe les caractères HTML pour éviter les injections XSS
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
