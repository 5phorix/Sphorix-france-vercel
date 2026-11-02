import { NextRequest, NextResponse } from "next/server";

import { purgeExpiredChatData, purgeExpiredContactLeads } from "@/lib/privacy-retention";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: "Non autorisé." }, { status: 401 });
  }

  try {
    const deletedCount = await purgeExpiredContactLeads();
    const chatbotDeleted = await purgeExpiredChatData();
    return NextResponse.json({
      success: true,
      deletedCount,
      chatbotDeleted,
    });
  } catch (error) {
    console.error("Échec de la purge des demandes de contact expirées :", error);
    return NextResponse.json(
      { success: false, error: "La purge des demandes expirées a échoué." },
      { status: 500 }
    );
  }
}
