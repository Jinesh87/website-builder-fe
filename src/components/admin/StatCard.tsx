import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  /** Icon chip colours, e.g. "bg-emerald-50 text-emerald-600". */
  tone: string;
  /** Makes the card a filter toggle. */
  onPress?: () => void;
  active?: boolean;
};

export default function StatCard({ label, value, hint, icon, tone, onPress, active = false }: StatCardProps) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted">{label}</span>
        <span className={`grid size-8 place-items-center rounded-lg ${tone}`}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{hint}</p>
    </>
  );
  const className = `rounded-xl border bg-surface p-4 text-left shadow-sm ${active ? "border-brand ring-1 ring-brand/30" : "border-line"}`;
  return onPress ? (
    <button type="button" onClick={onPress} aria-pressed={active} className={`${className} transition-colors hover:border-line-strong`}>
      {body}
    </button>
  ) : (
    <div className={className}>{body}</div>
  );
}
