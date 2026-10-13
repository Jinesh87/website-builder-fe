import { useEffect, useState } from "react";
import type { FooterData, HeaderData, Section, ThemeSettings } from "../../../site-kit/index.ts";
import type { AiClarification, AiSuggestion } from "../schema/editor-document.ts";
import type { WebsitePage } from "../../../api/websites.ts";

/** How long an accepted AI change can be rolled back. */
export const ROLLBACK_WINDOW_MS = 10 * 60 * 1000;

export type SuggestionStatus = "pending" | "accepted" | "rejected" | "rolled_back";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestion?: AiSuggestion | null;
  chatReply?: string | null;
  clarification?: AiClarification | null;
  status?: SuggestionStatus;
  acceptedAt?: number;
  /** Canvas before/after the accepted change; only the latest accepted change keeps one. */
  rollback?: {
    before: Section[];
    after: Section[];
    /** Page SEO before an accepted AI SEO change. */
    seo?: { pageId: string; seoTitle: string | null; seoDescription: string | null };
    /** Full draft snapshot for site-wide or multi-page rollbacks. */
    draft?: {
      pages: WebsitePage[];
      header: HeaderData;
      footer: FooterData;
      theme: ThemeSettings;
    };
  };
};

export type ChatSession = {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
};

export function rollbackRemainingMs(message: ChatMessage, now: number): number {
  if (message.status !== "accepted" || !message.rollback || message.acceptedAt === undefined) return 0;
  return Math.max(0, message.acceptedAt + ROLLBACK_WINDOW_MS - now);
}

/** Drops rollback snapshots whose window has passed so localStorage stays small. */
export function pruneExpiredRollbacks(messages: ChatMessage[], now: number): ChatMessage[] {
  return messages.map((m) => (m.rollback && rollbackRemainingMs(m, now) === 0 ? { ...m, rollback: undefined } : m));
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Current time, re-rendered every second only while `active`. */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  return now;
}
