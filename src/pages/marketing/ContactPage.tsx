import { useRef, useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { errorMessage, request } from "../../api/http.ts";
import Icon, { type IconName } from "./Icon.tsx";
import { prefersReducedMotion, useMarketing } from "./marketing-context.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOPICS: [topic: string, tile: string, icon: IconName, title: string, text: string, action: string][] = [
  [
    "Plans and pricing",
    "c0",
    "chat",
    "Sales & Inquiries",
    "Plans, pricing and custom sites. Direct to support@bytezoracoders.com",
    "Message sales →",
  ],
  ["Technical support", "c2", "help", "Support", "Help with your account, editor or publishing.", "Get support →"],
  ["Partnership", "c1", "handshake", "Partnerships", "Agencies, resellers and integrations.", "Partner with us →"],
];

const EMPTY_FORM = { name: "", email: "", phone: "", subject: "General question", message: "" };
type ContactForm = typeof EMPTY_FORM;
type ContactErrors = Partial<Record<"name" | "email" | "message", string>>;

const fieldId = { name: "c-name", email: "c-email", message: "c-msg" };

const narrowQuery = window.matchMedia("(max-width:820px)");
const subscribeNarrow = (onChange: () => void) => {
  narrowQuery.addEventListener("change", onChange);
  return () => narrowQuery.removeEventListener("change", onChange);
};

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <span className="err" id={`${id}-err`} hidden={!message}>
      {message}
    </span>
  );
}

