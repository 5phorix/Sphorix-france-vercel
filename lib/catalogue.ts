import type { Database } from "@/types/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/catalogue-types";

export { type Product } from "@/lib/catalogue-types";

/* Server-only data access for the catalogue. */
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

type CatalogueProduct = ProductRow & {
  categories?: Database["public"]["Tables"]["categories"]["Row"] | null;
};

type Category = Database["public"]["Tables"]["categories"]["Row"];

function hasSupabaseConfiguration() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getCatalogue() {
  if (!hasSupabaseConfiguration()) {
    return { products: [] as Product[], categories: [] as Category[] };
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*, categories(*)")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);

  if (productsError) throw new Error(productsError.message);
  if (categoriesError) throw new Error(categoriesError.message);

  return {
    products: (products ?? []) as CatalogueProduct[],
    categories: categories ?? [],
  };
}

export async function getProductBySlug(slug: string) {
  if (!hasSupabaseConfiguration()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as CatalogueProduct | null;
}
