import { useEffect, useState, type FormEvent } from "react";
import { SectionShell } from "../primitives.tsx";
import { useStaticRender } from "../render-mode.tsx";
import type { ContactData, SectionOf } from "../types.ts";
import { safeHref } from "../links.ts";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("Choose a range");
  const [projectType, setProjectType] = useState<string>("");
  const [story, setStory] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
          <span className="wb-vr-work-meta-left">{data.eyebrow || "CONTACT"}</span>
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
            {data.text ||
              "Tell us about your project. We reply within 24 hours with ideas, timing and a quote."}
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

            {submitted ? (
              <div className="wb-clapper-success">
                <span className="wb-clapper-success-icon">🎬</span>
                <h3 className="wb-clapper-success-title">SCENE RECORDED!</h3>
                <p className="wb-clapper-success-desc">
                  Thanks {name || "there"}! We've received your brief and will review your project
                  details. You'll hear back within 1 business day.
                </p>
                <button
                  type="button"
                  className="wb-clapper-reset-btn"
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setEmail("");
                    setPhone("");
                    setStory("");
                  }}
                >
                  Send another brief
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="wb-clapper-form">
                {/* Row 1: Name and Email */}
                <div className="wb-clapper-row wb-clapper-cols-2">
                  <div className="wb-clapper-field wb-clapper-field-border-r">
                    <label htmlFor="clapper-name" className="wb-clapper-label">
                      NAME *
                    </label>
                    <input
                      id="clapper-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="wb-clapper-input"
                    />
                  </div>
                  <div className="wb-clapper-field">
                    <label htmlFor="clapper-email" className="wb-clapper-label">
                      EMAIL *
                    </label>
                    <input
                      id="clapper-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="wb-clapper-input"
                    />
                  </div>
                </div>

                {/* Row 2: Phone and Budget */}
                <div className="wb-clapper-row wb-clapper-cols-2">
                  <div className="wb-clapper-field wb-clapper-field-border-r">
                    <label htmlFor="clapper-phone" className="wb-clapper-label">
                      PHONE
                    </label>
                    <input
                      id="clapper-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="wb-clapper-input"
                    />
                  </div>
                  <div className="wb-clapper-field">
                    <label htmlFor="clapper-budget" className="wb-clapper-label">
                      BUDGET
                    </label>
                    <div className="wb-clapper-select-wrap">
                      <select
                        id="clapper-budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="wb-clapper-select"
                      >
                        {budgetOptions.map((opt, idx) => (
                          <option key={idx} value={opt}>
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
                  <span className="wb-clapper-label">PROJECT TYPE *</span>
                  <div className="wb-clapper-pills" role="radiogroup" aria-label="Project Type">
                    {serviceOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`wb-clapper-pill-btn ${projectType === opt ? "active" : ""}`}
                        onClick={() => setProjectType((prev) => (prev === opt ? "" : opt))}
                        role="radio"
                        aria-checked={projectType === opt}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 4: Your Story Textarea */}
                <div className="wb-clapper-row wb-clapper-textarea-row">
                  <label htmlFor="clapper-story" className="wb-clapper-label">
                    YOUR STORY *
                  </label>
                  <textarea
                    id="clapper-story"
                    required
                    rows={4}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Idea, date, location and where the video will be shown"
                    className="wb-clapper-textarea"
                  />
                </div>

                {/* Row 5: Action Bottom Bar */}
                <div className="wb-clapper-action-bar">
                  <span className="wb-clapper-scene-tag">
                    {data.sceneTakeLabel || "SCENE 01 · TAKE 01"}
                  </span>
                  <button type="submit" className="wb-clapper-submit-btn">
                    {data.submitLabel || "SEND IT ●"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT: Production Details Stack */}
          <div className="wb-clapper-details">
            {/* Email */}
            <div className="wb-clapper-detail-item">
              <span className="wb-clapper-detail-tag">EMAIL</span>
              <a
                href={safeHref(
                  `mailto:${(data.email || "hello@vintagereels.com").replace(/[[\]]/g, "")}`
                )}
                className="wb-clapper-detail-val wb-clapper-detail-link"
              >
                {(data.email || "hello@vintagereels.com").replace(/[[\]]/g, "")}
              </a>
            </div>

            {/* Phone / Whatsapp */}
            <div className="wb-clapper-detail-item">
              <span className="wb-clapper-detail-tag">PHONE / WHATSAPP</span>
              <a
                href={safeHref(
                  `tel:${(data.phone || "+91 98201 44520").replace(/[^0-9+]/g, "")}`
                )}
                className="wb-clapper-detail-val wb-clapper-detail-link"
              >
                {(data.phone || "+91 98201 44520").replace(/[[\]]/g, "")}
              </a>
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

