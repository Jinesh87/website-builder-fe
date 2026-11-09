import { Button } from "@heroui/react";
import type { WebsiteHosting } from "../../api/hosting.ts";
import FormAlert from "../ui/FormAlert.tsx";
import { daysUntil, formatBillingDate } from "./hosting-labels.tsx";

function daysLeftPhrase(iso: string): string {
  const days = daysUntil(iso);
  if (days <= 0) return "ends today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

/** Shown above the website dashboard when hosting needs attention; nothing while billing is off or all is paid. */
export default function HostingAlert({ hosting, onOpen }: { hosting: WebsiteHosting; onOpen: () => void }) {
  const { subscription } = hosting;
  if (!subscription) return null;

  let status: "warning" | "danger" = "warning";
  let message: string | null = null;
  let actionLabel = "Open hosting";

  if (subscription.status === "SUSPENDED") {
    if (!hosting.enabled) return null;
    status = "danger";
    message =
      "Hosting wasn't renewed, so the custom domain is disconnected. Your free WebBuilder address stays live — renew to reconnect the custom domain.";
    actionLabel = "Renew hosting";
  } else if (subscription.status === "GRACE" && subscription.graceEndsAt) {
    const left = daysLeftPhrase(subscription.graceEndsAt);
    message = `Grace period: ${left}. On ${formatBillingDate(subscription.graceEndsAt)} the custom domain disconnects unless hosting is renewed. Your free address stays live.`;
    actionLabel = "Renew hosting";
  } else if (
    subscription.status === "ACTIVE" &&
    subscription.isComplimentary &&
    subscription.currentPeriodEnd
  ) {
    const left = daysLeftPhrase(subscription.currentPeriodEnd);
    message = `Free hosting period: ${left} (until ${formatBillingDate(subscription.currentPeriodEnd)}). Renew before then — free periods have no grace, and the custom domain disconnects when they end. Your free address stays live.`;
    actionLabel = "View hosting";
  } else if (!hosting.enabled) {
    return null;
  } else {
    // Unpaid / no-plan messages live on the Domains tab (HostingRequiredCard), not here.
    return null;
  }

  if (!message) return null;

  return (
    <FormAlert status={status}>
      <span className="flex flex-wrap items-center justify-between gap-3">
        <span>{message}</span>
        <Button size="sm" variant="outline" onPress={onOpen}>
          {actionLabel}
        </Button>
      </span>
    </FormAlert>
  );
}
