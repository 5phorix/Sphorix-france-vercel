import "server-only";

export type KnowledgeSource = {
  title: string;
  url: string;
  content: string;
};

type KnowledgeSearchResponse = {
  value?: Array<Record<string, unknown>>;
};

export type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export class ChatbotConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatbotConfigurationError";
  }
}

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new ChatbotConfigurationError(`La variable ${name} est requise.`);
  }
  return value;
}

function validateAzureUrl(rawUrl: string, allowedSuffixes: string[]): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ChatbotConfigurationError("Une URL Azure configurée est invalide.");
  }

  if (
    url.protocol !== "https:"
    || !allowedSuffixes.some((suffix) => url.hostname === suffix || url.hostname.endsWith(`.${suffix}`))
  ) {
    throw new ChatbotConfigurationError("L’URL configurée ne correspond pas à un point de terminaison Azure autorisé.");
  }
  return url;
}

export function isAzureChatbotConfigured(): boolean {
  const foundryUrl = process.env.AZURE_AI_FOUNDRY_CHAT_COMPLETIONS_URL?.trim();
  const searchEndpoint = process.env.AZURE_AI_SEARCH_ENDPOINT?.trim();
  const hasRequiredValues = Boolean(
    foundryUrl
    && process.env.AZURE_AI_FOUNDRY_API_KEY?.trim()
    && process.env.AZURE_AI_FOUNDRY_MODEL?.trim()
    && searchEndpoint
    && process.env.AZURE_AI_SEARCH_API_KEY?.trim()
    && process.env.AZURE_AI_SEARCH_INDEX?.trim()
  );
  if (!hasRequiredValues || !foundryUrl || !searchEndpoint) return false;

  try {
    validateAzureUrl(
      foundryUrl,
      ["services.ai.azure.com", "openai.azure.com", "inference.ai.azure.com"]
    );
    validateAzureUrl(searchEndpoint, ["search.windows.net"]);
    return true;
  } catch (error) {
    if (error instanceof ChatbotConfigurationError) return false;
    throw error;
  }
}

export async function searchSphorixKnowledge(query: string): Promise<KnowledgeSource[]> {
  const endpoint = validateAzureUrl(
    requiredEnvironmentValue("AZURE_AI_SEARCH_ENDPOINT"),
    ["search.windows.net"]
  );
  const indexName = requiredEnvironmentValue("AZURE_AI_SEARCH_INDEX");
  const apiKey = requiredEnvironmentValue("AZURE_AI_SEARCH_API_KEY");
  const apiVersion = process.env.AZURE_AI_SEARCH_API_VERSION?.trim() || "2024-07-01";
  const url = new URL(
    `/indexes/${encodeURIComponent(indexName)}/docs/search`,
    `${endpoint.origin}/`
  );
  url.searchParams.set("api-version", apiVersion);

  const semanticConfiguration = process.env.AZURE_AI_SEARCH_SEMANTIC_CONFIGURATION?.trim();
  const body: Record<string, unknown> = {
    search: query,
    top: 5,
    select: "title,url,content",
    filter: "source eq 'public-website'",
    queryType: semanticConfiguration ? "semantic" : "simple",
  };
  if (semanticConfiguration) {
    body.semanticConfiguration = semanticConfiguration;
    body.captions = "extractive";
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`La recherche Azure AI Search a échoué (${response.status}).`);
  }

  const result = await response.json() as KnowledgeSearchResponse;
  return (result.value ?? []).flatMap((record) => {
    const title = typeof record.title === "string" ? record.title : "";
    const urlValue = typeof record.url === "string" ? record.url : "";
    const content = typeof record.content === "string" ? record.content.slice(0, 5000) : "";
    if (!title || !content) return [];

    let sourceUrl: URL;
    try {
      sourceUrl = new URL(urlValue);
    } catch {
      return [];
    }

    if (
      sourceUrl.protocol !== "https:"
      || !["sphorix.fr", "www.sphorix.fr"].includes(sourceUrl.hostname)
    ) {
      return [];
    }

    return [{ title, url: sourceUrl.toString(), content }];
  });
}

export async function requestFoundryChatCompletion(
  messages: ChatCompletionMessage[],
  options: { signal?: AbortSignal; stream?: boolean; jsonMode?: boolean } = {}
): Promise<Response> {
  const endpoint = validateAzureUrl(
    requiredEnvironmentValue("AZURE_AI_FOUNDRY_CHAT_COMPLETIONS_URL"),
    ["services.ai.azure.com", "openai.azure.com", "inference.ai.azure.com"]
  );
  const apiKey = requiredEnvironmentValue("AZURE_AI_FOUNDRY_API_KEY");
  const model = requiredEnvironmentValue("AZURE_AI_FOUNDRY_MODEL");

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "api-key": apiKey,
      accept: "text/event-stream",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: options.stream ?? true,
      temperature: 0.3,
      max_tokens: options.jsonMode ? 600 : 800,
      ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: options.signal,
    cache: "no-store",
  });
}
