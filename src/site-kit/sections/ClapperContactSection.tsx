import { parseRichText } from "../rich-text.tsx";
import { useEffect, useState, type FormEvent } from "react";
import { EmailLink, PhoneLink, SectionShell } from "../primitives.tsx";
import { useStaticRender } from "../render-mode.tsx";
import { useContactEndpoint } from "../contact-endpoint.tsx";
import { fieldMaxLength } from "../contact-builder.ts";
import type { ContactData, SectionOf } from "../types.ts";
import { safeHref } from "../links.ts";

/** Hidden spam trap; the server drops submissions that fill it in. */
const HONEYPOT_FIELD = "_wb_hp";
/** A leading "Choose a range" budget option is a placeholder, not an answer. */
const BUDGET_PLACEHOLDER = /^choose\b/i;
const SEND_FAILED = "Your message couldn't be sent. Please try again.";

function errorFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const error = (body as { error?: unknown }).error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return undefined;
}

/** Matches the message static-runtime.js builds on the published site. */
function briefMessage(projectType: string, budget: string, story: string): string {
  const details = [projectType ? `Interested in: ${projectType}` : "", budget ? `Budget: ${budget}` : ""]
    .filter(Boolean)
    .join("\n");
  return details ? `${details}\n\n${story}` : story;
}

