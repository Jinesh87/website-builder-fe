import type { ReactNode } from "react";

/** A headline figure on a shop report: label, value and a short note under it. */
export default function StatCard({
  label,
  value,
  note,
  accent,
  children,
}: {
  label: string;
  value: string;
  note?: ReactNode;
  /** Colour dot before the label, e.g. to tie the card to a channel. */
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
        {accent && <span className={`size-2 rounded-full ${accent}`} aria-hidden />}
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      {note && <p className="mt-0.5 text-xs text-ink-muted">{note}</p>}
      {children}
    </div>
  );
}
