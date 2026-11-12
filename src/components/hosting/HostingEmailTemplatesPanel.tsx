import { useEffect, useMemo, useRef, useState, type ReactNode, type UIEvent } from "react";
import { Button, Label, Spinner, Switch } from "@heroui/react";
import { Mail } from "lucide-react";
import {
  adminHostingApi,
  type HostingEmailKind,
  type HostingEmailTemplate,
} from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import FormAlert from "../ui/FormAlert.tsx";

const SAMPLE: Record<string, string> = {
  websiteName: "rock",
  clientName: "Acme Studio",
  renewalDate: "20 Nov 2026",
  graceEndsAt: "23 Nov 2026",
  priceSuffix: " (₹4,999)",
  price: "₹4,999",
  renewalNote: "Renew it from the website's Hosting tab before 20 Nov 2026 to keep the site live.",
  packageName: "Starter hosting",
  period: "20 Nov 2026 – 20 Feb 2027",
  amount: "₹4,999",
  restoredNote: "The site is live again.",
  reasonDetail:
    "Razorpay couldn't take the hosting payment for rock, so autopay has stopped.\n\nRenew from the website's Hosting tab, or turn autopay on again with another card or UPI ID.",
};

const PLACEHOLDER_LABELS: Record<string, string> = {
  "{{websiteName}}": "Website name",
  "{{clientName}}": "Client name",
  "{{renewalDate}}": "Renewal date",
  "{{graceEndsAt}}": "Grace end date",
  "{{priceSuffix}}": "Price in brackets",
  "{{price}}": "Price",
  "{{renewalNote}}": "How it renews",
  "{{packageName}}": "Package name",
  "{{period}}": "Billing period",
  "{{amount}}": "Amount paid",
  "{{restoredNote}}": "Restored note",
  "{{reasonDetail}}": "Autopay stop reason",
};

