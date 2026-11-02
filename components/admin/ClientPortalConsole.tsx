"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Copy,
  FileUp,
  LoaderCircle,
  Plus,
  Send,
  UserPlus,
} from "lucide-react";

import type { Tables } from "@/types/supabase";

type Subscriber = Pick<Tables<"platform_subscribers">, "id" | "company_name" | "contact_name" | "email" | "phone" | "status" | "user_id">;
type Project = Tables<"client_projects">;
type ProjectStep = Pick<Tables<"client_project_steps">, "id" | "project_id" | "title" | "status" | "sort_order" | "updated_at">;
type ProjectUpdate = Pick<Tables<"client_project_updates">, "id" | "project_id" | "author_role" | "body" | "created_at">;
type PortalDocument = Pick<Tables<"client_portal_documents">, "id" | "subscriber_id" | "project_id" | "category" | "title" | "original_name" | "file_size" | "created_at">;
type Subscription = Pick<Tables<"platform_subscriptions">, "id" | "subscriber_id" | "product_code" | "plan_name" | "status" | "billing_interval" | "starts_at" | "current_period_end">;
type Product = Pick<Tables<"platform_products">, "code" | "name">;
type Invitation = Pick<Tables<"client_invitations">, "id" | "subscriber_id" | "expires_at" | "accepted_at" | "created_at"> & { isActive: boolean };
type PortalData = {
  subscribers: Subscriber[];
  projects: Project[];
  steps: ProjectStep[];
  updates: ProjectUpdate[];
  subscriptions: Subscription[];
  products: Product[];
  documents: PortalDocument[];
  invitations: Invitation[];
};

const statusLabels: Record<Project["status"], string> = {
  not_started: "À démarrer",
  in_progress: "En cours",
  waiting_client: "En attente de votre retour",
  completed: "Terminé",
  on_hold: "En pause",
};

const documentLabels: Record<PortalDocument["category"], string> = {
  document: "Document",
  deliverable: "Livrable",
  quote: "Devis",
  invoice: "Facture",
};

const subscriptionLabels: Record<Subscription["status"], string> = {
  pending: "À confirmer",
  trialing: "Essai",
  active: "Actif",
  past_due: "Paiement en retard",
  suspended: "Suspendu",
  cancelled: "Résilié",
  expired: "Expiré",
};
const stepStatusLabels: Record<ProjectStep["status"], string> = {
  pending: "À faire",
  in_progress: "En cours",
  completed: "Terminée",
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error ?? "La demande a échoué.");
  return result;
}

function dateLabel(date: string | null) {
  if (!date) return "Sans échéance";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(date));
}

function statusStyle(status: string) {
  if (["completed", "active", "trialing"].includes(status)) return "bg-emerald-50 text-emerald-800";
  if (["in_progress", "waiting_client", "pending", "past_due"].includes(status)) return "bg-amber-50 text-amber-800";
  if (["on_hold", "suspended", "cancelled", "expired"].includes(status)) return "bg-rose-50 text-rose-800";
  return "bg-slate-100 text-slate-700";
}

