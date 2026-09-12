import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const products = [
  {
    slug: "tableau-suivi-tresorerie",
    file: "tableau-suivi-tresorerie.xlsx",
  },
  {
    slug: "tableau-suivi-depenses",
    file: "tableau-suivi-depenses.xlsx",
  },
  {
    slug: "tableau-bord-petite-entreprise",
    file: "tableau-bord-petite-entreprise.xlsx",
  },
];

for (const product of products) {
  const { data: productRow, error: productError } = await supabase
    .from("products")
    .select("id, slug")
    .eq("slug", product.slug)
    .single();

  if (productError || !productRow) {
    throw new Error(`Produit introuvable: ${product.slug}`);
  }

  const localPath = path.join(process.cwd(), "content", "products", product.file);
  const file = await readFile(localPath);
  const storagePath = `products/${product.slug}/${product.file}`;

  const { error: uploadError } = await supabase.storage
    .from("digital-products")
    .upload(storagePath, file, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      upsert: true,
    });

  if (uploadError) throw new Error(`Upload échoué pour ${product.slug}: ${uploadError.message}`);

  const { error: fileRowError } = await supabase
    .from("product_files")
    .upsert(
      {
        product_id: productRow.id,
        storage_path: storagePath,
        original_name: product.file,
      },
      { onConflict: "storage_path" }
    );

  if (fileRowError) throw new Error(`Référence fichier échouée pour ${product.slug}: ${fileRowError.message}`);
  console.log(`OK ${product.slug} -> ${storagePath}`);
}
