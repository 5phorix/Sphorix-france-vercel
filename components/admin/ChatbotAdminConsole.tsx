"use client";

import Link from "next/link";
import { ArrowLeft, Bot, LoaderCircle, MessageSquareText, Save, Search, Trash2, Users } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

type Settings = {
  enabled: boolean;
  assistant_name: string;
  greeting: string;
  personality: string;
  suggested_questions: string[];
  knowledge_synced_at: string | null;
  indexed_page_count: number;
  updated_at: string;
};
type Statistics = {
  total_conversations: number;
  unique_visitors: number;
  conversations_last_30_days: number;
  quote_requests: number;
  appointment_requests: number;
  callback_requests: number;
  unresolved_questions: number;
  completed_conversations: number;
  resolution_rate: number;
  category_counts: Record<string, number>;
  service_counts: Record<string, number>;
};
type Conversation = {
  id: string;
  status: string;
  category: string | null;
  primary_need: string | null;
  interested_services: string[];
  summary: string | null;
  lead_request_type: string | null;
  lead_details?: Record<string, string>;
  unresolved_question: boolean;
  created_at: string;
  updated_at: string;
};
type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: Array<{ title: string; url: string }>;
  created_at: string;
};
type AdminData = {
  settings: Settings;
  stats: Statistics;
  conversations: Conversation[];
  hasMore: boolean;
  configured: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <Icon className="h-5 w-5 text-[#168a79]" />
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-[#14213d]">{value.toLocaleString("fr-FR")}</p>
    </article>
  );
}

