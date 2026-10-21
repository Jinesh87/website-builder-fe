import { Button } from "@heroui/react";
import type { WebsiteHosting } from "../../api/hosting.ts";
import FormAlert from "../ui/FormAlert.tsx";
import { formatBillingDate } from "./hosting-labels.tsx";

/** Shown above the website dashboard when hosting needs attention; nothing while billing is off or all is paid. */
export default function HostingAlert({ hosting, onOpen }: { hosting: WebsiteHosting; onOpen: () => void }) {
  if (!hosting.enabled) return null;
  const { subscription } = hosting;

  let status: "warning" | "danger" = "warning";
  let message: string;
  if (subscription?.status === "SUSPENDED") {
    status = "danger";
    message = "This website is offline because hosting wasn't renewed. Pay to bring it back, with no changes.";
  } else if (subscription?.status === "GRACE" && subscription.graceEndsAt) {
    message = `Hosting expired. The website goes offline on ${formatBillingDate(subscription.graceEndsAt)} unless it's renewed.`;
  } else if (subscription?.status === "AWAITING_PAYMENT") {
    message = "A hosting plan is set up. Pay for it to publish this website.";
  } else if (!subscription && hosting.website.status !== "PUBLISHED") {
    message = "Choose a hosting plan to publish this website.";
  } else {
    return null;
  }

  return (
    <FormAlert status={status}>
      <span className="flex flex-wrap items-center justify-between gap-3">
        <span>{message}</span>
        <Button size="sm" variant="outline" onPress={onOpen}>
          Open hosting
        </Button>
      </span>
    </FormAlert>
  );
}
