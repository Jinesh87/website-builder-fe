import type { Enquiry, EnquiryStatus } from "../../api/admin-enquiries.ts";

export const ENQUIRY_STATUSES: EnquiryStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"];

export const STATUS_META: Record<EnquiryStatus, { label: string; hint: string; dot: string; pill: string }> = {
  NEW: {
    label: "New",
    hint: "Nobody has handled it yet",
    dot: "bg-brand",
    pill: "border-brand/25 bg-brand-soft text-brand",
  },
  IN_PROGRESS: {
    label: "In progress",
    hint: "Replied or called, conversation going",
    dot: "bg-amber-500",
    pill: "border-amber-200 bg-amber-50 text-amber-700",
  },
  RESOLVED: {
    label: "Resolved",
    hint: "Done: answered, converted or closed",
    dot: "bg-emerald-500",
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  SPAM: {
    label: "Spam",
    hint: "Junk, hidden from All",
    dot: "bg-zinc-400",
    pill: "border-line bg-canvas text-ink-muted",
  },
};

export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Mail clients truncate very long mailto links, so the quoted original is capped. */
const QUOTE_MAX = 1200;

/** Opens the admin's mail app with the subject and the original message quoted. */
export function replyHref(enquiry: Pick<Enquiry, "email" | "name" | "subject" | "message" | "createdAt">): string {
  const original =
    enquiry.message.length > QUOTE_MAX ? `${enquiry.message.slice(0, QUOTE_MAX)}…` : enquiry.message;
  const quoted = original
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const body = `Hi ${enquiry.name.split(" ")[0]},\n\n\n\nOn ${formatWhen(enquiry.createdAt)}, ${enquiry.name} wrote:\n${quoted}`;
  const params = new URLSearchParams({ subject: `Re: ${enquiry.subject}`, body });
  return `mailto:${enquiry.email}?${params.toString().replace(/\+/g, "%20")}`;
}

export function emailNotSent(enquiry: Pick<Enquiry, "emailStatus">): boolean {
  return enquiry.emailStatus === "FAILED" || enquiry.emailStatus === "SKIPPED";
}
