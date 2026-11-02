import "server-only";

import { createHash } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SearchIndex = {
  fields?: Array<{ name?: string; type?: string; key?: boolean; searchable?: boolean; filterable?: boolean }>;
};

type SearchResults = {
  value?: Array<{ id?: string }>;
  "@odata.nextLink"?: string;
};

function getRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`La variable ${name} est requise pour actualiser les connaissances.`);
  return value;
}

function getSearchEndpoint() {
  let endpoint: URL;
  try {
    endpoint = new URL(getRequired("AZURE_AI_SEARCH_ENDPOINT"));
  } catch {
    throw new Error("Le point de terminaison Azure AI Search est invalide.");
  }
  if (endpoint.protocol !== "https:" || !endpoint.hostname.endsWith(".search.windows.net")) {
    throw new Error("Le point de terminaison configuré n’est pas un service Azure AI Search valide.");
  }
  return endpoint;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (match, decimal: string) => {
      const codePoint = Number(decimal);
      return Number.isInteger(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    })
    .replace(/&#x([0-9a-f]+);/gi, (match, hexadecimal: string) => {
      const codePoint = parseInt(hexadecimal, 16);
      return Number.isInteger(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    });
}

function extractText(html: string): string {
  const mainContent = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const withoutNonContent = mainContent
    .replace(/<(script|style|noscript|svg|form|button|nav|header|footer|aside)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeHtmlEntities(withoutNonContent)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 30000);
}

