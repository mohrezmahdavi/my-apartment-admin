import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { toggleId } from "@/lib/format";

export function Screen({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  return <section className={narrow ? "mx-auto max-w-xl space-y-5" : "space-y-5"}>{children}</section>;
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success"; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className={kind === "error" ? "alert alert-error" : "alert alert-success"} role={kind === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}

export function Notices({ message, error }: { message?: string; error?: string }) {
  return (
    <>
      <Alert kind="success">{message}</Alert>
      <Alert kind="error">{error}</Alert>
    </>
  );
}

export function Loading() {
  return (
    <div className="grid min-h-40 place-items-center">
      <div className="spinner spinner-lg" />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card px-5 py-10 text-center text-sm text-muted">{children}</div>;
}

export function Field({ label, className, ...props }: { label: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block space-y-1.5 text-sm font-medium ${className ?? ""}`}>
      <span>{label}</span>
      <input className="field" {...props} />
    </label>
  );
}

export function SelectField({
  label,
  className,
  children,
  ...props
}: { label: string; className?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={`block space-y-1.5 text-sm font-medium ${className ?? ""}`}>
      <span>{label}</span>
      <select className="field" {...props}>
        {children}
      </select>
    </label>
  );
}

export function CheckList({
  items,
  selected,
  onChange,
  columns = "md:grid-cols-2",
}: {
  items: { id: number; label: string }[];
  selected: number[];
  onChange: (ids: number[]) => void;
  columns?: string;
}) {
  return (
    <div className={`grid gap-2 ${columns}`}>
      {items.map((item) => (
        <label key={item.id} className="check">
          <input
            type="checkbox"
            checked={selected.includes(item.id)}
            onChange={(event) => onChange(toggleId(selected, item.id, event.target.checked))}
          />
          {item.label}
        </label>
      ))}
    </div>
  );
}
