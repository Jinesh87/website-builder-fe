import type { QuestionnaireStatus } from "../../features/questionnaire/api.ts";

export const QUESTIONNAIRE_STATUSES: QuestionnaireStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "WEBSITE_CREATED",
  "DONE",
  "SPAM",
];

export const STATUS_META: Record<
  QuestionnaireStatus,
  { label: string; tone: "brand" | "warning" | "success" | "default" | "danger" }
> = {
  NEW: { label: "New", tone: "brand" },
  IN_PROGRESS: { label: "In progress", tone: "warning" },
  WEBSITE_CREATED: { label: "Website created", tone: "success" },
  DONE: { label: "Done", tone: "default" },
  SPAM: { label: "Spam", tone: "danger" },
};

export function formatWhen(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return isoDate;
  }
}

export function timeAgo(isoDate: string): string {
  try {
    const elapsed = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(elapsed / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatWhen(isoDate);
  } catch {
    return isoDate;
  }
}

