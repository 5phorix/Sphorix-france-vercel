import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { nom, email, sujet, message } = await request.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Vérifie la connexion SMTP
    await transporter.verify();
    console.log("✅ Connexion SMTP OK");

    // Envoi du mail
    const info = await transporter.sendMail({
      from: `"Site Sphorix" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: sujet || "Nouveau message depuis le site",
      text: `
Nom : ${nom}

Email : ${email}

Sujet : ${sujet}

Message :

${message}
      `,
    });

    console.log("✅ Email envoyé :", info.messageId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ Erreur SMTP :", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}