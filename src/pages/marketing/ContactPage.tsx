import { useRef, useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from "react";
import Icon, { type IconName } from "./Icon.tsx";
import { prefersReducedMotion, useMarketing } from "./marketing-context.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOPICS: [topic: string, tile: string, icon: IconName, title: string, text: string, action: string][] = [
  [
    "Plans and pricing",
    "c0",
    "chat",
    "Sales",
    "Plans, pricing and the Agency plan for many websites.",
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

  const update =
    (key: keyof ContactForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const invalid = (key: keyof ContactErrors) =>
    key in errors
      ? { "aria-invalid": Boolean(errors[key]), "aria-describedby": errors[key] ? `${fieldId[key]}-err` : undefined }
      : {};

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    setSent(
      `Thanks, ${form.name.trim().split(" ")[0]}. Your message was sent. We'll reply to ${form.email.trim()}. (Prototype: nothing was actually sent.)`,
    );
    setForm(EMPTY_FORM);
    setErrors({});
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
            gap: "32px",
            alignItems: "start",
          }}
        >
          <div className="card" style={{ padding: "32px" }}>
            <form ref={formRef} noValidate onSubmit={submit}>
              <h2 style={{ fontSize: "22px" }}>Send a message</h2>
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
              <div className="fld">
                <label htmlFor="c-msg">Message</label>
                <textarea
                  id="c-msg"
                  className="in"
                  required
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
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <span className="hint">We reply within [time].</span>
                <button className="btn p lg" type="submit">
                  Send message
                </button>
              </div>
              <div className="note ok" hidden={!sent} role="status">
                {sent}
              </div>
            </form>
          </div>
          <div className="stack" style={{ gap: "20px" }}>
            <div className="card">
              <h3>Contact details</h3>
              <div>
                <div className="hint">Email</div>
                <div>[support@yourdomain.com]</div>
              </div>
              <div>
                <div className="hint">Phone</div>
                <div>[+91 00000 00000]</div>
              </div>
              <div>
                <div className="hint">Office</div>
                <div>[Address line, City, Postcode]</div>
              </div>
              <div>
                <div className="hint">Hours</div>
                <div>[Mon–Fri, 9:00–18:00]</div>
              </div>
            </div>
            <div className="stack" style={{ gap: "8px" }}>
              <div className="illus">
                <svg viewBox="0 0 400 220" role="img" aria-label="Map showing the office location">
                  <rect width="400" height="220" fill="var(--bg-2)" />
                  <path d="M0 70h400M0 150h400M90 0v220M220 0v220M320 0v220" stroke="var(--surface)" strokeWidth="14" />
                  <path d="M0 110 C120 90 200 140 400 100" stroke="var(--line-2)" strokeWidth="8" fill="none" />
                  <rect x="232" y="84" width="76" height="54" rx="4" fill="var(--accent-soft)" />
                  <rect x="100" y="160" width="108" height="50" rx="4" fill="var(--accent-soft)" />
                  <path
                    d="M270 40c-16 0-28 12-28 28 0 22 28 50 28 50s28-28 28-50c0-16-12-28-28-28z"
                    fill="var(--accent)"
                  />
                  <circle cx="270" cy="68" r="10" fill="var(--surface)" />
                </svg>
              </div>
              <span className="hint">[Office address]. Link to your map listing here.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
