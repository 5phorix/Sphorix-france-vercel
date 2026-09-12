import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AccountDownload = {
  id: string;
  orderId: string;
  productName: string;
  originalName: string;
};

export type AccountOrder = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
};

export type AccountProfile = {
  id: string;
  fullName: string | null;
  companyName: string | null;
  phone: string | null;
};

export async function prepareAccountData(userId: string, email: string) {
  const supabase = createSupabaseAdminClient();

  // Ensure profile row exists
  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, full_name, company_name, phone")
    .eq("id", userId)
    .single();

  let profile: AccountProfile = {
    id: userId,
    fullName: profileData?.full_name ?? null,
    companyName: profileData?.company_name ?? null,
    phone: profileData?.phone ?? null,
  };

  if (!profileData) {
    await supabase.from("profiles").insert({ id: userId, full_name: "" });
  }

  await supabase
    .from("orders")
    .update({ user_id: userId })
    .is("user_id", null)
    .eq("customer_email", email.toLowerCase());

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, status, total_cents, currency, created_at, order_items(id, product_id, product_name, quantity)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (ordersError) throw new Error(ordersError.message);

  const paidOrders = (orders ?? []).filter((order) => order.status === "paid");
  const productIds = paidOrders.flatMap((order) => order.order_items.map((item) => item.product_id));
  const { data: files, error: filesError } = productIds.length > 0
    ? await supabase.from("product_files").select("id, product_id, original_name").in("product_id", [...new Set(productIds)])
    : { data: [], error: null };

  if (filesError) throw new Error(filesError.message);

  const downloadsToCreate = paidOrders.flatMap((order) => order.order_items.flatMap((item) =>
    (files ?? []).filter((file) => file.product_id === item.product_id).map((file) => ({
      order_item_id: item.id,
      user_id: userId,
      product_file_id: file.id,
    }))
  ));

  if (downloadsToCreate.length > 0) {
    const { error: downloadsError } = await supabase
      .from("downloads")
      .upsert(downloadsToCreate, { onConflict: "order_item_id,product_file_id", ignoreDuplicates: true });
    if (downloadsError) throw new Error(downloadsError.message);
  }

  const { data: downloads, error: downloadListError } = await supabase
    .from("downloads")
    .select("id, order_item_id, product_file_id")
    .eq("user_id", userId);

  if (downloadListError) throw new Error(downloadListError.message);

  const itemById = new Map(paidOrders.flatMap((order) => order.order_items.map((item) => [item.id, { orderId: order.id, productName: item.product_name }] as const)));
  const fileById = new Map((files ?? []).map((file) => [file.id, file.original_name]));

  return {
    profile,
    orders: (orders ?? []).map((order) => ({
      id: order.id,
      status: order.status,
      totalCents: order.total_cents,
      currency: order.currency,
      createdAt: order.created_at,
    })) as AccountOrder[],
    downloads: (downloads ?? []).flatMap((download) => {
      const item = itemById.get(download.order_item_id);
      const originalName = fileById.get(download.product_file_id);
      return item && originalName
        ? [{ id: download.id, orderId: item.orderId, productName: item.productName, originalName }]
        : [];
    }) as AccountDownload[],
  };
}
