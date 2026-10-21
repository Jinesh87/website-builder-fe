import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import type { WebsiteHosting } from "../../api/hosting.ts";
import { CYCLE_LABELS, formatBillingDate } from "../hosting/hosting-labels.tsx";
import CommonModal from "../ui/CommonModal.tsx";
import LiveSiteLink from "./LiveSiteLink.tsx";

type PublishSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  website: { name: string; subdomain: string; customDomain: string | null };
  hosting?: WebsiteHosting | null;
  title?: string;
  /** Goes here when the countdown ends or "Go to dashboard" is pressed; closing stays put. */
  redirect?: { to: string; seconds: number; stayLabel: string };
};

const CONFETTI_COLORS = ["#2447c7", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

/** Evenly spread burst; fixed values so the animation is the same every time. */
const CONFETTI = Array.from({ length: 16 }, (_, index) => {
  const angle = (index / 16) * Math.PI * 2;
  const distance = 70 + (index % 3) * 18;
  return {
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    style: {
      "--dx": `${Math.round(Math.cos(angle) * distance)}px`,
      "--dy": `${Math.round(Math.sin(angle) * distance)}px`,
      "--rot": `${(index % 2 ? 1 : -1) * (120 + index * 20)}deg`,
      animationDelay: `${0.3 + (index % 4) * 0.04}s`,
    } as CSSProperties,
    round: index % 3 === 0,
  };
});

function hostingLine(hosting: WebsiteHosting | null | undefined): string | null {
  const subscription = hosting?.subscription;
  if (!subscription?.currentPeriodEnd || (subscription.status !== "ACTIVE" && subscription.status !== "GRACE")) return null;
  return `Hosting active · ${CYCLE_LABELS[subscription.cycle]} · till ${formatBillingDate(subscription.currentPeriodEnd)}`;
}

export default function PublishSuccessModal({ isOpen, onClose, website, hosting, title, redirect }: PublishSuccessModalProps) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(redirect?.seconds ?? 0);

  useEffect(() => {
    if (isOpen) setSecondsLeft(redirect?.seconds ?? 0);
  }, [isOpen, redirect?.seconds]);

  useEffect(() => {
    if (!isOpen || !redirect) return;
    if (secondsLeft <= 0) {
      navigate(redirect.to);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [isOpen, redirect, secondsLeft, navigate]);

  const plan = hostingLine(hosting);

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} showHeader={false} disableFooter size="sm" ariaLabel="Website published">
      <div className="publish-success flex flex-col items-center py-2 text-center">
        <div className="relative grid size-24 place-items-center">
          <span className="absolute inset-2 animate-publish-ring rounded-full bg-emerald-400/40" aria-hidden />
          {CONFETTI.map((piece, index) => (
            <span
              key={index}
              data-confetti
              aria-hidden
              className={`absolute left-1/2 top-1/2 -ml-1 -mt-1 size-2 animate-publish-confetti ${piece.round ? "rounded-full" : "rounded-[2px]"}`}
              style={{ ...piece.style, backgroundColor: piece.color }}
            />
          ))}
          <span className="relative grid size-16 animate-publish-pop place-items-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <svg viewBox="0 0 24 24" className="size-8" fill="none" aria-hidden>
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="white"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="24"
                strokeDashoffset="24"
                className="animate-publish-draw"
              />
            </svg>
          </span>
        </div>

        <h2 className="mt-4 animate-publish-rise text-xl font-bold tracking-tight text-ink [animation-delay:0.35s]">
          {title ?? "Your website is live!"}
        </h2>
        <p className="mt-1 animate-publish-rise text-sm text-ink-body [animation-delay:0.45s]">
          <span className="font-medium text-ink">{website.name}</span> is now online for everyone.
        </p>

        <div className="mt-5 w-full animate-publish-rise text-left [animation-delay:0.55s]">
          <LiveSiteLink subdomain={website.subdomain} customDomain={website.customDomain} variant="field" />
        </div>

        {plan && (
          <p className="mt-3 animate-publish-rise rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 [animation-delay:0.65s]">
            {plan}
          </p>
        )}

        <div className="mt-6 flex w-full animate-publish-rise flex-col gap-2 [animation-delay:0.75s]">
          {redirect ? (
            <>
              <button
                type="button"
                onClick={() => navigate(redirect.to)}
                className="inline-flex h-10 items-center justify-center rounded-full bg-brand px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-hover"
              >
                Go to dashboard{secondsLeft > 0 && <span className="ml-1.5 tabular-nums text-white/70">· {secondsLeft}s</span>}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-full text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {redirect.stayLabel}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-full bg-brand px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-hover"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </CommonModal>
  );
}
