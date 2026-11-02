import { NextRequest, NextResponse } from "next/server";

import { syncPublicWebsiteKnowledge } from "@/lib/chatbot/knowledge-sync";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: "Non autorisé." }, { status: 401 });
  }

  try {
    const result = await syncPublicWebsiteKnowledge();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Échec de la synchronisation des connaissances chatbot :", error);
    return NextResponse.json(
      { success: false, error: "La synchronisation des connaissances a échoué." },
      { status: 500 }
    );
  }
}
