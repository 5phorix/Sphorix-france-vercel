"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FileText, LoaderCircle, Send, Workflow } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  due_at: string | null;
};
type ProjectUpdate = {
  id: string;
  project_id: string;
  author_role: "admin" | "client";
  body: string;
  created_at: string;
};
type ProjectStep = {
  id: string;
  project_id: string;
  title: string;
  status: string;
  sort_order: number;
};
type PortalDocument = {
  id: string;
  project_id: string | null;
  category: string;
  title: string;
  original_name: string;
  file_size: number;
  created_at: string;
};
type Subscription = {
  id: string;
  productName: string;
  plan_name: string;
  status: string;
  billing_interval: string;
  current_period_end: string | null;
};
type ProductAccess = {
  id: string;
  subscription_id: string;
  product_code: string;
  productName: string;
  access_kind: string;
  status: string;
  external_reference: string | null;
  expires_at: string | null;
};
type PortalData = {
  linked: boolean;
  subscriber?: { companyName: string; contactName: string };
  projects?: Project[];
  steps?: ProjectStep[];
  updates?: ProjectUpdate[];
  documents?: PortalDocument[];
  subscriptions?: Subscription[];
  productAccess?: ProductAccess[];
};

const projectStatusLabels: Record<string, string> = {
  not_started: "À démarrer",
  in_progress: "En cours",
  waiting_client: "Votre retour est attendu",
  completed: "Terminé",
  on_hold: "En pause",
};

const documentCategoryLabels: Record<string, string> = {
  document: "Document",
  deliverable: "Livrable",
  quote: "Devis",
  invoice: "Facture",
};
const stepStatusLabels: Record<string, string> = {
  pending: "À faire",
  in_progress: "En cours",
  completed: "Terminée",
};

const subscriptionStatusLabels: Record<string, string> = {
  pending: "À confirmer",
  trialing: "Essai",
  active: "Actif",
  past_due: "Paiement en retard",
  suspended: "Suspendu",
  cancelled: "Résilié",
  expired: "Expiré",
};
const accessStatusLabels: Record<string, string> = {
  pending: "Activation en préparation",
  active: "Accès actif",
  suspended: "Accès suspendu",
  revoked: "Accès révoqué",
  expired: "Accès expiré",
};

function dateLabel(value: string | null) {
  if (!value) return "Sans échéance";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}

function badgeStyle(status: string) {
  if (["completed", "active", "trialing"].includes(status)) return "bg-emerald-50 text-emerald-800";
  if (["in_progress", "waiting_client", "pending", "past_due"].includes(status)) return "bg-amber-50 text-amber-800";
  if (["on_hold", "suspended", "cancelled", "expired"].includes(status)) return "bg-slate-100 text-slate-700";
  return "bg-blue-50 text-blue-800";
}

