"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileKey2,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Database } from "@/types/supabase";

type Product = Database["public"]["Tables"]["platform_products"]["Row"];
type Plan = Database["public"]["Tables"]["platform_plans"]["Row"];
type Subscriber = Database["public"]["Tables"]["platform_subscribers"]["Row"];
type Subscription = Database["public"]["Tables"]["platform_subscriptions"]["Row"];
type ProductAccess = Database["public"]["Tables"]["platform_product_access"]["Row"];
type AccessSummary = Pick<ProductAccess, "id" | "status" | "access_kind" | "product_code" | "external_tenant_id">;
type SubscriptionView = Subscription & {
  platform_subscribers: Pick<Subscriber, "company_name" | "email"> | null;
  platform_product_access: AccessSummary[];
};

type TabId = "overview" | "subscribers" | "subscriptions" | "access" | "products";
type DialogId = "subscriber" | "subscription" | "plan" | "access" | null;

const navigation: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Vue d’ensemble", icon: LayoutDashboard },
  { id: "subscribers", label: "Souscripteurs", icon: Users },
  { id: "subscriptions", label: "Abonnements", icon: CreditCard },
  { id: "access", label: "Accès produits", icon: FileKey2 },
  { id: "products", label: "Produits et offres", icon: Settings2 },
];

const subscriptionStatusLabels: Record<Subscription["status"], string> = {
  pending: "À confirmer",
  trialing: "Essai",
  active: "Actif",
  past_due: "Paiement en retard",
  suspended: "Suspendu",
  cancelled: "Résilié",
  expired: "Expiré",
};

const accessStatusLabels: Record<ProductAccess["status"], string> = {
  pending: "À provisionner",
  active: "En service",
  suspended: "Suspendu",
  revoked: "Révoqué",
  expired: "Expiré",
};

const intervalLabels: Record<Plan["billing_interval"], string> = {
  monthly: "Mensuel",
  yearly: "Annuel",
  one_time: "Achat unique",
  custom: "Sur mesure",
};

function money(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);
}

function formatDate(value: string | null) {
  if (!value) return "Sans échéance";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}

function statusTone(status: string) {
  if (["active", "trialing"].includes(status)) return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (["pending", "past_due"].includes(status)) return "bg-amber-50 text-amber-800 ring-amber-200";
  if (["suspended", "revoked", "cancelled", "expired"].includes(status)) return "bg-rose-50 text-rose-800 ring-rose-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

async function loadPlatformData() {
  const supabase = createSupabaseBrowserClient();
  const [productsResult, plansResult, subscribersResult, subscriptionsResult] = await Promise.all([
    supabase.from("platform_products").select("*").order("name"),
    supabase.from("platform_plans").select("*").order("created_at", { ascending: false }),
    supabase.from("platform_subscribers").select("*").order("created_at", { ascending: false }),
    supabase
      .from("platform_subscriptions")
      .select("*, platform_subscribers(company_name, email), platform_product_access(id, status, access_kind, external_tenant_id)")
      .order("created_at", { ascending: false }),
  ]);

  const failed = [productsResult, plansResult, subscribersResult, subscriptionsResult].find((result) => result.error);
  if (failed?.error) throw failed.error;

  return {
    products: productsResult.data ?? [],
    plans: plansResult.data ?? [],
    subscribers: subscribersResult.data ?? [],
    subscriptions: (subscriptionsResult.data ?? []) as SubscriptionView[],
  };
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#101c2b]/45 p-4 backdrop-blur-sm" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-bold text-[#14213d]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="p-6">{children}</div>
      </section>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusTone(status)}`}>{label}</span>;
}

function Metric({ label, value, note, icon: Icon, tint }: { label: string; value: string; note: string; icon: typeof Users; tint: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#14213d]">{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-lg ${tint}`}><Icon className="h-5 w-5" /></span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{note}</p>
    </section>
  );
}

