"use client";

import { useEffect, useId, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { parseDecimal, toDecimalText } from "@/lib/suite/format";

import ModuleIcon, { type IconId } from "./ModuleIcon";

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ");

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "secondary" | "primary" | "danger" | "ghost"; size?: "md" | "sm"; icon?: LucideIcon; iconOnly?: boolean };

export function Button({ variant = "secondary", size = "md", icon: Icon, iconOnly, className, children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cx("sd-btn", variant !== "secondary" && `sd-btn-${variant}`, size === "sm" && "sd-btn-sm", iconOnly && "sd-btn-icon", className)} {...props}>
      {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
}

export type Tone = "neutral" | "ok" | "warn" | "danger" | "info";
export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cx("sd-badge", tone !== "neutral" && `sd-badge-${tone}`)}>{children}</span>;
}

export function Card({ title, icon, actions, children, flush }: { title?: ReactNode; icon?: IconId; actions?: ReactNode; children: ReactNode; flush?: boolean }) {
  return (
    <section className="sd-card">
      {(title || actions) && (
        <header className="sd-card-head">
          <h2 className="sd-h2 flex items-center gap-2">{icon && <ModuleIcon id={icon} size={28} />}{title}</h2>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={flush ? undefined : "sd-card-body"}>{children}</div>
    </section>
  );
}

export function PageHeader({ eyebrow, title, description, icon, actions }: { eyebrow?: string; title: string; description?: string; icon?: IconId; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {icon && <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-[var(--sd-border)] bg-[var(--sd-brand-soft)]"><ModuleIcon id={icon} size={46} /></span>}
        <div>
          {eyebrow && <p className="sd-eyebrow">{eyebrow}</p>}
          <h1 className="sd-h1">{title}</h1>
          {description && <p className="sd-muted mt-1 max-w-2xl">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Kpi({ label, value, hint, tone = "neutral", icon }: { label: string; value: string; hint?: string; tone?: Tone; icon?: IconId }) {
  const color = tone === "danger" ? "var(--sd-danger)" : tone === "warn" ? "var(--sd-warn)" : tone === "ok" ? "var(--sd-ok)" : "var(--sd-text)";
  return (
    <div className="sd-card flex items-start justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="sd-muted text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="sd-num mt-1 text-left text-[1.45rem] font-semibold leading-tight" style={{ color }}>{value}</p>
        {hint && <p className="sd-muted mt-0.5 text-xs">{hint}</p>}
      </div>
      {icon && <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--sd-brand-soft)]"><ModuleIcon id={icon} size={32} /></span>}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: IconId; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-2xl bg-[var(--sd-brand-soft)]"><ModuleIcon id={icon} size={58} /></span>
      <p className="sd-h2 mt-2">{title}</p>
      {text && <p className="sd-muted max-w-md">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: { id: T; label: string; icon?: IconId }[]; value: T; onChange: (id: T) => void; label: string }) {
  return (
    <div className="sd-tabs" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button key={tab.id} role="tab" aria-selected={value === tab.id} className="sd-tab inline-flex items-center gap-2" onClick={() => onChange(tab.id)}>
          {tab.icon && <ModuleIcon id={tab.icon} size={22} />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx("sd-label", className)}>
      <span>{label}</span>
      {children}
      {hint && <span className="sd-hint">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx("sd-input", props.className)} />;
}

/**
 * Saisie décimale à la française : conserve le texte tapé, ne valide qu'à la perte de focus
 * et stocke un entier (centimes, points de base…), sans erreur de virgule flottante.
 */
export function DecimalInput({ value, onChange, scale = 100, trim, suffix, ...props }: { value: number; onChange: (value: number) => void; scale?: number; trim?: boolean; suffix?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const id = useId();
  const [text, setText] = useState(toDecimalText(value, scale, trim));
  const [focused, setFocused] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resynchronise le texte quand la valeur change hors saisie
    if (!focused) setText(toDecimalText(value, scale, trim));
  }, [value, scale, trim, focused]);

  const commit = () => {
    const parsed = parseDecimal(text, scale);
    setInvalid(parsed === null && text.trim() !== "");
    if (parsed !== null) onChange(parsed);
    else if (text.trim() === "") onChange(0);
  };

  return (
    <span className="relative block">
      <input
        id={id}
        inputMode="decimal"
        {...props}
        className={cx("sd-input sd-num", suffix && "pr-8", props.className)}
        aria-invalid={invalid || undefined}
        value={text}
        onFocus={(event) => { setFocused(true); event.currentTarget.select(); }}
        onChange={(event) => { setText(event.target.value); const parsed = parseDecimal(event.target.value, scale); if (parsed !== null) onChange(parsed); }}
        onBlur={() => { setFocused(false); commit(); }}
      />
      {suffix && <span className="sd-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs">{suffix}</span>}
    </span>
  );
}
