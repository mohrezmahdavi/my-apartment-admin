export function StatusBadge({ status, label }: { status: string; label: string }) {
  const tone =
    status === "blocked"
      ? "bg-danger-soft text-danger"
      : status === "past_due"
        ? "bg-surface-2 text-muted"
        : "bg-success-soft text-success";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>{label}</span>;
}