export default function ClapperContactSection({
  section,
}: {
  section: SectionOf<"contact">;
}) {
  const data = section.data as ContactData;
  const isStatic = useStaticRender();

  // Timecode
  const timecodeMode = data.timecodeMode ?? "live";
  const initialTimecode = data.timecode || "00:00:25:10";
  const [timecode, setTimecode] = useState<string>(initialTimecode);

  useEffect(() => {
    setTimecode(initialTimecode);
  }, [initialTimecode]);

  useEffect(() => {
    if (isStatic || timecodeMode === "static") return;
    const parts = initialTimecode.split(":");
    let hr = parts.length >= 4 ? parseInt(parts[0], 10) || 0 : 0;
    let min = parts.length >= 3 ? parseInt(parts[parts.length - 3], 10) || 0 : 0;
    let sec = parts.length >= 2 ? parseInt(parts[parts.length - 2], 10) : 25;
    if (isNaN(sec)) sec = 25;
    let frame = parts.length >= 1 ? parseInt(parts[parts.length - 1], 10) : 10;
    if (isNaN(frame)) frame = 10;

    const interval = setInterval(() => {
      frame++;
      if (frame >= 24) {
        frame = 0;
        sec = (sec + 1) % 60;
      }
      const h = String(hr).padStart(2, "0");
      const m = String(min).padStart(2, "0");
      const s = String(sec).padStart(2, "0");
      const f = String(frame).padStart(2, "0");
      setTimecode(`${h}:${m}:${s}:${f}`);
    }, 100);

    return () => clearInterval(interval);
  }, [isStatic, timecodeMode, initialTimecode]);

  // Form state
  const endpoint = useContactEndpoint();
  const fieldId = `clapper-${section.id}`;
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headingWords = (data.heading || "ROLL CAMERA").trim().split(/\s+/);
  const solidWord = data.solidHeading || headingWords[0] || "ROLL";
  const outlineWord =
    data.outlineHeading || headingWords.slice(1).join(" ") || "CAMERA";

  const defaultServiceOptions = [
    "MUSIC VIDEO",
    "BRAND FILM",
    "WEDDING / EVENT",
    "SHORT FILM",
    "DOCUMENTARY",
    "POST-PRODUCTION",
  ];
  const serviceOptions =
    data.serviceOptions && data.serviceOptions.length > 0
      ? data.serviceOptions
      : defaultServiceOptions;

  const defaultBudgetOptions = [
    "Choose a range",
    "Under $5,000",
    "$5,000 – $15,000",
    "$15,000 – $30,000",
    "$30,000+",
  ];
  const budgetOptions =
    data.budgetOptions && data.budgetOptions.length > 0
      ? data.budgetOptions
      : defaultBudgetOptions;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const url =
      endpoint || (typeof document !== "undefined" ? document.body.getAttribute("data-wb-contact") : null);
    if (!url) {
      setError("Messages are sent from the published site.");
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const payload = {
      name,
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      message: briefMessage(
        String(formData.get("service") || "").trim(),
        String(formData.get("budget") || "").trim(),
        String(formData.get("message") || "").trim(),
      ),
      [HONEYPOT_FIELD]: String(formData.get(HONEYPOT_FIELD) || ""),
    };

    setPending(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(errorFromBody(result) || SEND_FAILED);
      form.reset();
      setSubmittedName(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : SEND_FAILED);
    } finally {
      setPending(false);
    }
  };

  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className="wb-clapper-contact-wrap"
      label={data.heading || "Contact"}
      fullWidth
    >
      <div className="wb-container wb-clapper-container">
        {/* Top meta row */}
        <div className="wb-vr-work-meta-row">
          <span className="wb-vr-work-meta-left">{parseRichText(data.eyebrow || "CONTACT")}</span>
          <span className="wb-vr-work-rec">
            <span className="wb-vr-rec-dot" aria-hidden="true" />
            <span className="wb-vr-rec-text">{data.recText || "REC · TAKE 01"}</span>
          </span>
        </div>

        {/* Display Title: ROLL (solid) CAMERA (outline) */}
        <div className="wb-vr-work-title">
          <span className="wb-vr-work-solid">{solidWord}</span>
          <span className="wb-vr-work-outline">{outlineWord}</span>
        </div>

        {/* Subrow: typewriter paragraph on left, red digital timecode on right */}
        <div className="wb-vr-work-subrow">
          <p className="wb-vr-work-desc">
            {parseRichText(data.text ||
              "Tell us about your project. We reply within 24 hours with ideas, timing and a quote.")}
          </p>
          <div className="wb-vr-timecode" aria-label="Digital timecode">
            {timecode}
          </div>
        </div>

        {/* Main Content Grid: Clapperboard Slate on Left, Info Stack on Right */}
        <div className="wb-clapper-grid">
          {/* LEFT: 35mm Clapper Slate Form */}
          <div className="wb-clapper-card">
            {/* Top black & white chevron zebra stripes */}
            <div className="wb-clapper-stripes" aria-hidden="true" />

            {/* Published pages are static: both views are in the markup and static-runtime.js swaps them. */}
            <div className="wb-clapper-success" data-wb-clapper-success hidden={submittedName === null}>
              <span className="wb-clapper-success-icon">🎬</span>
              <h3 className="wb-clapper-success-title">SCENE RECORDED!</h3>
              <p className="wb-clapper-success-desc">
                Thanks <span data-wb-clapper-name>{submittedName || "there"}</span>! We've received your
                brief and will review your project details. You'll hear back within 1 business day.
              </p>
              <button
                type="button"
                className="wb-clapper-reset-btn"
                data-wb-clapper-reset
                onClick={() => setSubmittedName(null)}
              >
                Send another brief
              </button>
            </div>

            <form
              className="wb-clapper-form"
              data-wb-clapper-contact
              hidden={submittedName !== null}
              onSubmit={(event) => void handleSubmit(event)}
            >
              {/* Row 1: Name and Email */}
              <div className="wb-clapper-row wb-clapper-cols-2">
                <div className="wb-clapper-field wb-clapper-field-border-r">
                  <label htmlFor={`${fieldId}-name`} className="wb-clapper-label">
                    NAME *
                  </label>
                  <input
                    id={`${fieldId}-name`}
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={fieldMaxLength("text")}
                    className="wb-clapper-input"
                  />
                </div>
                <div className="wb-clapper-field">
                  <label htmlFor={`${fieldId}-email`} className="wb-clapper-label">
                    EMAIL *
                  </label>
                  <input
                    id={`${fieldId}-email`}
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={fieldMaxLength("email")}
                    className="wb-clapper-input"
                  />
                </div>
              </div>

              {/* Row 2: Phone and Budget */}
              <div className="wb-clapper-row wb-clapper-cols-2">
                <div className="wb-clapper-field wb-clapper-field-border-r">
                  <label htmlFor={`${fieldId}-phone`} className="wb-clapper-label">
                    PHONE
                  </label>
                  <input
                    id={`${fieldId}-phone`}
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    maxLength={fieldMaxLength("tel")}
                    className="wb-clapper-input"
                  />
                </div>
                <div className="wb-clapper-field">
                  <label htmlFor={`${fieldId}-budget`} className="wb-clapper-label">
                    BUDGET
                  </label>
                  <div className="wb-clapper-select-wrap">
                    <select
                      id={`${fieldId}-budget`}
                      name="budget"
                      defaultValue=""
                      className="wb-clapper-select"
                    >
                      {budgetOptions.map((opt, idx) => (
                        <option key={idx} value={idx === 0 && BUDGET_PLACEHOLDER.test(opt) ? "" : opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <span className="wb-clapper-select-arrow" aria-hidden="true">
                      ⌄
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3: Project Type Selection Pills */}
              <div className="wb-clapper-row wb-clapper-pill-row">
                <span className="wb-clapper-label" id={`${fieldId}-type`}>
                  PROJECT TYPE *
                </span>
                <div className="wb-clapper-pills" role="radiogroup" aria-labelledby={`${fieldId}-type`}>
                  {serviceOptions.map((opt, idx) => (
                    <label key={`${opt}-${idx}`} className="wb-clapper-pill-btn">
                      <input
                        type="radio"
                        name="service"
                        value={opt}
                        required={idx === 0}
                        className="wb-clapper-pill-input"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Row 4: Your Story Textarea */}
              <div className="wb-clapper-row wb-clapper-textarea-row">
                <label htmlFor={`${fieldId}-story`} className="wb-clapper-label">
                  YOUR STORY *
                </label>
                <textarea
                  id={`${fieldId}-story`}
                  name="message"
                  required
                  rows={4}
                  maxLength={fieldMaxLength("textarea")}
                  placeholder="Idea, date, location and where the video will be shown"
                  className="wb-clapper-textarea"
                />
              </div>

              <div className="wb-contact-hp" aria-hidden="true">
                <label>
                  Leave this field empty
                  <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              <p className="wb-clapper-status" role="status" data-wb-clapper-status hidden={!error}>
                {error}
              </p>

              {/* Row 5: Action Bottom Bar */}
              <div className="wb-clapper-action-bar">
                <span className="wb-clapper-scene-tag">
                  {data.sceneTakeLabel || "SCENE 01 · TAKE 01"}
                </span>
                <button type="submit" className="wb-clapper-submit-btn" disabled={pending}>
                  {pending ? "SENDING…" : data.submitLabel || "SEND IT ●"}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: Production Details Stack */}
          <div className="wb-clapper-details">
            {/* Email */}
            <div className="wb-clapper-detail-item">
              <span className="wb-clapper-detail-tag">EMAIL</span>
              <EmailLink
                value={(data.email || "hello@vintagereels.com").replace(/[[\]]/g, "")}
                className="wb-clapper-detail-val wb-clapper-detail-link"
              />
            </div>

            {/* Phone / Whatsapp */}
            <div className="wb-clapper-detail-item">
              <span className="wb-clapper-detail-tag">PHONE / WHATSAPP</span>
              <PhoneLink
                value={(data.phone || "+91 98201 44520").replace(/[[\]]/g, "")}
                className="wb-clapper-detail-val wb-clapper-detail-link"
              />
            </div>

            {/* Studio */}
            <div className="wb-clapper-detail-item">
              <span className="wb-clapper-detail-tag">STUDIO</span>
              <span className="wb-clapper-detail-val">
                {(data.address || "14 Film City Rd, Goregaon East, Mumbai 400065").replace(/[[\]]/g, "")}
              </span>
            </div>

            {/* Hours */}
            <div className="wb-clapper-detail-item">
              <span className="wb-clapper-detail-tag">HOURS</span>
              <span className="wb-clapper-detail-val">
                {(data.officeHours || "Mon–Sat, 10:00–19:00").replace(/[[\]]/g, "")}
              </span>
            </div>

            {/* Follow */}
            <div className="wb-clapper-detail-item wb-clapper-detail-last">
              <span className="wb-clapper-detail-tag">FOLLOW</span>
              <div className="wb-clapper-detail-val wb-clapper-follow-row">
                {(() => {
                  const raw = (data.socialLinksText || "Instagram · YouTube · Vimeo").replace(/[[\]]/g, "");
                  const items = raw.split("·").map((s) => s.trim()).filter(Boolean);
                  return items.map((item, idx) => {
                    const clean = item.replace(/[[\]]/g, "").toLowerCase();
                    const href = clean.includes("insta")
                      ? "https://instagram.com"
                      : clean.includes("youtu")
                        ? "https://youtube.com"
                        : clean.includes("vimeo")
                          ? "https://vimeo.com"
                          : clean.includes("x.com") || clean.includes("twitter")
                            ? "https://x.com"
                            : "#";
                    return (
                      <span key={idx} className="wb-clapper-follow-item">
                        {idx > 0 && <span className="wb-clapper-follow-sep"> · </span>}
                        <a
                          href={safeHref(href)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="wb-clapper-detail-val wb-clapper-detail-link"
                        >
                          {item}
                        </a>
                      </span>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