export default function ChatbotAdminConsole() {
  const [data, setData] = useState<AdminData | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<ConversationMessage[]>([]);
  const [search, setSearch] = useState("");
  const [conversationFilter, setConversationFilter] = useState("all");
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingKnowledge, setSyncingKnowledge] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/chatbot", { cache: "no-store" });
      const result = await response.json() as AdminData & { error?: string };
      if (!response.ok) throw new Error(result.error || "Le tableau de bord n’a pas pu être chargé.");
      setData(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Le tableau de bord n’a pas pu être chargé.");
    } finally {
      setLoading(false);
    }
  };

  const searchConversations = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      const params = new URLSearchParams({ search, filter: conversationFilter, offset: "0" });
      const response = await fetch(`/api/admin/chatbot?${params.toString()}`, {
        cache: "no-store",
      });
      const result = await response.json() as AdminData & { error?: string };
      if (!response.ok) throw new Error(result.error || "La recherche a échoué.");
      setData(result);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "La recherche a échoué.");
    }
  };

  const loadMoreConversations = async () => {
    if (!data || loadingMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const params = new URLSearchParams({
        search,
        filter: conversationFilter,
        offset: String(data.conversations.length),
      });
      const response = await fetch(`/api/admin/chatbot?${params.toString()}`, { cache: "no-store" });
      const result = await response.json() as AdminData & { error?: string };
      if (!response.ok) throw new Error(result.error || "Les conversations suivantes n’ont pas pu être chargées.");
      setData({
        ...data,
        conversations: [...data.conversations, ...result.conversations],
        hasMore: result.hasMore,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Les conversations suivantes n’ont pas pu être chargées.");
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetch("/api/admin/chatbot", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as AdminData & { error?: string };
        if (!response.ok) throw new Error(result.error || "Le tableau de bord n’a pas pu être chargé.");
        return result;
      })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Le tableau de bord n’a pas pu être chargé.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredConversations = data?.conversations ?? [];

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const questions = String(form.get("suggested_questions") ?? "")
      .split("\n")
      .map((question) => question.trim())
      .filter(Boolean);
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/chatbot", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          enabled: form.get("enabled") === "on",
          assistantName: form.get("assistant_name"),
          greeting: form.get("greeting"),
          personality: form.get("personality"),
          suggestedQuestions: questions,
        }),
      });
      const result = await response.json() as { settings?: Settings; configured?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || "La configuration n’a pas pu être enregistrée.");
      if (!data || !result.settings) throw new Error("La configuration enregistrée n’a pas été renvoyée.");
      setData({ ...data, settings: result.settings, configured: Boolean(result.configured) });
      setNotice("Configuration enregistrée.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "La configuration n’a pas pu être enregistrée.");
    } finally {
      setSaving(false);
    }
  };

  const openConversation = async (conversation: Conversation) => {
    setError("");
    try {
      const response = await fetch(`/api/admin/chatbot?conversationId=${encodeURIComponent(conversation.id)}`, {
        cache: "no-store",
      });
      const result = await response.json() as {
        conversation?: Conversation;
        messages?: ConversationMessage[];
        error?: string;
      };
      if (!response.ok || !result.conversation) {
        throw new Error(result.error || "La conversation n’a pas pu être chargée.");
      }
      setSelectedConversation(result.conversation);
      setSelectedMessages(result.messages ?? []);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "La conversation n’a pas pu être chargée.");
    }
  };

  const deleteConversation = async (conversation: Conversation) => {
    if (!window.confirm("Supprimer définitivement cette conversation et ses messages ?")) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/chatbot?conversationId=${encodeURIComponent(conversation.id)}`, {
        method: "DELETE",
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "La suppression a échoué.");
      if (selectedConversation?.id === conversation.id) {
        setSelectedConversation(null);
        setSelectedMessages([]);
      }
      setNotice("Conversation supprimée.");
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "La suppression a échoué.");
    }
  };

  const syncKnowledge = async () => {
    setSyncingKnowledge(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/chatbot", { method: "POST" });
      const result = await response.json() as {
        indexedPages?: number;
        removedPages?: number;
        configured?: boolean;
        knowledgeSyncedAt?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || "La synchronisation a échoué.");
      setData((current) => current ? {
        ...current,
        configured: Boolean(result.configured),
        settings: {
          ...current.settings,
          indexed_page_count: result.indexedPages ?? current.settings.indexed_page_count,
          knowledge_synced_at: result.knowledgeSyncedAt ?? current.settings.knowledge_synced_at,
        },
      } : current);
      setNotice(`${result.indexedPages ?? 0} page(s) actualisée(s), ${result.removedPages ?? 0} retirée(s) de l’index.`);
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "La synchronisation a échoué.");
    } finally {
      setSyncingKnowledge(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef3f3] text-sm text-slate-600">
        <span className="inline-flex items-center gap-2"><LoaderCircle className="h-5 w-5 animate-spin" />Chargement de l’espace chatbot…</span>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#eef3f3] p-6 text-slate-900">
        <section className="mx-auto max-w-3xl rounded-xl border border-rose-200 bg-white p-6">
          <p role="alert" className="text-sm text-rose-800">{error || "Données indisponibles."}</p>
          <button type="button" onClick={() => void loadData()} className="mt-4 rounded-lg bg-[#14213d] px-4 py-2 text-sm font-semibold text-white">Réessayer</button>
        </section>
      </main>
    );
  }

  const { settings, stats, configured } = data;

  return (
    <main className="min-h-screen bg-[#eef3f3] p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#14213d] text-white"><Bot className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#168a79]">Sphorix / Administration</p>
              <h1 className="text-2xl font-bold tracking-tight text-[#14213d]">Assistant conversationnel</h1>
            </div>
          </div>
          <Link href="/administration" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> Retour à l’administration
          </Link>
        </header>

        {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
        {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
        {!configured && (
          <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
            <h2 className="font-bold">Configuration Azure requise avant activation</h2>
            <p className="mt-1">
              Vérifiez les points de terminaison et clés côté serveur sur Vercel :
              AZURE_AI_FOUNDRY_CHAT_COMPLETIONS_URL, AZURE_AI_FOUNDRY_API_KEY,
              AZURE_AI_FOUNDRY_MODEL, AZURE_AI_SEARCH_ENDPOINT, AZURE_AI_SEARCH_API_KEY
              et AZURE_AI_SEARCH_INDEX. Actualisez ensuite les pages publiques avec le bouton
              ci-dessous. Ne partagez jamais ces clés dans le navigateur ou dans le chat.
            </p>
          </section>
        )}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Conversations" value={stats.total_conversations} icon={MessageSquareText} />
          <Metric label="Visiteurs distincts" value={stats.unique_visitors} icon={Users} />
          <Metric label="30 derniers jours" value={stats.conversations_last_30_days} icon={Search} />
          <Metric label="Questions sans réponse" value={stats.unresolved_questions} icon={Bot} />
          <Metric label="Demandes de devis" value={stats.quote_requests} icon={MessageSquareText} />
          <Metric label="Demandes de rendez-vous" value={stats.appointment_requests} icon={MessageSquareText} />
          <Metric label="Demandes de rappel" value={stats.callback_requests} icon={MessageSquareText} />
          <Metric label="Conversations terminées" value={stats.completed_conversations} icon={MessageSquareText} />
          <Metric label="Taux de résolution estimé (%)" value={stats.resolution_rate} icon={Bot} />
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-[#14213d]">Demandes par catégorie</h2>
            <Breakdown values={stats.category_counts} emptyLabel="Aucune catégorie n’a encore été synthétisée." />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-[#14213d]">Services les plus recherchés</h2>
            <Breakdown values={stats.service_counts} emptyLabel="Aucun service n’a encore été identifié." />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#14213d]">Configuration de l’assistant</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sources au lancement : pages publiques de sphorixfrance.fr. {settings.indexed_page_count} page(s) indexée(s)
              {settings.knowledge_synced_at ? ` · dernière actualisation ${formatDate(settings.knowledge_synced_at)}` : " · aucune synchronisation effectuée"}.
            </p>
          </div>
          <form onSubmit={saveSettings} className="grid gap-4 lg:grid-cols-2">
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold">
              <input type="checkbox" name="enabled" defaultChecked={settings.enabled} className="h-4 w-4 accent-[#168a79]" />
              Activer le chatbot sur le site
            </label>
            <p className="self-center text-sm text-slate-500">État effectif : {settings.enabled && configured ? "actif" : "inactif"}</p>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Nom affiché
              <input name="assistant_name" defaultValue={settings.assistant_name} maxLength={60} required className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#168a79]" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Message d’accueil
              <input name="greeting" defaultValue={settings.greeting} maxLength={500} required className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#168a79]" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700 lg:col-span-2">
              Ton et comportement
              <textarea name="personality" defaultValue={settings.personality} maxLength={1000} rows={3} required className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#168a79]" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700 lg:col-span-2">
              Questions suggérées (une par ligne, 8 maximum)
              <textarea name="suggested_questions" defaultValue={settings.suggested_questions.join("\n")} rows={4} className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#168a79]" />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3 lg:col-span-2">
              <p className="text-xs text-slate-500">Aucune intégration WhatsApp ni import de document n’est activé.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void syncKnowledge()} disabled={syncingKnowledge} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                  {syncingKnowledge ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Actualiser les pages
                </button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#14213d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#20395f] disabled:opacity-50">
                  {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)]">
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#14213d]">Conversations récentes</h2>
                <p className="text-sm text-slate-500">Les conversations sont supprimées automatiquement après 24 mois.</p>
              </div>
              <form onSubmit={searchConversations} className="flex flex-wrap gap-2">
                <label className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher…" aria-label="Rechercher une conversation" className="h-10 w-48 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#168a79]" />
                </label>
                <select
                  aria-label="Filtrer les conversations"
                  value={conversationFilter}
                  onChange={(event) => setConversationFilter(event.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-sm outline-none focus:border-[#168a79]"
                >
                  <option value="all">Toutes</option>
                  <option value="active">En cours</option>
                  <option value="completed">Terminées</option>
                  <option value="unresolved">À traiter</option>
                  <option value="leads">Demandes de suivi</option>
                </select>
                <button type="submit" className="rounded-lg bg-[#14213d] px-3 py-2 text-sm font-semibold text-white hover:bg-[#20395f]">Rechercher</button>
              </form>
            </div>
            <div className="max-h-[620px] space-y-2 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <article key={conversation.id} className="flex items-start gap-2 rounded-lg border border-slate-200 p-3">
                  <button type="button" onClick={() => void openConversation(conversation)} className="min-w-0 flex-1 text-left hover:text-[#117365]">
                    <p className="truncate text-sm font-semibold">{conversation.primary_need || conversation.summary || "Conversation sans résumé"}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(conversation.created_at)} · {conversation.category || "Catégorie à préciser"}</p>
                    {conversation.interested_services.length > 0 && <p className="mt-1 truncate text-xs text-slate-600">{conversation.interested_services.join(" · ")}</p>}
                    {conversation.lead_request_type && <p className="mt-1 text-xs font-semibold text-[#b94d2d]">Demande : {conversation.lead_request_type}</p>}
                  </button>
                  <button type="button" onClick={() => void deleteConversation(conversation)} aria-label="Supprimer la conversation" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              ))}
              {filteredConversations.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Aucune conversation trouvée.</p>}
              {data.hasMore && <button type="button" onClick={() => void loadMoreConversations()} disabled={loadingMore} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{loadingMore ? "Chargement…" : "Charger les suivantes"}</button>}
            </div>
          </div>

          <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-[#14213d]">Compte rendu et échanges</h2>
            {!selectedConversation ? (
              <p className="py-10 text-center text-sm text-slate-500">Sélectionnez une conversation pour afficher son compte rendu.</p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-semibold">{selectedConversation.primary_need || "Besoin non identifié"}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(selectedConversation.created_at)}</p>
                  {selectedConversation.summary && <p className="mt-3 leading-relaxed text-slate-700">{selectedConversation.summary}</p>}
                  {selectedConversation.lead_details && Object.entries(selectedConversation.lead_details).length > 0 && (
                    <dl className="mt-3 space-y-1 border-t border-slate-200 pt-2 text-xs">
                      {Object.entries(selectedConversation.lead_details).map(([key, value]) => <div key={key} className="flex gap-2"><dt className="font-semibold">{key} :</dt><dd>{value}</dd></div>)}
                    </dl>
                  )}
                  {selectedConversation.unresolved_question && <p className="mt-2 font-semibold text-amber-800">Question à traiter par un interlocuteur</p>}
                </div>
                <div className="max-h-[480px] space-y-3 overflow-y-auto">
                  {selectedMessages.map((message) => (
                    <article key={message.id} className={`rounded-lg p-3 text-sm leading-relaxed ${message.role === "user" ? "bg-[#14213d] text-white" : "border border-slate-200 bg-white text-slate-800"}`}>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide opacity-70">{message.role === "user" ? "Visiteur" : "Assistant"} · {formatDate(message.created_at)}</p>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Breakdown({ values, emptyLabel }: { values: Record<string, number>; emptyLabel: string }) {
  const entries = Object.entries(values ?? {}).sort((left, right) => right[1] - left[1]).slice(0, 8);
  if (!entries.length) return <p className="mt-2 text-sm text-slate-500">{emptyLabel}</p>;
  return (
    <ul className="mt-3 space-y-2">
      {entries.map(([label, count]) => (
        <li key={label} className="flex items-center justify-between gap-3 text-sm">
          <span className="truncate text-slate-700">{label}</span>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{count}</span>
        </li>
      ))}
    </ul>
  );
}