export default function ClientPortalConsole() {
  const [data, setData] = useState<PortalData>({
    subscribers: [], projects: [], steps: [], updates: [], subscriptions: [], products: [], documents: [], invitations: [],
  });
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showNewClient, setShowNewClient] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [editingProjectId, setEditingProjectId] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState<Project["status"]>("not_started");
  const [projectDueAt, setProjectDueAt] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [newStepDrafts, setNewStepDrafts] = useState<Record<string, string>>({});
  const [stepEdits, setStepEdits] = useState<Record<string, { title: string; status: ProjectStep["status"] }>>({});

  const refresh = useCallback(async (preferredId?: string) => {
    try {
      const next = await requestJson<PortalData>("/api/admin/client-portal", { cache: "no-store" });
      setData(next);
      setSelectedId((current) => preferredId ?? (next.subscribers.some((item) => item.id === current) ? current : next.subscribers[0]?.id ?? ""));
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Le portail client n’a pas pu être chargé.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    requestJson<PortalData>("/api/admin/client-portal", { cache: "no-store" })
      .then((next) => {
        if (!active) return;
        setData(next);
        setSelectedId((current) => next.subscribers.some((item) => item.id === current) ? current : next.subscribers[0]?.id ?? "");
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Le portail client n’a pas pu être chargé.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const selectedClient = useMemo(
    () => data.subscribers.find((subscriber) => subscriber.id === selectedId) ?? null,
    [data.subscribers, selectedId],
  );
  const projects = data.projects.filter((project) => project.subscriber_id === selectedId);
  const documents = data.documents.filter((document) => document.subscriber_id === selectedId);
  const subscriptions = data.subscriptions.filter((subscription) => subscription.subscriber_id === selectedId);
  const currentInvitation = data.invitations.find((invitation) => invitation.subscriber_id === selectedId);
  const hasActiveInvitation = currentInvitation?.isActive ?? false;

  const createClient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const form = new FormData(event.currentTarget);
      const result = await requestJson<{ subscriber: Subscriber }>("/api/admin/client-portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "subscriber",
          companyName: form.get("companyName"),
          contactName: form.get("contactName"),
          email: form.get("email"),
          phone: form.get("phone"),
        }),
      });
      setShowNewClient(false);
      formElement.reset();
      await refresh(result.subscriber.id);
      setNotice("Fiche client créée. Vous pouvez maintenant créer son lien d’invitation.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "La fiche client n’a pas pu être créée.");
    } finally {
      setSaving(false);
    }
  };

  const generateInvitation = async () => {
    if (!selectedClient) return;
    setSaving(true);
    setError("");
    setNotice("");
    setInviteUrl("");
    try {
      const result = await requestJson<{ invitationUrl: string }>("/api/admin/client-invitations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscriberId: selectedClient.id }),
      });
      setInviteUrl(result.invitationUrl);
      try {
        await navigator.clipboard.writeText(result.invitationUrl);
        setNotice("Lien généré et copié. Il est valable 7 jours.");
      } catch {
        setNotice("Lien généré. Copiez-le depuis le champ affiché ci-dessous ; il est valable 7 jours.");
      }
      await refresh(selectedClient.id);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Le lien d’invitation n’a pas pu être généré.");
    } finally {
      setSaving(false);
    }
  };

  const saveProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedClient) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await requestJson("/api/admin/client-portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "project",
          subscriberId: selectedClient.id,
          projectId: editingProjectId || undefined,
          title: projectTitle,
          description: projectDescription,
          status: projectStatus,
          dueAt: projectDueAt || null,
        }),
      });
      setEditingProjectId("");
      setProjectTitle("");
      setProjectDescription("");
      setProjectStatus("not_started");
      setProjectDueAt("");
      setNotice("Dossier enregistré.");
      await refresh(selectedClient.id);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Le dossier n’a pas pu être enregistré.");
    } finally {
      setSaving(false);
    }
  };

  const editProject = (project: Project) => {
    setEditingProjectId(project.id);
    setProjectTitle(project.title);
    setProjectDescription(project.description);
    setProjectStatus(project.status);
    setProjectDueAt(project.due_at ?? "");
  };

  const sendComment = async (event: FormEvent<HTMLFormElement>, projectId: string) => {
    event.preventDefault();
    const body = commentDrafts[projectId]?.trim() ?? "";
    if (!body) return;
    setSaving(true);
    setError("");
    try {
      await requestJson("/api/admin/client-portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "comment", projectId, body }),
      });
      setCommentDrafts((current) => ({ ...current, [projectId]: "" }));
      setNotice("Message ajouté au dossier client.");
      await refresh(selectedId);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Le message n’a pas pu être envoyé.");
    } finally {
      setSaving(false);
    }
  };

  const saveStep = async (event: FormEvent<HTMLFormElement>, projectId: string, stepId?: string) => {
    event.preventDefault();
    const step = stepId ? stepEdits[stepId] : null;
    const title = stepId ? step?.title : newStepDrafts[projectId];
    if (!title?.trim()) return;
    setSaving(true);
    setError("");
    try {
      await requestJson("/api/admin/client-portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "step",
          projectId,
          stepId,
          title: title.trim(),
          status: step?.status ?? "pending",
        }),
      });
      if (!stepId) setNewStepDrafts((current) => ({ ...current, [projectId]: "" }));
      setNotice("Étape enregistrée.");
      await refresh(selectedId);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "L’étape n’a pas pu être enregistrée.");
    } finally {
      setSaving(false);
    }
  };

  const uploadDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedClient) return;
    const formElement = event.currentTarget;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const form = new FormData(event.currentTarget);
      form.set("subscriberId", selectedClient.id);
      const response = await fetch("/api/admin/client-portal/documents", { method: "POST", body: form });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Le document n’a pas pu être ajouté.");
      formElement.reset();
      setNotice("Document ajouté à l’espace client.");
      await refresh(selectedClient.id);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Le document n’a pas pu être ajouté.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6f7] text-slate-900">
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#168a79]">Sphorix / Administration</p>
          <h1 className="text-lg font-bold text-[#14213d]">Suivi des clients</h1>
        </div>
        <Link href="/administration" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" /> Administration
        </Link>
      </header>

      <div className="mx-auto max-w-[1440px] space-y-5 p-4 sm:p-8">
        {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><span>{error}</span><button type="button" onClick={() => void refresh()} className="shrink-0 font-bold underline">Réessayer</button></div>}
        {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" />Chargement des dossiers clients…</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-bold text-[#14213d]">Clients</h2>
                  <button type="button" onClick={() => setShowNewClient((visible) => !visible)} className="inline-flex items-center gap-1 rounded-lg bg-[#14213d] px-3 py-2 text-xs font-semibold text-white">
                    <UserPlus className="h-3.5 w-3.5" /> Nouveau
                  </button>
                </div>
                {showNewClient && (
                  <form onSubmit={createClient} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    <label className="block text-xs font-semibold text-slate-600">Entreprise<input required name="companyName" minLength={2} maxLength={160} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <label className="block text-xs font-semibold text-slate-600">Contact<input name="contactName" maxLength={160} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <label className="block text-xs font-semibold text-slate-600">Email d’invitation<input required type="email" name="email" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <label className="block text-xs font-semibold text-slate-600">Téléphone<input name="phone" maxLength={40} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <button disabled={saving} className="w-full rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Création…" : "Créer le client"}</button>
                  </form>
                )}
                <div className="mt-3 max-h-[60vh] space-y-1 overflow-y-auto">
                  {data.subscribers.map((subscriber) => (
                    <button key={subscriber.id} type="button" onClick={() => { setSelectedId(subscriber.id); setInviteUrl(""); setNotice(""); setError(""); setEditingProjectId(""); setProjectTitle(""); setProjectDescription(""); setProjectStatus("not_started"); setProjectDueAt(""); }} className={`w-full rounded-xl px-3 py-3 text-left transition ${selectedId === subscriber.id ? "bg-[#14213d] text-white" : "hover:bg-slate-50"}`}>
                      <span className="block truncate text-sm font-bold">{subscriber.company_name}</span>
                      <span className={`mt-1 block truncate text-xs ${selectedId === subscriber.id ? "text-slate-300" : "text-slate-500"}`}>{subscriber.contact_name || subscriber.email}</span>
                      <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${subscriber.user_id ? "bg-emerald-100 text-emerald-800" : selectedId === subscriber.id ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-600"}`}>
                        {subscriber.user_id ? "Compte activé" : data.invitations.some((invitation) => invitation.subscriber_id === subscriber.id && invitation.isActive) ? "Invitation valide" : "À inviter"}
                      </span>
                    </button>
                  ))}
                  {!data.subscribers.length && <p className="py-6 text-center text-sm text-slate-500">Aucun client enregistré.</p>}
                </div>
              </section>
            </aside>

            {selectedClient ? (
              <section className="min-w-0 space-y-5">
                <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#168a79]">Dossier client</p>
                    <h2 className="mt-1 truncate text-2xl font-bold text-[#14213d]">{selectedClient.company_name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{selectedClient.contact_name} · {selectedClient.email}</p>
                  </div>
                  {!selectedClient.user_id && (
                    <button type="button" onClick={() => void generateInvitation()} disabled={saving} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#14213d] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                      <Copy className="h-4 w-4" />{saving ? "Génération…" : hasActiveInvitation ? "Générer un nouveau lien" : "Générer le lien d’invitation"}
                    </button>
                  )}
                  {selectedClient.user_id && <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">Espace activé</span>}
                </div>

                {inviteUrl && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <label htmlFor="invite-url" className="block text-sm font-semibold text-emerald-900">Lien personnel — valable 7 jours</label>
                  <div className="mt-2 flex gap-2">
                    <input id="invite-url" readOnly value={inviteUrl} onFocus={(event) => event.currentTarget.select()} className="min-w-0 flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-slate-700" />
                    <button type="button" onClick={() => void navigator.clipboard.writeText(inviteUrl).then(() => setNotice("Lien copié."), () => setError("Copie impossible. Sélectionnez le lien pour le copier manuellement."))} aria-label="Copier le lien" className="rounded-lg border border-emerald-300 bg-white px-3 text-emerald-800"><Copy className="h-4 w-4" /></button>
                  </div>
                </div>}

                <div className="grid gap-5 xl:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-[#14213d]">Logiciels et abonnements</h3>
                    <div className="mt-4 space-y-3">
                      {subscriptions.map((subscription) => (
                        <div key={subscription.id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3">
                          <div><p className="font-semibold">{data.products.find((product) => product.code === subscription.product_code)?.name ?? subscription.product_code}</p><p className="mt-1 text-xs text-slate-500">{subscription.plan_name} · {dateLabel(subscription.current_period_end)}</p></div>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${statusStyle(subscription.status)}`}>{subscriptionLabels[subscription.status]}</span>
                        </div>
                      ))}
                      {!subscriptions.length && <p className="text-sm text-slate-500">Aucun logiciel ou abonnement associé.</p>}
                    </div>
                    <Link href="/administration" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">Gérer les logiciels et abonnements →</Link>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-[#14213d]">{editingProjectId ? "Modifier un dossier" : "Créer un dossier de travaux"}</h3>
                    <form onSubmit={saveProject} className="mt-4 space-y-3">
                      <label className="block text-xs font-semibold text-slate-600">Nom du projet<input required minLength={2} maxLength={160} value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                      <label className="block text-xs font-semibold text-slate-600">Description<textarea maxLength={5000} rows={3} value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-xs font-semibold text-slate-600">Avancement<select value={projectStatus} onChange={(event) => setProjectStatus(event.target.value as Project["status"])} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                        <label className="block text-xs font-semibold text-slate-600">Échéance<input type="date" value={projectDueAt} onChange={(event) => setProjectDueAt(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                      </div>
                      <div className="flex gap-2">
                        <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#14213d] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" />{saving ? "Enregistrement…" : editingProjectId ? "Enregistrer" : "Créer le dossier"}</button>
                        {editingProjectId && <button type="button" onClick={() => { setEditingProjectId(""); setProjectTitle(""); setProjectDescription(""); setProjectStatus("not_started"); setProjectDueAt(""); }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Annuler</button>}
                      </div>
                    </form>
                  </section>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><h3 className="text-lg font-bold text-[#14213d]">Travaux et échanges</h3><p className="mt-1 text-sm text-slate-500">Les changements d’avancement et messages sont visibles par le client.</p></div>
                  </div>
                  <div className="mt-4 space-y-4">
                    {projects.map((project) => (
                      <article key={project.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div><h4 className="font-bold text-slate-900">{project.title}</h4><p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{project.description || "Aucune description."}</p><p className="mt-2 text-xs text-slate-500">Échéance : {dateLabel(project.due_at)}</p></div>
                          <div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(project.status)}`}>{statusLabels[project.status]}</span><button type="button" onClick={() => editProject(project)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Modifier</button></div>
                        </div>
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Étapes</p>
                          <div className="space-y-2">
                            {data.steps.filter((step) => step.project_id === project.id).map((step) => {
                              const edit = stepEdits[step.id] ?? { title: step.title, status: step.status };
                              return (
                                <form key={step.id} onSubmit={(event) => void saveStep(event, project.id, step.id)} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px_auto]">
                                  <input aria-label="Nom de l’étape" value={edit.title} onChange={(event) => setStepEdits((current) => ({ ...current, [step.id]: { ...edit, title: event.target.value } }))} maxLength={160} className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                                  <select aria-label="Avancement de l’étape" value={edit.status} onChange={(event) => setStepEdits((current) => ({ ...current, [step.id]: { ...edit, status: event.target.value as ProjectStep["status"] } }))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">{Object.entries(stepStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                                  <button disabled={saving} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50">Enregistrer</button>
                                </form>
                              );
                            })}
                            <form onSubmit={(event) => void saveStep(event, project.id)} className="flex gap-2">
                              <input value={newStepDrafts[project.id] ?? ""} onChange={(event) => setNewStepDrafts((current) => ({ ...current, [project.id]: event.target.value }))} maxLength={160} placeholder="Ajouter une étape…" className="min-w-0 flex-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm" />
                              <button type="submit" disabled={saving || !newStepDrafts[project.id]?.trim()} className="rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-700 disabled:opacity-40">Ajouter</button>
                            </form>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                          {data.updates.filter((update) => update.project_id === project.id).map((update) => (
                            <p key={update.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm"><span className="font-semibold">{update.author_role === "admin" ? "Sphorix" : "Client"} · </span>{update.body}<span className="ml-2 text-xs text-slate-400">{dateLabel(update.created_at)}</span></p>
                          ))}
                          <form onSubmit={(event) => void sendComment(event, project.id)} className="flex gap-2">
                            <input value={commentDrafts[project.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [project.id]: event.target.value }))} maxLength={5000} placeholder="Écrire un message au client…" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                            <button type="submit" disabled={saving || !commentDrafts[project.id]?.trim()} aria-label="Envoyer le message" className="rounded-lg bg-emerald-700 px-3 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
                          </form>
                        </div>
                      </article>
                    ))}
                    {!projects.length && <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Aucun travail suivi. Créez un dossier ci-dessus pour commencer.</p>}
                  </div>
                </section>

                <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-[#14213d]">Ajouter un document</h3>
                    <p className="mt-1 text-xs text-slate-500">PDF, Office, ZIP, PNG ou JPEG · 4 Mo maximum.</p>
                    <form onSubmit={uploadDocument} className="mt-4 space-y-3">
                      <label className="block text-xs font-semibold text-slate-600">Titre<input required name="title" maxLength={160} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-xs font-semibold text-slate-600">Type<select name="category" defaultValue="document" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal">{Object.entries(documentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                        <label className="block text-xs font-semibold text-slate-600">Dossier<select name="projectId" defaultValue="" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal"><option value="">Général</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label>
                      </div>
                      <label className="block text-xs font-semibold text-slate-600">Fichier<input required name="file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.jpeg,.png" className="mt-1 block w-full text-sm font-normal" /></label>
                      <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#14213d] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><FileUp className="h-4 w-4" />{saving ? "Envoi…" : "Ajouter le document"}</button>
                    </form>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-[#14213d]">Devis, factures et livrables</h3>
                    <p className="mt-1 text-xs text-slate-500">Les documents sont privés et accessibles uniquement au client associé.</p>
                    <div className="mt-4 space-y-2">
                      {documents.map((document) => (
                        <div key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                          <div className="min-w-0"><p className="truncate text-sm font-semibold">{document.title}</p><p className="mt-1 text-xs text-slate-500">{documentLabels[document.category]} · {document.original_name} · {Math.ceil(document.file_size / 1024)} Ko</p></div>
                          <a href={`/api/admin/client-portal/documents/${document.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">Télécharger</a>
                        </div>
                      ))}
                      {!documents.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Aucun document partagé.</p>}
                    </div>
                  </div>
                </section>
              </section>
            ) : (
              <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                <p>{data.subscribers.length ? "Sélectionnez un client." : "Créez une fiche client pour commencer."}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
