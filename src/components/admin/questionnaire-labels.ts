import type { Questionnaire, QuestionnaireStatus } from "../../features/questionnaire/api.ts";

export const QUESTIONNAIRE_STATUSES: QuestionnaireStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "WEBSITE_CREATED",
  "DONE",
  "SPAM",
];

export const STATUS_META: Record<
  QuestionnaireStatus,
  {
    label: string;
    hint: string;
    dot: string;
    pill: string;
    tone: "brand" | "warning" | "success" | "default" | "danger";
  }
> = {
  NEW: {
    label: "New",
    hint: "Nobody has reviewed this brief yet",
    dot: "bg-brand",
    pill: "border-brand/25 bg-brand-soft text-brand",
    tone: "brand",
  },
  IN_PROGRESS: {
    label: "In progress",
    hint: "Requirements being reviewed or discussed",
    dot: "bg-amber-500",
    pill: "border-amber-200 bg-amber-50 text-amber-700",
    tone: "warning",
  },
  WEBSITE_CREATED: {
    label: "Website created",
    hint: "AI website generated from brief",
    dot: "bg-blue-500",
    pill: "border-blue-200 bg-blue-50 text-blue-700",
    tone: "success",
  },
  DONE: {
    label: "Done",
    hint: "Completed and delivered to client",
    dot: "bg-emerald-500",
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
    tone: "default",
  },
  SPAM: {
    label: "Spam",
    hint: "Junk brief, hidden from All",
    dot: "bg-zinc-400",
    pill: "border-line bg-canvas text-ink-muted",
    tone: "danger",
  },
};

export function emailNotSent(questionnaire: Questionnaire): boolean {
  return questionnaire.emailStatus === "FAILED";
}

export function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function timeAgo(iso: string): string {
  try {
    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
