"use client";

import Link from "next/link";
import { ExternalLink, LoaderCircle, MessageCircle, Minimize2, Send, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

type ChatSource = { title: string; url: string };
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
};
type ChatSettings = {
  assistantName: string;
  greeting: string;
  suggestedQuestions: string[];
};
type ChatEvent = {
  type: "conversation" | "token" | "sources" | "complete" | "error";
  conversationId?: string;
  content?: string;
  sources?: ChatSource[];
  message?: string;
};

const CONVERSATION_STORAGE_KEY = "sphorix-chat-conversation";

export default function ChatWidget() {
  const [availability, setAvailability] = useState<"loading" | "enabled" | "disabled" | "error">("loading");
  const [settings, setSettings] = useState<ChatSettings | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const assistantContentRef = useRef("");

  const loadConversation = useCallback(async (id: string, greeting: string) => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/chat?conversationId=${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      if (response.status === 404) {
        localStorage.removeItem(CONVERSATION_STORAGE_KEY);
        setConversationId(null);
        setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
        return;
      }
      if (!response.ok) throw new Error("Impossible de reprendre cette conversation.");
      const data = await response.json() as { messages?: Array<{
        id: string;
        role: "user" | "assistant";
        content: string;
        sources: ChatSource[];
      }>; status?: string };
      setConversationId(id);
      setIsCompleted(data.status === "completed");
      setMessages([
        { id: "greeting", role: "assistant", content: greeting },
        ...(data.messages ?? []).map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          sources: message.sources ?? [],
        })),
      ]);
    } catch (error) {
      console.error("Échec du chargement de la conversation :", error);
      setErrorMessage("La conversation précédente n’a pas pu être chargée.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/chat", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Le statut du chatbot n’a pas pu être vérifié.");
        return response.json() as Promise<{
          enabled: boolean;
          assistantName: string;
          greeting: string;
          suggestedQuestions: string[];
        }>;
      })
      .then((data) => {
        if (!active) return;
        if (!data.enabled) {
          setAvailability("disabled");
          return;
        }
        setSettings({
          assistantName: data.assistantName,
          greeting: data.greeting,
          suggestedQuestions: data.suggestedQuestions,
        });
        setAvailability("enabled");
        const savedConversationId = localStorage.getItem(CONVERSATION_STORAGE_KEY);
        if (savedConversationId) {
          void loadConversation(savedConversationId, data.greeting);
        } else {
          setIsCompleted(false);
          setMessages([{ id: "greeting", role: "assistant", content: data.greeting }]);
        }
      })
      .catch((error: unknown) => {
        console.error("Échec de la vérification du chatbot :", error);
        if (active) setAvailability("error");
      });
    return () => {
      active = false;
    };
  }, [loadConversation]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
      textareaRef.current?.focus();
    }
  }, [isOpen, isMinimized, messages, isSending]);

  const sendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || isSending || message.length > 2000) return;

    setErrorMessage("");
    setDraft("");
    setIsSending(true);
    assistantContentRef.current = "";
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      sources: [],
    };
    setMessages((current) => [...current, userMessage, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, conversationId }),
      });
      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || "Le message n’a pas pu être envoyé.");
      }
      if (!response.body) throw new Error("Le flux de réponse est indisponible.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamError = "";
      const processEvent = (event: string) => {
        for (const line of event.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const value = line.slice(5).trim();
          if (!value) continue;
          const item = JSON.parse(value) as ChatEvent;
          if (item.type === "conversation" && item.conversationId) {
            setConversationId(item.conversationId);
            localStorage.setItem(CONVERSATION_STORAGE_KEY, item.conversationId);
          } else if (item.type === "token" && item.content) {
            assistantContentRef.current += item.content;
            setMessages((current) => current.map((entry) =>
              entry.id === assistantMessage.id ? { ...entry, content: `${entry.content}${item.content}` } : entry
            ));
          } else if (item.type === "sources" && item.sources) {
            setMessages((current) => current.map((entry) =>
              entry.id === assistantMessage.id ? { ...entry, sources: item.sources } : entry
            ));
          } else if (item.type === "error") {
            streamError = item.message || "La réponse a été interrompue.";
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
        let separator = buffer.indexOf("\n\n");
        while (separator !== -1) {
          processEvent(buffer.slice(0, separator));
          buffer = buffer.slice(separator + 2);
          separator = buffer.indexOf("\n\n");
        }
      }
      if (buffer.trim()) processEvent(buffer);
      if (streamError) throw new Error(streamError);
      if (!assistantContentRef.current.trim()) throw new Error("L’assistant n’a renvoyé aucune réponse.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Le chatbot n’a pas pu répondre.";
      setErrorMessage(message);
      setMessages((current) => current.filter((entry) => entry.id !== assistantMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(draft);
    }
  };

  const deleteConversation = async () => {
    if (!conversationId || !window.confirm("Supprimer définitivement cette conversation ?")) return;
    setErrorMessage("");
    try {
      const response = await fetch(`/api/chat?conversationId=${encodeURIComponent(conversationId)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || "La suppression a échoué.");
      }
      localStorage.removeItem(CONVERSATION_STORAGE_KEY);
      setConversationId(null);
      setIsCompleted(false);
      setMessages([{ id: "greeting", role: "assistant", content: settings?.greeting ?? "" }]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "La suppression a échoué.");
    }
  };

  const completeConversation = async () => {
    if (!conversationId || isSending) return;
    setErrorMessage("");
    setIsSending(true);
    try {
      const response = await fetch("/api/chat/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "La conversation n’a pas pu être terminée.");
      localStorage.removeItem(CONVERSATION_STORAGE_KEY);
      setIsCompleted(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "La conversation n’a pas pu être terminée.");
    } finally {
      setIsSending(false);
    }
  };

  if (availability === "disabled" || availability === "loading") return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 sm:bottom-20 sm:right-6">
      {isOpen && !isMinimized && (
        <section
          aria-label="Assistant conversationnel Sphorix France"
          className="mb-3 flex h-[min(72vh,620px)] w-[min(calc(100vw-2rem),390px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-[#14213d] px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{settings?.assistantName ?? "Assistant Sphorix"}</p>
              <p className="text-xs text-white/70">Conseils sur les solutions Sphorix France</p>
            </div>
            <div className="ml-3 flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                aria-label="Réduire le chatbot"
                className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Fermer le chatbot"
                className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div
            ref={transcriptRef}
            aria-live="polite"
            className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4"
          >
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
              Vos messages sont traités par Sphorix France et Microsoft Azure, puis conservés au maximum 24 mois.
              Évitez les données sensibles.{" "}
              <Link href="/politique-confidentialite" className="font-semibold underline underline-offset-2">
                Confidentialité
              </Link>
            </p>
            {isLoadingHistory && (
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Reprise de la conversation…
              </p>
            )}
            {messages.map((message) => (
              <article
                key={message.id}
                className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ml-auto rounded-br-sm bg-[#14213d] text-white"
                    : "mr-auto rounded-bl-sm border border-slate-200 bg-white text-slate-800 shadow-sm"
                }`}
              >
                {message.content || (isSending && message.role === "assistant" ? (
                  <span className="inline-flex items-center gap-2 text-slate-500">
                    <LoaderCircle className="h-4 w-4 animate-spin" /> Réflexion…
                  </span>
                ) : null)}
                {!!message.sources?.length && (
                  <ul className="mt-2 space-y-1 border-t border-slate-200 pt-2 text-xs">
                    {message.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#b94d2d] underline underline-offset-2"
                        >
                          {source.title}<ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
            {errorMessage && (
              <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                {errorMessage}
              </p>
            )}
            {!conversationId && messages.length === 1 && !!settings?.suggestedQuestions.length && (
              <div className="flex flex-wrap gap-2 pt-1">
                {settings.suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    disabled={isSending}
                    onClick={() => void sendMessage(question)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-left text-xs font-medium text-slate-700 transition hover:border-[#df6a43] hover:text-[#a83f23] disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <Link href="/demande-devis" className="text-xs font-semibold text-[#b94d2d] underline underline-offset-2">
                  Demander un devis
                </Link>
                <Link href="/contact" className="text-xs font-semibold text-[#b94d2d] underline underline-offset-2">
                  Rendez-vous ou rappel
                </Link>
              </div>
              {conversationId && !isCompleted && (
                <button
                  type="button"
                  onClick={() => void completeConversation()}
                  disabled={isSending}
                  className="text-xs font-semibold text-slate-600 underline underline-offset-2 disabled:opacity-50"
                >
                  Terminer
                </button>
              )}
              {conversationId && (
                <button
                  type="button"
                  onClick={() => void deleteConversation()}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Supprimer
                </button>
              )}
            </div>
            {isCompleted ? (
              <button
                type="button"
                onClick={() => {
                  setConversationId(null);
                  setIsCompleted(false);
                  setMessages([{ id: "greeting", role: "assistant", content: settings?.greeting ?? "" }]);
                }}
                className="w-full rounded-xl bg-[#14213d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#20395f]"
              >
                Démarrer une nouvelle conversation
              </button>
            ) : <form onSubmit={submit} className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleTextareaKeyDown}
                maxLength={2000}
                rows={1}
                disabled={isSending || isLoadingHistory}
                aria-label="Votre message"
                placeholder="Écrivez votre message…"
                className="max-h-28 min-h-10 flex-1 resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#168a79] focus:ring-2 focus:ring-[#168a79]/15 disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isSending || isLoadingHistory}
                aria-label="Envoyer le message"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#168a79] text-white transition hover:bg-[#117365] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>}
          </div>
        </section>
      )}

      {isMinimized && (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="mb-3 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#14213d] shadow-lg ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Réouvrir la conversation
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          if (availability === "error") {
            setIsOpen(true);
            setErrorMessage("L’assistant ne peut pas se connecter pour le moment. Réessayez plus tard.");
          } else {
            setIsOpen((open) => !open);
            setIsMinimized(false);
          }
        }}
        aria-label={availability === "error" ? "Assistant indisponible" : "Ouvrir l’assistant Sphorix"}
        className="ml-auto grid h-14 w-14 place-items-center rounded-full bg-[#168a79] text-white shadow-xl transition hover:scale-105 hover:bg-[#117365] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168a79]"
      >
        {availability === "error" ? <X className="h-6 w-6" /> : isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
