import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { getProductLabEntry } from "@/lib/product-lab";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProductLabDownloadRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: ProductLabDownloadRouteProps) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Cet espace est réservé au développement." }, { status: 404 });
  }

  const { slug } = await params;
  const product = getProductLabEntry(slug);

  if (!product?.fileName) {
    return NextResponse.json({ error: "Prototype indisponible." }, { status: 404 });
  }

  try {
    const file = await readFile(path.join(process.cwd(), "content", "products", product.fileName));
    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${product.fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier de test introuvable." }, { status: 404 });
  }
}