function getPageTitle(html: string, url: string): string {
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return title
    ? decodeHtmlEntities(title.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim().slice(0, 200)
    : new URL(url).pathname || "Sphorix France";
}

function safeIndexPath(indexName: string, resource: string) {
  return `/indexes/${encodeURIComponent(indexName)}/${resource}`;
}

async function searchRequest(url: URL, apiKey: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "api-key": apiKey,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
}

export async function syncPublicWebsiteKnowledge(): Promise<{ indexedPages: number; removedPages: number }> {
  const endpoint = getSearchEndpoint();
  const apiKey = getRequired("AZURE_AI_SEARCH_API_KEY");
  const indexName = getRequired("AZURE_AI_SEARCH_INDEX");
  const apiVersion = process.env.AZURE_AI_SEARCH_API_VERSION?.trim() || "2024-07-01";
  const siteUrl = new URL(process.env.CHATBOT_PUBLIC_SITE_URL?.trim() || "https://www.sphorix.fr");
  if (
    siteUrl.protocol !== "https:"
    || !["sphorix.fr", "www.sphorix.fr"].includes(siteUrl.hostname)
  ) {
    throw new Error("L’URL source doit être le site public sphorix.fr.");
  }

  const sitemapResponse = await fetch(new URL("/sitemap.xml", siteUrl), {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!sitemapResponse.ok) {
    throw new Error(`Le sitemap public n’a pas pu être lu (${sitemapResponse.status}).`);
  }
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => decodeHtmlEntities(match[1]))
    .map((value) => new URL(value))
    .filter((url) =>
      url.origin === siteUrl.origin
      && !/^\/(api|administration|connexion|inscription|compte|panier|commande)(\/|$)/.test(url.pathname)
    );
  if (urls.length === 0) throw new Error("Aucune page publique autorisée n’a été trouvée dans le sitemap.");

  const documents = await Promise.all(urls.map(async (url) => {
    const response = await fetch(url, {
      headers: { accept: "text/html" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Impossible d’indexer ${url.pathname} (${response.status}).`);
    const html = await response.text();
    const content = extractText(html);
    if (content.length < 80) return null;
    return {
      id: createHash("sha256").update(url.toString()).digest("hex"),
      title: getPageTitle(html, url.toString()),
      url: url.toString(),
      content,
    };
  }));
  const validDocuments = documents.filter((document): document is NonNullable<typeof document> => document !== null);
  if (validDocuments.length === 0) throw new Error("Aucun contenu de page exploitable n’a été trouvé.");

  const indexUrl = new URL(`/indexes/${encodeURIComponent(indexName)}?api-version=${apiVersion}`, endpoint.origin);
  const indexResponse = await searchRequest(indexUrl, apiKey);
  if (indexResponse.status === 404) {
    const createUrl = new URL(`/indexes?api-version=${apiVersion}`, endpoint.origin);
    const createResponse = await searchRequest(createUrl, apiKey, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: indexName,
        fields: [
          { name: "id", type: "Edm.String", key: true, searchable: false, filterable: true },
          { name: "title", type: "Edm.String", searchable: true },
          { name: "url", type: "Edm.String", searchable: false },
          { name: "content", type: "Edm.String", searchable: true },
          { name: "source", type: "Edm.String", searchable: false, filterable: true },
        ],
      }),
    });
    if (!createResponse.ok) {
      throw new Error(`L’index Azure AI Search n’a pas pu être créé (${createResponse.status}).`);
    }
  } else if (!indexResponse.ok) {
    throw new Error(`L’index Azure AI Search n’a pas pu être vérifié (${indexResponse.status}).`);
  } else {
    const index = await indexResponse.json() as SearchIndex;
    const fields = new Map((index.fields ?? []).map((field) => [field.name, field]));
    const requiredFields: Record<string, (field: NonNullable<SearchIndex["fields"]>[number]) => boolean> = {
      id: (field) => field.type === "Edm.String" && field.key === true,
      title: (field) => field.type === "Edm.String" && field.searchable === true,
      url: (field) => field.type === "Edm.String",
      content: (field) => field.type === "Edm.String" && field.searchable === true,
      source: (field) => field.type === "Edm.String" && field.filterable === true,
    };
    for (const [requiredField, isValid] of Object.entries(requiredFields)) {
      const field = fields.get(requiredField);
      if (!field || !isValid(field)) {
        throw new Error(`Le champ « ${requiredField} » de l’index Azure AI Search n’est pas compatible.`);
      }
    }
  }

  const searchUrl = new URL(`${safeIndexPath(indexName, "docs/search")}?api-version=${apiVersion}`, endpoint.origin);
  const existingResponse = await searchRequest(searchUrl, apiKey, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      search: "*",
      select: "id",
      filter: "source eq 'public-website'",
      top: 1000,
    }),
  });
  if (!existingResponse.ok) {
    throw new Error(`Les documents déjà indexés n’ont pas pu être vérifiés (${existingResponse.status}).`);
  }
  const existing = await existingResponse.json() as SearchResults;
  if (existing["@odata.nextLink"]) {
    throw new Error("L’index contient plus de 1 000 documents ; vérifiez-le avant la synchronisation.");
  }

  const currentIds = new Set(validDocuments.map((document) => document.id));
  const removedIds = (existing.value ?? [])
    .map((document) => document.id)
    .filter((id): id is string => Boolean(id && !currentIds.has(id)));
  const actions = [
    ...validDocuments.map((document) => ({ "@search.action": "upload", ...document, source: "public-website" })),
    ...removedIds.map((id) => ({ "@search.action": "delete", id })),
  ];
  const uploadUrl = new URL(`${safeIndexPath(indexName, "docs/index")}?api-version=${apiVersion}`, endpoint.origin);
  for (let offset = 0; offset < actions.length; offset += 500) {
    const uploadResponse = await searchRequest(uploadUrl, apiKey, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: actions.slice(offset, offset + 500) }),
    });
    if (!uploadResponse.ok) {
      throw new Error(`Les pages du site n’ont pas pu être indexées (${uploadResponse.status}).`);
    }

    const uploadResult = await uploadResponse.json() as {
      value?: Array<{ status?: boolean; errorMessage?: string }>;
    };
    const failedDocument = uploadResult.value?.find((item) => item.status === false);
    if (failedDocument) {
      throw new Error(`Azure AI Search a refusé un document : ${failedDocument.errorMessage || "erreur inconnue"}.`);
    }
  }

  const supabase = createSupabaseAdminClient();
  const { error: settingsError } = await supabase
    .from("chatbot_settings")
    .update({
      knowledge_synced_at: new Date().toISOString(),
      indexed_page_count: validDocuments.length,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (settingsError) {
    throw new Error(`Les connaissances ont été indexées, mais leur statut n’a pas pu être enregistré : ${settingsError.message}`);
  }

  return { indexedPages: validDocuments.length, removedPages: removedIds.length };
}
