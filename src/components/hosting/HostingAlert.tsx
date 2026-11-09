import { Button } from "@heroui/react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@heroui/styles";
import type { HostingStatus, WebsiteHosting } from "../../api/hosting.ts";
import type { WebsiteHostingAttention } from "../../api/websites.ts";
import FormAlert from "../ui/FormAlert.tsx";
import { daysUntil, formatBillingDate } from "./hosting-labels.tsx";

function daysLeftPhrase(iso: string): string {
  const days = daysUntil(iso);
  if (days <= 0) return "ends today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

export type HostingAlertSource = {
  websiteId: string;
  /** When set (e.g. client dashboard), the message names this website. */
  websiteName?: string;
  enabled: boolean;
  subscription: {
    status: HostingStatus;
    isComplimentary: boolean;
    currentPeriodEnd: string | null;
    graceEndsAt: string | null;
  } | null;
};

export function hostingAlertFromWebsite(hosting: WebsiteHosting): HostingAlertSource {
  return {
    websiteId: hosting.website.id,
    enabled: hosting.enabled,
    subscription: hosting.subscription
      ? {
          status: hosting.subscription.status,
          isComplimentary: hosting.subscription.isComplimentary,
          currentPeriodEnd: hosting.subscription.currentPeriodEnd,
          graceEndsAt: hosting.subscription.graceEndsAt,
        }
      : null,
  };
}

export function hostingAlertFromAttention(
  websiteId: string,
  websiteName: string,
  attention: WebsiteHostingAttention,
): HostingAlertSource {
  return {
    websiteId,
    websiteName,
    enabled: attention.billingEnabled,
    subscription: {
      status: attention.status,
      isComplimentary: attention.isComplimentary,
      currentPeriodEnd: attention.currentPeriodEnd,
      graceEndsAt: attention.graceEndsAt,
    },
  };
}

export function resolveHostingAlert(source: HostingAlertSource): {
  status: "warning" | "danger";
  message: string;
  actionLabel: string;
} | null {
  const { subscription, websiteName } = source;
  if (!subscription) return null;

  const forSite = websiteName ? ` for ${websiteName}` : "";
  let status: "warning" | "danger" = "warning";
  let message: string | null = null;
  let actionLabel = "Open hosting";

  if (subscription.status === "SUSPENDED") {
    if (!source.enabled) return null;
    status = "danger";
    message = websiteName
      ? `Hosting wasn't renewed for ${websiteName}, so its custom domain is disconnected. The free WebBuilder address stays live — renew to reconnect the custom domain.`
      : "Hosting wasn't renewed, so the custom domain is disconnected. Your free WebBuilder address stays live — renew to reconnect the custom domain.";
    actionLabel = "Renew hosting";
  } else if (subscription.status === "GRACE" && subscription.graceEndsAt) {
    const left = daysLeftPhrase(subscription.graceEndsAt);
    message = websiteName
      ? `Grace period${forSite}: ${left}. On ${formatBillingDate(subscription.graceEndsAt)} the custom domain disconnects unless hosting is renewed. The free address stays live.`
      : `Grace period: ${left}. On ${formatBillingDate(subscription.graceEndsAt)} the custom domain disconnects unless hosting is renewed. Your free address stays live.`;
    actionLabel = "Renew hosting";
  } else if (subscription.status === "ACTIVE" && subscription.isComplimentary && subscription.currentPeriodEnd) {
    const left = daysLeftPhrase(subscription.currentPeriodEnd);
    message = websiteName
      ? `Free hosting period for ${websiteName}: ${left} (until ${formatBillingDate(subscription.currentPeriodEnd)}). Renew before then — free periods have no grace, and the custom domain disconnects when they end. The free address stays live.`
      : `Free hosting period: ${left} (until ${formatBillingDate(subscription.currentPeriodEnd)}). Renew before then — free periods have no grace, and the custom domain disconnects when they end. Your free address stays live.`;
    actionLabel = "View hosting";
  } else if (!source.enabled) {
    return null;
  } else {
    return null;
  }

  if (!message) return null;
  return { status, message, actionLabel };
}

type HostingAlertProps = {
  source: HostingAlertSource;
  /** Prefer href on multi-site dashboards; onOpen for in-page tab switches. */
  href?: string;
  onOpen?: () => void;
};

/** Hosting attention banner for a website dashboard or the client home dashboard. */
export default function HostingAlert({ source, href, onOpen }: HostingAlertProps) {
  const alert = resolveHostingAlert(source);
  if (!alert) return null;

  const action = href ? (
    <Link to={href} className={buttonVariants({ size: "sm", variant: "outline" })}>
      {alert.actionLabel}
    </Link>
  ) : (
    <Button size="sm" variant="outline" onPress={onOpen}>
      {alert.actionLabel}
    </Button>
  );

  return (
    <FormAlert status={alert.status}>
      <span className="flex flex-wrap items-center justify-between gap-3">
        <span>{alert.message}</span>
        {action}
      </span>
    </FormAlert>
  );
}
