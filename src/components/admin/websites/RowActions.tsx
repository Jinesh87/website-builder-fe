import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import AppTooltip from "../../ui/AppTooltip.tsx";

type Tone = "default" | "brand" | "danger";

const TONES: Record<Tone, string> = {
  default: "text-ink-muted hover:bg-canvas hover:text-ink",
  brand: "text-brand hover:bg-brand-soft",
  danger: "text-ed-danger hover:bg-red-50",
};

const BASE =
  "grid size-8 place-items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40";

/** Row of icon actions at the end of a table row. */
export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-0.5">{children}</div>;
}

export function IconLink({ to, label, icon: Icon, tone = "default" }: { to: string; label: string; icon: LucideIcon; tone?: Tone }) {
  return (
    <AppTooltip content={label}>
      <Link to={to} aria-label={label} className={`${BASE} ${TONES[tone]}`}>
        <Icon className="size-4" aria-hidden />
      </Link>
    </AppTooltip>
  );
}

export function IconButton({
  onPress,
  label,
  icon: Icon,
  tone = "default",
  isDisabled = false,
}: {
  onPress: () => void;
  label: string;
  icon: LucideIcon;
  tone?: Tone;
  isDisabled?: boolean;
}) {
  return (
    <AppTooltip content={label}>
      <button
        type="button"
        onClick={onPress}
        disabled={isDisabled}
        aria-label={label}
        className={`${BASE} ${TONES[tone]} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <Icon className="size-4" aria-hidden />
      </button>
    </AppTooltip>
  );
}