export default function AdministrationConsole({ userEmail, role }: { userEmail: string; role: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [dialog, setDialog] = useState<DialogId>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionView[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedAccess, setSelectedAccess] = useState<{ access: AccessSummary; subscription: SubscriptionView } | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await loadPlatformData();
      setProducts(data.products);
      setPlans(data.plans);
      setSubscribers(data.subscribers);
      setSubscriptions(data.subscriptions);
    } catch {
      setError("Chargement impossible. Vérifiez l’accès administrateur et la connexion locale.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    loadPlatformData()
      .then((data) => {
        if (!isCurrent) return;
        setProducts(data.products);
        setPlans(data.plans);
        setSubscribers(data.subscribers);
        setSubscriptions(data.subscriptions);
      })
      .catch(() => {
        if (isCurrent) setError("Chargement impossible. Vérifiez l’accès administrateur et la connexion locale.");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => { isCurrent = false; };
  }, []);

  const activeSubscriptions = subscriptions.filter((item) => item.status === "active" || item.status === "trialing");
  const pendingAccessCount = subscriptions.reduce((count, item) => count + item.platform_product_access.filter((access) => access.status === "pending").length, 0);
  const monthlyValue = activeSubscriptions
    .filter((item) => item.billing_interval === "monthly")
    .reduce((sum, item) => sum + item.amount_cents, 0);
  const chartData = products.map((product) => {
    const productSubscriptions = subscriptions.filter((item) => item.product_code === product.code);
    return {
      name: product.name.replace("Sphorix ", "").replace(" Compta", ""),
      active: productSubscriptions.filter((item) => item.status === "active" || item.status === "trialing").length,
      pending: productSubscriptions.filter((item) => item.status === "pending" || item.status === "past_due").length,
    };
  });

  const filteredSubscribers = subscribers.filter((subscriber) =>
    `${subscriber.company_name} ${subscriber.contact_name} ${subscriber.email}`.toLowerCase().includes(search.trim().toLowerCase())
  );
  const filteredSubscriptions = subscriptions.filter((subscription) =>
    `${subscription.platform_subscribers?.company_name ?? ""} ${subscription.platform_subscribers?.email ?? ""} ${subscription.plan_name} ${subscription.product_code}`
      .toLowerCase().includes(search.trim().toLowerCase())
  );

  const notify = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 4200);
  };

  const createSubscriber = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: actionError } = await supabase.rpc("create_platform_subscriber", {
        target_company_name: String(form.get("company_name") ?? ""),
        target_contact_name: String(form.get("contact_name") ?? ""),
        target_email: String(form.get("email") ?? ""),
        target_phone: String(form.get("phone") ?? ""),
        target_notes: String(form.get("notes") ?? ""),
      });
      if (actionError) throw actionError;
      setDialog(null);
      notify("Souscripteur ajouté.");
      await refresh();
    } catch {
      setError("Création impossible. Vérifiez les champs et l’adresse email.");
    } finally {
      setSaving(false);
    }
  };

  const createSubscription = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const productCode = String(form.get("product_code") ?? "");
    const planId = String(form.get("plan_id") ?? "");
    const plan = plans.find((item) => item.id === planId);
    const amount = Math.round(Number(form.get("amount_euros") ?? 0) * 100);
    setSaving(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: actionError } = await supabase.rpc("create_platform_subscription", {
        target_subscriber_id: String(form.get("subscriber_id") ?? ""),
        target_product_code: productCode,
        target_plan_name: plan?.name ?? String(form.get("plan_name") ?? "").trim(),
        target_billing_interval: plan?.billing_interval ?? String(form.get("billing_interval") ?? "custom"),
        target_amount_cents: plan?.amount_cents ?? amount,
        target_status: String(form.get("status") ?? "pending") as Subscription["status"],
        target_starts_at: `${String(form.get("starts_at") ?? "")}T00:00:00.000Z`,
        target_period_end: form.get("period_end") ? `${String(form.get("period_end"))}T23:59:59.000Z` : null,
        target_notes: String(form.get("notes") ?? ""),
      });
      if (actionError) throw actionError;
      setDialog(null);
      notify("Abonnement créé. Le provisionnement du produit reste à confirmer.");
      await refresh();
    } catch {
      setError("Création impossible. Vérifiez le souscripteur, le produit et les dates.");
    } finally {
      setSaving(false);
    }
  };

  const createPlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: actionError } = await supabase.rpc("create_platform_plan", {
        target_product_code: String(form.get("product_code") ?? ""),
        target_name: String(form.get("name") ?? "").trim(),
        target_interval: String(form.get("billing_interval") ?? "custom") as Plan["billing_interval"],
        target_amount_cents: Math.round(Number(form.get("amount_euros") ?? 0) * 100),
        target_notes: String(form.get("notes") ?? ""),
      });
      if (actionError) throw actionError;
      setDialog(null);
      notify("Offre ajoutée.");
      await refresh();
    } catch {
      setError("Création de l’offre impossible. Vérifiez son nom et son tarif.");
    } finally {
      setSaving(false);
    }
  };

  const changeSubscriptionStatus = async (subscription: SubscriptionView, status: Subscription["status"]) => {
    const supabase = createSupabaseBrowserClient();
    const { error: actionError } = await supabase.rpc("update_platform_subscription_status", {
      target_subscription_id: subscription.id,
      target_status: status,
      target_notes: null,
    });
    if (actionError) {
      setError("Le statut de l’abonnement n’a pas pu être modifié.");
      return;
    }
    notify("Statut d’abonnement mis à jour.");
    await refresh();
  };

  const updateAccess = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAccess) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: actionError } = await supabase.rpc("update_platform_access", {
        target_access_id: selectedAccess.access.id,
        target_status: "active",
        target_external_tenant_id: String(form.get("tenant_id") ?? "").trim(),
        target_external_reference: String(form.get("external_reference") ?? "").trim() || null,
      });
      if (actionError) throw actionError;
      setSelectedAccess(null);
      notify("Accès enregistré comme provisionné.");
      await refresh();
    } catch {
      setError("Provisionnement refusé. L’abonnement doit être actif et l’identifiant du tenant est requis.");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await createSupabaseBrowserClient().auth.signOut();
    router.replace("/administration/connexion");
  };

  const activeLabel = navigation.find((item) => item.id === activeTab)?.label ?? "Administration";

  return (
    <main className="min-h-screen bg-[#eef3f3] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[252px] shrink-0 flex-col bg-[#14213d] text-white lg:flex">
          <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white p-1.5 shadow-sm"><Image src="/logo/logo.png" alt="Sphorix" width={32} height={32} priority /></span>
            <div><p className="text-sm font-bold tracking-wide">SPHORIX</p><p className="text-xs text-slate-400">Console éditeur</p></div>
          </div>
          <div className="px-4 pt-6">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Gestion</p>
            <nav className="mt-2 space-y-1">
              {navigation.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${activeTab === id ? "bg-white text-[#14213d] shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
                  <Icon className={`h-4 w-4 ${activeTab === id ? "text-[#168a79]" : "text-slate-400"}`} />{label}
                  {id === "access" && pendingAccessCount > 0 && <span className="ml-auto rounded-full bg-[#f28c45] px-2 py-0.5 text-[10px] font-bold text-[#14213d]">{pendingAccessCount}</span>}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-auto border-t border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-lg bg-white/[0.06] p-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#168a79] text-xs font-bold">{userEmail.slice(0, 2).toUpperCase()}</span>
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{userEmail}</p><p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#f5b171]">{role}</p></div>
            </div>
            <button type="button" onClick={signOut} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" />Déconnexion</button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#168a79]">Sphorix / Administration</p>
              <h1 className="truncate text-lg font-bold text-[#14213d]">{activeLabel}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <label className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une société…" className="h-9 w-[240px] rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-[#168a79] focus:bg-white" />
              </label>
              <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Local</span>
              <button type="button" onClick={signOut} aria-label="Déconnexion" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 lg:hidden"><LogOut className="h-4 w-4" /></button>
            </div>
          </header>

          <div className="border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
            <nav className="flex gap-1 overflow-x-auto">
              {navigation.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${activeTab === id ? "bg-[#14213d] text-white" : "text-slate-600 hover:bg-slate-100"}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}
            </nav>
          </div>

          <div className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-6 xl:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#168a79]">Pilotage éditeur</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-[#14213d]">Produits, sociétés et accès</h2><p className="mt-1 text-sm text-slate-500">Abonnements gérés manuellement · aucun paiement déclenché</p></div>
              <div className="flex flex-wrap gap-2">
                {activeTab !== "access" && <button type="button" onClick={() => setDialog(activeTab === "subscribers" ? "subscriber" : activeTab === "products" ? "plan" : "subscription")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#14213d] px-4 text-sm font-semibold text-white hover:bg-[#20395f]"><Plus className="h-4 w-4" />{activeTab === "subscribers" ? "Ajouter un souscripteur" : activeTab === "products" ? "Créer une offre" : "Nouvel abonnement"}</button>}
                {activeTab === "subscriptions" && <button type="button" onClick={() => setDialog("subscriber")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Building2 className="h-4 w-4" />Ajouter une société</button>}
              </div>
            </div>

            {error && <div role="alert" className="flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Fermer" className="font-bold">×</button></div>}
            {notice && <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"><Check className="h-4 w-4" />{notice}</div>}
            {loading ? <div className="flex min-h-60 items-center justify-center gap-3 text-sm text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin text-[#168a79]" />Chargement du registre éditeur…</div> : (
              <>
                {activeTab === "overview" && <Overview products={products} subscribers={subscribers} subscriptions={subscriptions} pendingAccessCount={pendingAccessCount} monthlyValue={monthlyValue} chartData={chartData} />}
                {activeTab === "subscribers" && <SubscribersView subscribers={filteredSubscribers} />}
                {activeTab === "subscriptions" && <SubscriptionsView subscriptions={filteredSubscriptions} onStatusChange={changeSubscriptionStatus} />}
                {activeTab === "access" && <AccessView subscriptions={subscriptions} onProvision={setSelectedAccess} />}
                {activeTab === "products" && <ProductsView products={products} plans={plans} />}
              </>
            )}
          </div>
        </section>
      </div>

      {dialog === "subscriber" && <Modal title="Ajouter un souscripteur" onClose={() => setDialog(null)}><form onSubmit={createSubscriber} className="space-y-4"><Field label="Société" name="company_name" required /><Field label="Contact principal" name="contact_name" /><Field label="Adresse email" name="email" type="email" required /><Field label="Téléphone" name="phone" type="tel" /><Field label="Notes internes" name="notes" multiline /><FormActions saving={saving} onCancel={() => setDialog(null)} label="Créer la fiche" /></form></Modal>}
      {dialog === "subscription" && <Modal title="Créer un abonnement manuel" onClose={() => setDialog(null)}><SubscriptionForm subscribers={subscribers} products={products} plans={plans} saving={saving} onSubmit={createSubscription} onCancel={() => setDialog(null)} /></Modal>}
      {dialog === "plan" && <Modal title="Créer une offre" onClose={() => setDialog(null)}><PlanForm products={products} saving={saving} onSubmit={createPlan} onCancel={() => setDialog(null)} /></Modal>}
      {selectedAccess && <Modal title="Confirmer le provisionnement" onClose={() => setSelectedAccess(null)}><div className="mb-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">N’active l’accès qu’après avoir créé le tenant ou envoyé l’invitation dans le produit concerné.</div><form onSubmit={updateAccess} className="space-y-4"><Field label="Identifiant réel du tenant produit" name="tenant_id" required /><Field label="Référence d’invitation ou de clé (sans secret)" name="external_reference" /><FormActions saving={saving} onCancel={() => setSelectedAccess(null)} label="Confirmer la mise en service" /></form></Modal>}
    </main>
  );
}

function Overview({ products, subscribers, subscriptions, pendingAccessCount, monthlyValue, chartData }: {
  products: Product[];
  subscribers: Subscriber[];
  subscriptions: SubscriptionView[];
  pendingAccessCount: number;
  monthlyValue: number;
  chartData: { name: string; active: number; pending: number }[];
}) {
  const active = subscriptions.filter((item) => item.status === "active" || item.status === "trialing").length;
  const unpaid = subscriptions.filter((item) => ["pending", "past_due"].includes(item.status)).length;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Souscripteurs" value={String(subscribers.length)} note={`${subscribers.filter((item) => item.status === "prospect").length} prospects`} icon={Users} tint="bg-[#eaf3ef] text-[#168a79]" />
        <Metric label="Abonnements actifs" value={String(active)} note={`${unpaid} en attente ou en retard`} icon={CreditCard} tint="bg-[#fff0df] text-[#c5662b]" />
        <Metric label="Revenu mensuel suivi" value={money(monthlyValue)} note="Somme des forfaits mensuels actifs, hors paiements" icon={CircleDollarSign} tint="bg-[#e9eef9] text-[#315ca8]" />
        <Metric label="Accès à provisionner" value={String(pendingAccessCount)} note="Tenant ou invitation produit à confirmer" icon={Clock3} tint="bg-[#fcebea] text-[#b44c43]" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.8fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-[#14213d]">Abonnements par produit</h3><p className="mt-1 text-xs text-slate-500">Actifs et en attente · registre local</p></div><span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600"><Activity className="h-3 w-3" />Vue instantanée</span></div>
          <div className="mt-5 h-[250px] w-full">
            {products.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 10, right: 12, left: -18, bottom: 5 }}><CartesianGrid stroke="#e9eef0" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#52606d", fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#87919a", fontSize: 11 }} /><Tooltip cursor={{ fill: "#f3f6f5" }} contentStyle={{ border: "1px solid #dce4e3", borderRadius: 10, fontSize: 12 }} /><Bar dataKey="active" name="Actifs / essais" fill="#168a79" radius={[5, 5, 0, 0]} /><Bar dataKey="pending" name="À confirmer" fill="#e28a45" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyState text="Aucun produit au catalogue." />}
          </div>
          <div className="mt-2 flex gap-5 text-xs text-slate-500"><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-[#168a79]" />Actifs / essais</span><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-[#e28a45]" />À confirmer</span></div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold text-[#14213d]">Produits Sphorix</h3><p className="mt-1 text-xs text-slate-500">Registre de la console éditeur</p></div><span className="text-xs font-semibold text-slate-500">{products.length} produits</span></div>
          <div className="mt-5 divide-y divide-slate-100">{products.map((product) => <div key={product.code} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"><span className={`grid h-10 w-10 place-items-center rounded-lg ${product.code === "sadesk-compta" ? "bg-[#eaf3ef] text-[#168a79]" : "bg-[#fff0df] text-[#c5662b]"}`}>{product.code === "sadesk-compta" ? <Building2 className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{product.name}</p><p className="mt-0.5 truncate text-xs text-slate-500">{product.description}</p></div><StatusBadge status={product.status} label={product.status === "beta" ? "Bêta" : product.status === "active" ? "Actif" : product.status} /></div>)}</div>
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#168a79]" />Les abonnements ne déclenchent aucun prélèvement. Le provisionnement d’accès est suivi séparément.</div>
        </section>
      </div>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4"><div><h3 className="font-bold text-[#14213d]">Activité récente</h3><p className="mt-1 text-xs text-slate-500">Derniers abonnements enregistrés</p></div><span className="text-xs text-slate-500">{subscriptions.length} au total</span></div>
        {subscriptions.length ? <div className="divide-y divide-slate-100">{subscriptions.slice(0, 5).map((subscription) => <div key={subscription.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5"><div className="grid h-8 w-8 place-items-center rounded-lg bg-[#eef3f3] text-[#168a79]"><CreditCard className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{subscription.platform_subscribers?.company_name ?? "Société"} · {subscription.plan_name}</p><p className="mt-0.5 text-xs text-slate-500">{subscription.product_code} · {formatDate(subscription.created_at)}</p></div><span className="text-sm font-semibold text-slate-700">{money(subscription.amount_cents)}</span><StatusBadge status={subscription.status} label={subscriptionStatusLabels[subscription.status]} /></div>)}</div> : <EmptyState text="Les abonnements créés apparaîtront ici." />}
      </section>
    </div>
  );
}

function SubscribersView({ subscribers }: { subscribers: Subscriber[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h3 className="font-bold text-[#14213d]">Répertoire des souscripteurs</h3><p className="mt-1 text-xs text-slate-500">Fiches société et contact centralisées</p></div><span className="text-xs font-semibold text-slate-500">{subscribers.length}</span></div>
      {subscribers.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Société</th><th className="px-5 py-3 font-semibold">Contact</th><th className="px-5 py-3 font-semibold">Email</th><th className="px-5 py-3 font-semibold">Produits</th><th className="px-5 py-3 font-semibold">Statut</th><th className="px-5 py-3 font-semibold">Créé le</th></tr></thead><tbody className="divide-y divide-slate-100">{subscribers.map((subscriber) => <tr key={subscriber.id} className="hover:bg-[#f7faf9]"><td className="px-5 py-3.5 font-semibold text-slate-800">{subscriber.company_name}</td><td className="px-5 py-3.5 text-slate-600">{subscriber.contact_name || "—"}</td><td className="px-5 py-3.5 text-slate-600">{subscriber.email}</td><td className="px-5 py-3.5 text-slate-600">—</td><td className="px-5 py-3.5"><StatusBadge status={subscriber.status} label={subscriber.status === "prospect" ? "Prospect" : subscriber.status === "active" ? "Actif" : subscriber.status} /></td><td className="px-5 py-3.5 text-slate-500">{formatDate(subscriber.created_at)}</td></tr>)}</tbody></table></div> : <EmptyState text="Aucun souscripteur. Ajoutez une société pour démarrer le registre." />}
    </section>
  );
}

function SubscriptionsView({ subscriptions, onStatusChange }: { subscriptions: SubscriptionView[]; onStatusChange: (subscription: SubscriptionView, status: Subscription["status"]) => void }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h3 className="font-bold text-[#14213d]">Registre des abonnements</h3><p className="mt-1 text-xs text-slate-500">Gestion manuelle, sans prestataire de paiement</p></div><span className="text-xs font-semibold text-slate-500">{subscriptions.length}</span></div>
      {subscriptions.length ? <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Souscripteur</th><th className="px-5 py-3 font-semibold">Produit et offre</th><th className="px-5 py-3 font-semibold">Montant</th><th className="px-5 py-3 font-semibold">Période</th><th className="px-5 py-3 font-semibold">Statut</th><th className="px-5 py-3 font-semibold">Accès</th><th className="px-5 py-3 font-semibold">Changer statut</th></tr></thead><tbody className="divide-y divide-slate-100">{subscriptions.map((subscription) => { const accessPending = subscription.platform_product_access.some((access) => access.status === "pending"); return <tr key={subscription.id} className="hover:bg-[#f7faf9]"><td className="px-5 py-3.5"><p className="font-semibold text-slate-800">{subscription.platform_subscribers?.company_name ?? "Société"}</p><p className="mt-0.5 text-xs text-slate-500">{subscription.platform_subscribers?.email}</p></td><td className="px-5 py-3.5"><p className="font-semibold text-slate-700">{subscription.product_code}</p><p className="mt-0.5 text-xs text-slate-500">{subscription.plan_name} · {intervalLabels[subscription.billing_interval]}</p></td><td className="px-5 py-3.5 font-semibold text-slate-700">{money(subscription.amount_cents)}</td><td className="px-5 py-3.5 text-slate-600"><p>{formatDate(subscription.starts_at)}</p><p className="mt-0.5 text-xs text-slate-400">Fin : {formatDate(subscription.current_period_end)}</p></td><td className="px-5 py-3.5"><StatusBadge status={subscription.status} label={subscriptionStatusLabels[subscription.status]} /></td><td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${accessPending ? "text-amber-700" : "text-emerald-700"}`}><span className={`h-1.5 w-1.5 rounded-full ${accessPending ? "bg-amber-500" : "bg-emerald-500"}`} />{accessPending ? "À provisionner" : "Suivi"}</span></td><td className="px-5 py-3.5"><select aria-label={`Statut de ${subscription.plan_name}`} value={subscription.status} onChange={(event) => onStatusChange(subscription, event.target.value as Subscription["status"])} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-[#168a79]">{Object.entries(subscriptionStatusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></td></tr>; })}</tbody></table></div> : <EmptyState text="Aucun abonnement. Créez un abonnement manuel depuis un souscripteur." />}
    </section>
  );
}

function AccessView({ subscriptions, onProvision }: { subscriptions: SubscriptionView[]; onProvision: (value: { access: AccessSummary; subscription: SubscriptionView }) => void }) {
  const rows = subscriptions.flatMap((subscription) => subscription.platform_product_access.map((access) => ({ access, subscription })));
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-[#fff7eb] p-4 text-sm text-amber-950"><FileKey2 className="mt-0.5 h-5 w-5 shrink-0 text-[#c5662b]" /><div><p className="font-semibold">Clés et liens : étape de provisionnement à connecter</p><p className="mt-1 text-xs leading-5 text-amber-900/80">Cette console ne fabrique pas de clé fictive. Confirmez un accès seulement après avoir créé le tenant, l’invitation ou la clé dans SAdesk ou Connect. Les adaptateurs locaux seront ajoutés ensuite.</p></div></div>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h3 className="font-bold text-[#14213d]">Provisionnement produit</h3><p className="mt-1 text-xs text-slate-500">Références de tenants sans secret brut</p></div><span className="text-xs font-semibold text-slate-500">{rows.length}</span></div>{rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Société</th><th className="px-5 py-3 font-semibold">Produit</th><th className="px-5 py-3 font-semibold">Type d’accès</th><th className="px-5 py-3 font-semibold">Tenant</th><th className="px-5 py-3 font-semibold">Statut</th><th className="px-5 py-3 font-semibold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(({ access, subscription }) => <tr key={access.id}><td className="px-5 py-3.5 font-semibold text-slate-800">{subscription.platform_subscribers?.company_name ?? "Société"}</td><td className="px-5 py-3.5 text-slate-600">{access.product_code}</td><td className="px-5 py-3.5 text-slate-600">{access.access_kind === "provisioning" ? "Provisionnement" : access.access_kind}</td><td className="px-5 py-3.5 font-mono text-xs text-slate-500">{access.external_tenant_id ?? "Non lié"}</td><td className="px-5 py-3.5"><StatusBadge status={access.status} label={accessStatusLabels[access.status]} /></td><td className="px-5 py-3.5">{access.status === "pending" && <button type="button" disabled={!(["active", "trialing"].includes(subscription.status))} onClick={() => onProvision({ access, subscription })} className="rounded-md border border-[#168a79]/30 px-2.5 py-1.5 text-xs font-semibold text-[#126f63] hover:bg-[#eaf3ef] disabled:cursor-not-allowed disabled:opacity-40">Confirmer le tenant</button>}</td></tr>)}</tbody></table></div> : <EmptyState text="Les accès associés aux abonnements apparaîtront ici." />}</section>
    </div>
  );
}

function ProductsView({ products, plans }: { products: Product[]; plans: Plan[] }) {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-2">{products.map((product) => <article key={product.code} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className={`h-1.5 ${product.code === "sadesk-compta" ? "bg-[#168a79]" : "bg-[#e28a45]"}`} /><div className="flex flex-wrap items-start justify-between gap-3 p-5"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{product.code}</p><h3 className="mt-1 text-lg font-bold text-[#14213d]">{product.name}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{product.description}</p></div><StatusBadge status={product.status} label={product.status === "beta" ? "Bêta" : product.status === "active" ? "Actif" : product.status} /></div><div className="border-t border-slate-100 px-5 py-4"><div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-slate-800">Offres définies</h4><span className="text-xs text-slate-500">{plans.filter((plan) => plan.product_code === product.code).length}</span></div>{plans.filter((plan) => plan.product_code === product.code).length ? <div className="mt-3 divide-y divide-slate-100">{plans.filter((plan) => plan.product_code === product.code).map((plan) => <div key={plan.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-medium text-slate-800">{plan.name}</p><p className="mt-0.5 text-xs text-slate-500">{intervalLabels[plan.billing_interval]} · {plan.notes || "Sans note"}</p></div><p className="text-sm font-bold text-[#14213d]">{money(plan.amount_cents)}</p></div>)}</div> : <p className="mt-2 text-xs text-slate-500">Aucune offre tarifée. Les conditions peuvent être définies au cas par cas.</p>}</div></article>)}</section>
      <section className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600"><ArrowDownToLine className="mt-0.5 h-4 w-4 shrink-0 text-[#168a79]" /><p>Les offres sont internes à la console. Elles ne créent aucun prix Stripe et ne déclenchent aucune facturation.</p></section>
    </div>
  );
}

function SubscriptionForm({ subscribers, products, plans, saving, onSubmit, onCancel }: { subscribers: Subscriber[]; products: Product[]; plans: Plan[]; saving: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  const [productCode, setProductCode] = useState(products[0]?.code ?? "");
  const matchingPlans = plans.filter((plan) => plan.product_code === productCode && plan.is_active);
  return <form onSubmit={onSubmit} className="space-y-4"><SelectField label="Souscripteur" name="subscriber_id" required options={subscribers.map((subscriber) => ({ value: subscriber.id, label: `${subscriber.company_name} · ${subscriber.email}` }))} emptyLabel="Créer d’abord une fiche souscripteur" /><label className="block text-sm font-semibold text-slate-700">Produit<select name="product_code" value={productCode} onChange={(event) => setProductCode(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#168a79]">{products.map((product) => <option key={product.code} value={product.code}>{product.name}</option>)}</select></label>{matchingPlans.length ? <SelectField label="Offre" name="plan_id" options={matchingPlans.map((plan) => ({ value: plan.id, label: `${plan.name} · ${money(plan.amount_cents)} / ${intervalLabels[plan.billing_interval].toLowerCase()}` }))} emptyLabel="Offre personnalisée" /> : <Field label="Nom de l’offre / formule" name="plan_name" required />}<div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Périodicité<select name="billing_interval" defaultValue="custom" disabled={matchingPlans.length > 0} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#168a79]">{Object.entries(intervalLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><Field label="Montant mensuel ou forfait (€)" name="amount_euros" type="number" min="0" step="0.01" defaultValue="0" disabled={matchingPlans.length > 0} /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Début de l’abonnement" name="starts_at" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /><Field label="Fin de période (optionnel)" name="period_end" type="date" /></div><SelectField label="Statut initial" name="status" options={Object.entries(subscriptionStatusLabels).map(([value, label]) => ({ value, label }))} defaultValue="pending" /><Field label="Notes internes" name="notes" multiline /><FormActions saving={saving} onCancel={onCancel} label="Créer l’abonnement" /></form>;
}

function PlanForm({ products, saving, onSubmit, onCancel }: { products: Product[]; saving: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <form onSubmit={onSubmit} className="space-y-4"><SelectField label="Produit" name="product_code" required options={products.map((product) => ({ value: product.code, label: product.name }))} /><Field label="Nom de l’offre" name="name" required /><div className="grid gap-4 sm:grid-cols-2"><SelectField label="Périodicité" name="billing_interval" options={Object.entries(intervalLabels).map(([value, label]) => ({ value, label }))} defaultValue="custom" /><Field label="Tarif indicatif (€)" name="amount_euros" type="number" min="0" step="0.01" defaultValue="0" /></div><Field label="Notes internes" name="notes" multiline /><FormActions saving={saving} onCancel={onCancel} label="Créer l’offre" /></form>;
}

function Field({ label, name, type = "text", required = false, multiline = false, defaultValue, disabled, min, max, step }: { label: string; name: string; type?: string; required?: boolean; multiline?: boolean; defaultValue?: string; disabled?: boolean; min?: string; max?: string; step?: string }) {
  const classes = "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-[#168a79] focus:ring-2 focus:ring-[#168a79]/10 disabled:bg-slate-100 disabled:text-slate-400";
  return <label className="block text-sm font-semibold text-slate-700">{label}{multiline ? <textarea name={name} required={required} defaultValue={defaultValue} rows={3} disabled={disabled} className={`${classes} resize-y`} /> : <input name={name} type={type} required={required} defaultValue={defaultValue} disabled={disabled} min={min} max={max} step={step} className={`h-10 ${classes}`} />}</label>;
}

function SelectField({ label, name, options, required = false, defaultValue, emptyLabel }: { label: string; name: string; options: { value: string; label: string }[]; required?: boolean; defaultValue?: string; emptyLabel?: string }) {
  return <label className="block text-sm font-semibold text-slate-700">{label}<select name={name} required={required} defaultValue={defaultValue} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#168a79]">{emptyLabel && <option value="">{emptyLabel}</option>}{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function FormActions({ saving, onCancel, label }: { saving: boolean; onCancel: () => void; label: string }) {
  return <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Annuler</button><button type="submit" disabled={saving} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#14213d] px-4 text-sm font-semibold text-white hover:bg-[#20395f] disabled:opacity-60">{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}{label}</button></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="grid min-h-40 place-items-center px-5 py-10 text-center"><div><span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[#eaf3ef] text-[#168a79]"><BadgeCheck className="h-5 w-5" /></span><p className="mt-3 text-sm text-slate-500">{text}</p></div></div>;
}