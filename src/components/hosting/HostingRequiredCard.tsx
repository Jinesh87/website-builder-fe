import { AlertCircle, Server } from "lucide-react";
import type { WebsiteHosting } from "../../api/hosting.ts";
import { planLabel } from "./hosting-labels.tsx";

function reason(hosting: WebsiteHosting, isAdmin: boolean): { title: string; body: string } {
  const subscription = hosting.subscription;
  if (subscription?.status === "SUSPENDED") {
    return {
      title: "Hosting expired",
      body: isAdmin
        ? "This website's hosting wasn't renewed. Record a payment before connecting a custom domain."
        : "Your hosting wasn't renewed. Renew your plan before connecting a custom domain.",
    };
  }
  if (subscription?.status === "AWAITING_PAYMENT") {
    const plan = planLabel(subscription);
    return {
      title: "Hosting plan ready",
      body: isAdmin
        ? `A ${plan} plan is set up for this website. Record the client's payment to unlock custom domains.`
        : `A ${plan} plan is set up for this website. Pay for it to connect your own domain.`,
    };
  }
  return {
    title: "Hosting plan needed for a custom domain",
    body: isAdmin
      ? "Connecting a custom domain needs an active hosting plan. Record the client's payment for the plan they chose. Publishing on the free address still works without this."
      : "Connecting your own domain needs an active hosting plan. You can still publish and share your free address without paying.",
  };
}

/** Explains why connecting a custom domain needs a hosting plan. */
export default function HostingRequiredCard({ hosting, isAdmin }: { hosting: WebsiteHosting; isAdmin: boolean }) {
  const { title, body } = reason(hosting, isAdmin);
  const status = hosting.subscription?.status;
  const isSuspended = status === "SUSPENDED";
  const isAwaiting = status === "AWAITING_PAYMENT";
  const Icon = isSuspended ? AlertCircle : Server;
  const tone = isSuspended
    ? "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20"
    : isAwaiting
      ? "bg-brand-soft text-brand ring-1 ring-brand/20"
      : "bg-canvas text-ink ring-1 ring-line-strong/60";

  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-xl border p-3 shadow-xs ${
        isSuspended ? "border-amber-200/80 bg-amber-50/20" : "border-line bg-surface"
      }`}
    >
      <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tone}`}>
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-ink">{title}</p>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${tone}`}>
            {isSuspended ? "Offline" : isAwaiting ? "Ready to activate" : "Required"}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-body">{body}</p>
      </div>
    </div>
  );
}
