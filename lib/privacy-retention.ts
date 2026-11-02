import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/supabase";

export const CONTACT_RETENTION_MONTHS = 24;
export const CHAT_RETENTION_MONTHS = 24;
export const PRIVACY_POLICY_VERSION = "2026-11";

type ContactLeadInsert = Database["public"]["Tables"]["contact_leads"]["Insert"];

export async function storeContactLead(record: ContactLeadInsert): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("contact_leads")
    .insert(record)
    .select("id")
    .single();

  if (error) throw new Error(`Impossible d'enregistrer la demande : ${error.message}`);
  return data.id;
}

export async function updateContactLeadDelivery(
  id: string,
  adminEmailSent: boolean,
  acknowledgementSent: boolean
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("contact_leads")
    .update({ admin_email_sent: adminEmailSent, acknowledgement_sent: acknowledgementSent })
    .eq("id", id);

  if (error) throw new Error(`Impossible de mettre à jour le statut de la demande : ${error.message}`);
}

export function getContactRetentionCutoff(now = new Date()): string {
  const cutoffMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - CONTACT_RETENTION_MONTHS, 1));
  const lastDayOfCutoffMonth = new Date(
    Date.UTC(cutoffMonth.getUTCFullYear(), cutoffMonth.getUTCMonth() + 1, 0)
  ).getUTCDate();
  cutoffMonth.setUTCDate(Math.min(now.getUTCDate(), lastDayOfCutoffMonth));
  cutoffMonth.setUTCHours(now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
  return cutoffMonth.toISOString();
}

export async function purgeExpiredContactLeads(now = new Date()): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("contact_leads")
    .delete()
    .lt("created_at", getContactRetentionCutoff(now))
    .select("id");

  if (error) throw new Error(`Impossible de supprimer les demandes arrivées à échéance : ${error.message}`);
  return data.length;
}

export async function purgeExpiredChatData(now = new Date()): Promise<{
  conversations: number;
  rateLimits: number;
}> {
  const supabase = createSupabaseAdminClient();
  const { data: expiredConversations, error: conversationsError } = await supabase
    .from("chat_conversations")
    .delete()
    .lt("expires_at", now.toISOString())
    .select("id");

  if (conversationsError) {
    throw new Error(`Impossible de supprimer les conversations arrivées à échéance : ${conversationsError.message}`);
  }

  const rateLimitCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { data: expiredRateLimits, error: rateLimitsError } = await supabase
    .from("chat_rate_limits")
    .delete()
    .lt("window_started_at", rateLimitCutoff)
    .select("visitor_key_hash");

  if (rateLimitsError) {
    throw new Error(`Impossible de nettoyer les limitations de débit expirées : ${rateLimitsError.message}`);
  }

  return {
    conversations: expiredConversations.length,
    rateLimits: expiredRateLimits.length,
  };
}