export default function ContactPage() {
  const { toast } = useMarketing();
  const narrow = useSyncExternalStore(subscribeNarrow, () => narrowQuery.matches);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sent, setSent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update =
    (key: keyof ContactForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const invalid = (key: keyof ContactErrors) =>
    key in errors
      ? { "aria-invalid": Boolean(errors[key]), "aria-describedby": errors[key] ? `${fieldId[key]}-err` : undefined }
      : {};

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    const next: ContactErrors = {
      name: form.name.trim() ? "" : "Enter your name.",
      email: EMAIL.test(form.email.trim()) ? "" : "Enter a valid email, like name@business.com.",
      message: form.message.trim().length >= 10 ? "" : "Write at least 10 characters so we can help.",
    };
    setErrors(next);
    const firstInvalid = (Object.keys(next) as (keyof ContactErrors)[]).find((key) => next[key]);
    if (firstInvalid) {
      document.getElementById(fieldId[firstInvalid])?.focus();
      return;
    }

    try {
      setSubmitting(true);
      const { emailDispatched } = await request<{ ok: boolean; message: string; emailDispatched: boolean }>("/contact", {
        method: "POST",
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          subject: form.subject || "General question",
          message: form.message.trim(),
        },
      });

      const firstName = form.name.trim().split(" ")[0];
      const replyNote = `We will get back to you at ${form.email.trim()} within 2–4 hours.`;
      setSent(
        emailDispatched
          ? `Thank you, ${firstName}! Your inquiry was delivered directly to support@bytezoracoders.com. ${replyNote}`
          : `Thank you, ${firstName}! Your inquiry has been received. ${replyNote}`,
      );
      toast(emailDispatched ? "Inquiry sent to support@bytezoracoders.com" : "Inquiry received");
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (err: unknown) {
      const message = errorMessage(
        err,
        "Failed to send your message. Please try again or reach us directly at Support@bytezoracoders.com.",
      );
      setSubmitError(message);
      toast(message);
    } finally {
      setSubmitting(false);
    }
  }

  function pickTopic(topic: string) {
    setForm((current) => ({ ...current, subject: topic }));
    formRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 400);
    toast(`Subject set to "${topic}"`);
  }

  return (
    <div className="view" data-view="contact">
      <div className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Contact</div>
          <h1>Talk to us</h1>
          <p className="lead">
            Questions about the platform, plans or getting started? Pick a topic or send a message. We reply by email.
          </p>
          <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
            <Link
              to="/start"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "#ffffff",
                padding: "8px 18px",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "13px",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
              }}
            >
              Get your website →
            </Link>
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>
              Prefer an AI-built site? Complete our 3-minute questionnaire
            </span>
          </div>
        </div>
      </div>
      <section style={{ paddingBottom: "0" }}>
        <div className="wrap grid g3">
          {TOPICS.map(([topic, tile, icon, title, text, action]) => (
            <button key={topic} type="button" className="card topic" onClick={() => pickTopic(topic)}>
              <span className={`tile ${tile}`}>
                <Icon name={icon} className="ico" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
              <em>{action}</em>
            </button>
          ))}
        </div>
      </section>
      <section>
        <div
          className="wrap"
          style={{
            display: "grid",
            gridTemplateColumns: narrow ? "minmax(0,1fr)" : "minmax(0,3fr) minmax(0,2fr)",
            gap: "28px",
            alignItems: "stretch",
          }}
        >
          <div
            className="card"
            style={{
              padding: narrow ? "24px 20px" : "32px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <form
              ref={formRef}
              noValidate
              onSubmit={submit}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                justifyContent: "space-between",
                gap: "18px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "22px", margin: "0 0 6px" }}>Send a message</h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    background: "var(--accent-soft)",
                    border: "1px solid var(--line-2)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "var(--fg)",
                    lineHeight: 1.4,
                    marginTop: "10px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "var(--accent)",
                      color: "#ffffff",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
                    ✉
                  </span>
                  <span>
                    Inquiries route directly to our sales inbox at{" "}
                    <a
                      href="mailto:support@bytezoracoders.com"
                      style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "underline" }}
                    >
                      support@bytezoracoders.com
                    </a>
                  </span>
                </div>
              </div>

              <div className="grid g2" style={{ gap: "16px" }}>
                <div className="fld">
                  <label htmlFor="c-name">Full name</label>
                  <input
                    id="c-name"
                    ref={nameRef}
                    className="in"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={update("name")}
                    {...invalid("name")}
                  />
                  <FieldError id="c-name" message={errors.name} />
                </div>
                <div className="fld">
                  <label htmlFor="c-email">Email</label>
                  <input
                    id="c-email"
                    className="in"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={update("email")}
                    {...invalid("email")}
                  />
                  <FieldError id="c-email" message={errors.email} />
                </div>
                <div className="fld">
                  <label htmlFor="c-phone">Phone (optional)</label>
                  <input
                    id="c-phone"
                    className="in"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={update("phone")}
                  />
                </div>
                <div className="fld">
                  <label htmlFor="c-subject">Subject</label>
                  <select id="c-subject" className="in" value={form.subject} onChange={update("subject")}>
                    <option>General question</option>
                    <option>Plans and pricing</option>
                    <option>Technical support</option>
                    <option>Partnership</option>
                  </select>
                </div>
              </div>

              <div className="fld" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <label htmlFor="c-msg">Message</label>
                <textarea
                  id="c-msg"
                  className="in"
                  required
                  rows={4}
                  style={{ flex: 1, minHeight: "120px", resize: "vertical" }}
                  value={form.message}
                  onChange={update("message")}
                  {...invalid("message")}
                />
                <FieldError id="c-msg" message={errors.message} />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                  marginTop: "auto",
                  paddingTop: "6px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "220px" }}>
                  <span className="hint" style={{ fontSize: "12.5px" }}>
                    Direct route: <strong style={{ color: "var(--fg)" }}>support@bytezoracoders.com</strong>
                  </span>
                  <span className="hint" style={{ fontSize: "12px" }}>
                    We usually reply within 2–4 hours during business days.
                  </span>
                </div>
                <button
                  className="btn p lg"
                  type="submit"
                  disabled={submitting}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", minWidth: "150px", justifyContent: "center" }}
                >
                  {submitting ? (
                    <>
                      <span
                        style={{
                          display: "inline-block",
                          width: "14px",
                          height: "14px",
                          border: "2px solid currentColor",
                          borderRightColor: "transparent",
                          borderRadius: "50%",
                          animation: "mk-spin 0.8s linear infinite",
                        }}
                      />
                      Sending...
                    </>
                  ) : (
                    "Send message"
                  )}
                </button>
              </div>

              {sent && (
                <div
                  className="note ok"
                  role="status"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    lineHeight: "1.5",
                  }}
                >
                  <span style={{ marginTop: "2px", flexShrink: 0, display: "inline-flex" }}>
                    <Icon name="check" className="ico" />
                  </span>
                  <div>{sent}</div>
                </div>
              )}
              {submitError && (
                <div className="note err" role="alert">
                  {submitError}
                </div>
              )}
            </form>
          </div>

          <div
            className="card"
            style={{
              padding: narrow ? "24px 20px" : "32px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              justifyContent: "space-between",
              gap: "18px",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: "4px",
                }}
              >
                Direct Contact
              </div>
              <h2 style={{ fontSize: "22px", margin: "0 0 6px" }}>Contact details</h2>
              <p className="hint" style={{ margin: 0, fontSize: "13px" }}>
                Reach our sales &amp; support teams directly or visit our office.
              </p>
            </div>

            {/* Sales & Inquiry Destination Box */}
            <div
              style={{
                padding: "14px 16px",
                background: "var(--accent-soft)",
                borderRadius: "10px",
                border: "1px solid var(--line-2)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Sales &amp; Client Inquiries
                </span>
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: "var(--accent)",
                    color: "#ffffff",
                    letterSpacing: "0.3px",
                  }}
                >
                  Form Route
                </span>
              </div>
              <a
                href="mailto:support@bytezoracoders.com"
                style={{
                  color: "var(--fg)",
                  fontSize: "15px",
                  fontWeight: 700,
                  textDecoration: "none",
                  wordBreak: "break-all",
                }}
              >
                support@bytezoracoders.com
              </a>
              <span style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.4 }}>
                All contact form messages and pricing requests route directly to this inbox.
              </span>
            </div>

            {/* Support Email */}
            <div
              style={{
                padding: "12px 16px",
                background: "var(--bg-2)",
                borderRadius: "10px",
                border: "1px solid var(--line)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Customer &amp; Technical Support
              </span>
              <a
                href="mailto:Support@bytezoracoders.com"
                style={{ color: "var(--fg)", fontSize: "14px", fontWeight: 600, textDecoration: "none", wordBreak: "break-all" }}
              >
                Support@bytezoracoders.com
              </a>
            </div>

            {/* Phone & Working Hours Grid */}
            <div className="grid g2" style={{ gap: "12px" }}>
              <div
                style={{
                  padding: "12px 14px",
                  background: "var(--bg-2)",
                  borderRadius: "10px",
                  border: "1px solid var(--line)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>
                  Phone
                </span>
                <a
                  href="tel:+919995070483"
                  style={{ color: "var(--fg)", fontSize: "13px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  +91 (999) 50-70483
                </a>
              </div>
              <div
                style={{
                  padding: "12px 14px",
                  background: "var(--bg-2)",
                  borderRadius: "10px",
                  border: "1px solid var(--line)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>
                  Working Hours
                </span>
                <span style={{ color: "var(--fg)", fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap" }}>
                  Mon–Fri, 9–18 IST
                </span>
              </div>
            </div>

            {/* Location Details Box Only (No Map, Clean details) */}
            <div
              style={{
                padding: "14px 16px",
                background: "var(--bg-2)",
                borderRadius: "10px",
                border: "1px solid var(--line)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginTop: "auto",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Office (India Headquarters)
                </span>
                <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 500 }}>
                  Ernakulam, Kerala
                </span>
              </div>
              <div style={{ fontSize: "14px", color: "var(--fg)", fontWeight: 600, lineHeight: 1.45 }}>
                Ground Floor, 287/A, Ernakulam, Kerala – 682315
              </div>
              <span style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.4 }}>
                Registered development &amp; operations office in India.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