export default function ClientWorkspace() {
  const [data, setData] = useState<PortalData | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [sendingProject, setSendingProject] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/client/portal", { cache: "no-store" });
      const result = await response.json() as PortalData & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Votre espace client n’a pas pu être chargé.");
      setData(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Votre espace client n’a pas pu être chargé.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/client/portal", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as PortalData & { error?: string };
        if (!response.ok) throw new Error(result.error ?? "Votre espace client n’a pas pu être chargé.");
        if (active) setData(result);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Votre espace client n’a pas pu être chargé.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const sendComment = async (event: FormEvent<HTMLFormElement>, projectId: string) => {
    event.preventDefault();
    const body = drafts[projectId]?.trim() ?? "";
    if (!body) return;
    setSendingProject(projectId);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/client/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId, body }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Le message n’a pas pu être envoyé.");
      setDrafts((current) => ({ ...current, [projectId]: "" }));
      setNotice("Votre message a été transmis à Sphorix.");
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Le message n’a pas pu être envoyé.");
    } finally {
      setSendingProject("");
    }
  };

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-9">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white"><Workflow className="h-5 w-5" /></span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Votre espace de suivi</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Travaux, logiciels et documents</h2>
        </div>
      </div>

      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error} <button type="button" onClick={() => void refresh()} className="ml-1 font-bold underline">Réessayer</button></p>}
      {notice && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      {loading ? (
        <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Chargement de votre espace…</div>
      ) : error ? null : !data?.linked ? (
        <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
          Aucun dossier de suivi n’est encore associé à ce compte. Si Sphorix vous a envoyé une invitation, activez votre espace depuis le lien reçu.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {data.subscriber?.companyName && <p className="text-sm text-slate-500">Espace de <strong className="text-slate-700">{data.subscriber.companyName}</strong></p>}

          <div>
            <h3 className="text-lg font-bold text-slate-950">Vos travaux</h3>
            <div className="mt-3 space-y-4">
              {(data.projects ?? []).map((project) => (
                <article key={project.id} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h4 className="font-bold text-slate-900">{project.title}</h4><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{project.description || "Aucune précision pour le moment."}</p><p className="mt-2 text-xs text-slate-500">Échéance : {dateLabel(project.due_at)}</p></div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle(project.status)}`}>{projectStatusLabels[project.status] ?? project.status}</span>
                  </div>
                  {(data.steps ?? []).some((step) => step.project_id === project.id) && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Étapes du projet</p>
                      <ol className="space-y-2">
                        {(data.steps ?? []).filter((step) => step.project_id === project.id).map((step) => (
                          <li key={step.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                            <span className="text-sm font-medium text-slate-700">{step.title}</span>
                            <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${badgeStyle(step.status)}`}>{stepStatusLabels[step.status] ?? step.status}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    {(data.updates ?? []).filter((update) => update.project_id === project.id).map((update) => (
                      <div key={update.id} className="rounded-xl bg-slate-50 p-3">
                        <p className="whitespace-pre-wrap text-sm text-slate-700">{update.body}</p>
                        <p className="mt-1 text-[11px] font-medium text-slate-400">{update.author_role === "admin" ? "Message de Sphorix" : "Votre message"} · {dateLabel(update.created_at)}</p>
                      </div>
                    ))}
                    <form onSubmit={(event) => void sendComment(event, project.id)} className="flex gap-2 pt-1">
                      <input value={drafts[project.id] ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [project.id]: event.target.value }))} maxLength={5000} placeholder="Poser une question ou envoyer un message…" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
                      <button type="submit" disabled={sendingProject === project.id || !drafts[project.id]?.trim()} aria-label="Envoyer le message" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
                    </form>
                  </div>
                </article>
              ))}
              {!data.projects?.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Aucun travail n’est actuellement en cours de suivi.</p>}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Vos logiciels</h3>
              <div className="mt-3 space-y-2">
                {(data.subscriptions ?? []).map((subscription) => (
                  <div key={subscription.id} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div><p className="text-sm font-bold text-slate-800">{subscription.productName}</p><p className="mt-1 text-xs text-slate-500">{subscription.plan_name} · {dateLabel(subscription.current_period_end)}</p></div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyle(subscription.status)}`}>{subscriptionStatusLabels[subscription.status] ?? subscription.status}</span>
                    </div>
                    {(data.productAccess ?? []).filter((access) => access.subscription_id === subscription.id).map((access) => (
                      <div key={access.id} className="mt-3 border-t border-slate-200 pt-3">
                        <p className="text-xs font-semibold text-slate-700">{accessStatusLabels[access.status] ?? access.status}{access.expires_at ? ` · jusqu’au ${dateLabel(access.expires_at)}` : ""}</p>
                        {access.external_reference && <p className="mt-1 break-all font-mono text-xs text-slate-500">Référence d’accès : {access.external_reference}</p>}
                      </div>
                    ))}
                  </div>
                ))}
                {!data.subscriptions?.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Aucun logiciel ou abonnement associé pour le moment.</p>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-950">Devis, factures et fichiers</h3>
              <div className="mt-3 space-y-2">
                {(data.documents ?? []).map((document) => (
                  <a key={document.id} href={`/api/client/portal/documents/${document.id}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-orange-300 hover:bg-orange-50/40">
                    <FileText className="h-5 w-5 shrink-0 text-orange-600" />
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{document.title}</span><span className="mt-1 block text-xs text-slate-500">{documentCategoryLabels[document.category] ?? "Document"} · {document.original_name} · {Math.ceil(document.file_size / 1024)} Ko</span></span>
                    <span className="text-xs font-bold text-orange-700">Télécharger</span>
                  </a>
                ))}
                {!data.documents?.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Aucun document n’a été partagé.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