function fill(template: string): string {
  let out = template;
  for (const [key, value] of Object.entries(SAMPLE)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  return out;
}

function appendToken(value: string, token: string): string {
  if (!value.trim()) return token;
  const needsSpace = !/\s$/.test(value);
  return `${value}${needsSpace ? " " : ""}${token}`;
}

const TOKEN_RE = /(\{\{[a-zA-Z0-9_]+\}\})/g;

function highlightTokens(text: string): ReactNode[] {
  if (!text) return ["\u00a0"];
  return text.split(TOKEN_RE).map((part, index) => {
    if (/^\{\{[a-zA-Z0-9_]+\}\}$/.test(part)) {
      // No padding / weight change — those shift glyph width vs the transparent input and
      // make the caret un-placeable right after a closing "}}".
      return (
        <mark
          key={index}
          className="rounded-[3px] bg-sky-100 text-sky-800"
          style={{ boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}
        >
          {part}
        </mark>
      );
    }
    return <span key={index}>{part.length ? part : "\u00a0"}</span>;
  });
}

function HighlightedField({
  label,
  name,
  value,
  onChange,
  rows,
  description,
  isDisabled,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  description?: string;
  isDisabled?: boolean;
}) {
  const multiline = Boolean(rows && rows > 1);
  const mirrorRef = useRef<HTMLDivElement>(null);
  // Identical typography on mirror + control so click/caret positions line up with highlights.
  const type =
    "box-border w-full border border-ed-border bg-transparent p-3 font-sans text-sm font-normal leading-5 tracking-normal shadow-ed-xs";

  function syncScroll(event: UIEvent<HTMLTextAreaElement | HTMLInputElement>) {
    const mirror = mirrorRef.current;
    if (!mirror) return;
    mirror.scrollTop = event.currentTarget.scrollTop;
    mirror.scrollLeft = event.currentTarget.scrollLeft;
  }

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <div
          ref={mirrorRef}
          aria-hidden
          className={`pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words rounded-lg text-ink ${type}`}
        >
          {highlightTokens(value)}
          {/* Trailing space so the caret can sit after a tag that ends the value. */}
          <span className="inline-block w-px">{"\u200b"}</span>
        </div>
        {multiline ? (
          <textarea
            id={name}
            name={name}
            rows={rows}
            value={value}
            disabled={isDisabled}
            onChange={(event) => onChange(event.target.value)}
            onScroll={syncScroll}
            spellCheck={false}
            className={`relative z-10 min-h-[10.5rem] resize-y overflow-auto rounded-lg caret-sky-700 text-transparent selection:bg-sky-200/60 selection:text-transparent focus:border-ed-accent focus:outline-none focus:ring-2 focus:ring-ed-accent/15 disabled:cursor-not-allowed disabled:opacity-60 ${type}`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type="text"
            value={value}
            disabled={isDisabled}
            onChange={(event) => onChange(event.target.value)}
            onScroll={syncScroll}
            spellCheck={false}
            className={`relative z-10 h-11 rounded-lg caret-sky-700 text-transparent selection:bg-sky-200/60 selection:text-transparent focus:border-ed-accent focus:outline-none focus:ring-2 focus:ring-ed-accent/15 disabled:cursor-not-allowed disabled:opacity-60 ${type}`}
          />
        )}
      </div>
      {description && <p className="mt-1 text-xs text-ink-muted">{description}</p>}
    </div>
  );
}

export default function HostingEmailTemplatesPanel() {
  const [templates, setTemplates] = useState<HostingEmailTemplate[] | null>(null);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [selected, setSelected] = useState<HostingEmailKind>("renewal_reminder");
  const [draft, setDraft] = useState<HostingEmailTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminHostingApi
      .emailTemplates()
      .then((data) => {
        if (cancelled) return;
        setTemplates(data.templates);
        setPlaceholders(data.placeholders);
        const first =
          data.templates.find((row) => row.kind === "renewal_reminder") ?? data.templates[0] ?? null;
        setSelected(first?.kind ?? "renewal_reminder");
        setDraft(first);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!templates) return;
    const next = templates.find((row) => row.kind === selected) ?? null;
    setDraft(next);
    setMessage(null);
  }, [selected, templates]);

  const preview = useMemo(() => {
    if (!draft) return null;
    return {
      subject: fill(draft.subject),
      heading: fill(draft.heading),
      message: fill(draft.message),
    };
  }, [draft]);

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const template = await adminHostingApi.updateEmailTemplate(draft.kind, {
        enabled: draft.enabled,
        subject: draft.subject,
        heading: draft.heading,
        message: draft.message,
      });
      setTemplates((current) =>
        (current ?? []).map((row) => (row.kind === template.kind ? template : row)),
      );
      setDraft(template);
      setMessage("Email template saved.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    if (!draft) return;
    setResetting(true);
    setError(null);
    setMessage(null);
    try {
      const template = await adminHostingApi.resetEmailTemplate(draft.kind);
      setTemplates((current) =>
        (current ?? []).map((row) => (row.kind === template.kind ? template : row)),
      );
      setDraft(template);
      setMessage("Restored the default message.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setResetting(false);
    }
  }

  if (error && !templates) return <FormAlert status="danger">{error}</FormAlert>;
  if (!templates || !draft) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner aria-label="Loading hosting emails" />
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-6 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Mail className="size-5" aria-hidden />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-ink">Hosting emails</h2>
          <p className="text-xs text-ink-muted">
            Customize the messages clients get for renewals, expiry, and related hosting notices. Use placeholders for
            website names and dates.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {templates.map((row) => (
          <button
            key={row.kind}
            type="button"
            onClick={() => setSelected(row.kind)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              selected === row.kind
                ? "bg-brand text-white"
                : "bg-surface-muted text-ink-body hover:bg-line/60"
            }`}
          >
            {row.kindLabel}
            {!row.enabled && <span className="ml-1 opacity-70">· off</span>}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">{draft.kindLabel}</p>
              <p className="text-xs text-ink-muted">
                {draft.isDefault ? "Using the built-in default" : "Customized"}
                {draft.updatedAt ? ` · saved ${new Date(draft.updatedAt).toLocaleString("en-IN")}` : ""}
              </p>
            </div>
            <Switch
              isSelected={draft.enabled}
              onChange={(enabled) => setDraft({ ...draft, enabled })}
            >
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Label className="text-sm text-ink">Send this email</Label>
              </Switch.Content>
            </Switch>
          </div>

          <HighlightedField
            label="Subject"
            name="subject"
            value={draft.subject}
            onChange={(subject) => setDraft({ ...draft, subject })}
            isDisabled={saving || resetting}
          />
          <HighlightedField
            label="Title"
            name="heading"
            value={draft.heading}
            onChange={(heading) => setDraft({ ...draft, heading })}
            isDisabled={saving || resetting}
          />
          <HighlightedField
            label="Message"
            name="message"
            value={draft.message}
            onChange={(message) => setDraft({ ...draft, message })}
            rows={8}
            isDisabled={saving || resetting}
            description="Separate paragraphs with a blank line. Highlighted {{tags}} are replaced when the email is sent."
          />

          <div>
            <Label className="text-xs text-ink-muted">Insert placeholder</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {placeholders.map((token) => (
                <button
                  key={token}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-xs text-ink-body hover:bg-sky-100"
                  onClick={() => setDraft({ ...draft, message: appendToken(draft.message, token) })}
                  title={token}
                >
                  <span>{PLACEHOLDER_LABELS[token] ?? token}</span>
                  <code className="rounded bg-sky-100 px-1 font-semibold text-sky-800">{token}</code>
                </button>
              ))}
            </div>
          </div>

          {(error || message) && (
            <FormAlert status={error ? "danger" : "success"}>{error ?? message}</FormAlert>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button onPress={() => void save()} isPending={saving} isDisabled={resetting}>
              Save template
            </Button>
            <Button variant="outline" onPress={() => void reset()} isPending={resetting} isDisabled={saving || draft.isDefault}>
              Reset to default
            </Button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Preview</p>
          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
            <div className="border-b border-line bg-surface-muted px-4 py-2 text-xs text-ink-muted">
              Subject: <span className="text-ink">{preview?.subject}</span>
            </div>
            <div className="px-4 py-4">
              <h4 className="text-base font-semibold text-ink">{preview?.heading}</h4>
              <p className="mt-2 text-sm text-ink-muted">Hi there,</p>
              <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-body">
                {preview?.message}
              </div>
              <div className="mt-4 inline-block rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white">
                Open hosting
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
