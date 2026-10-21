import { describe, expect, it } from "vitest";
import { toHistoryPayload, type ChatMessage } from "./ai-chat-history.ts";

const message = (partial: Partial<ChatMessage> & Pick<ChatMessage, "role" | "content">): ChatMessage => ({
  id: crypto.randomUUID(),
  timestamp: "10:26",
  ...partial,
});

describe("toHistoryPayload", () => {
  it("includes the options offered with a clarification question", () => {
    const [entry] = toHistoryPayload([
      message({
        role: "assistant",
        content: "Which best matches your restaurant?",
        clarification: {
          question: "Which best matches your restaurant?",
          options: ["Italian trattoria", "Mexican taqueria"],
          allowCustomInput: true,
        },
      }),
    ]);
    expect(entry?.content).toBe(
      "Which best matches your restaurant?\nOptions offered: 1) Italian trattoria; 2) Mexican taqueria",
    );
  });

  it("marks failed requests and suggestion outcomes", () => {
    const [failed, proposed] = toHistoryPayload([
      message({ role: "user", content: "Casual Mexican taqueria", failed: true }),
      message({ role: "assistant", content: "Built the page", status: "rejected" }),
    ]);
    expect(failed?.content).toBe("Casual Mexican taqueria\n(This request failed; nothing was changed)");
    expect(proposed?.content).toBe("Built the page\n(The owner rejected this change; it isn't on the page)");
  });

  it("keeps only the last 10 messages and caps their length", () => {
    const messages = Array.from({ length: 12 }, (_, i) => message({ role: "user", content: `${i}`.repeat(4000) }));
    const payload = toHistoryPayload(messages);
    expect(payload).toHaveLength(10);
    expect(payload[0]?.content.startsWith("2")).toBe(true);
    expect(payload.every((entry) => entry.content.length <= 2900)).toBe(true);
  });
});
