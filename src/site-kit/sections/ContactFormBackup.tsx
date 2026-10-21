import { useState, type FormEvent } from "react";
import { useContactEndpoint } from "../contact-endpoint.tsx";

/**
 * Inquiry form on contact sections.
 * The editor and draft preview post it to the site's public contact endpoint.
 * Published HTML posts the same fields through static-runtime.js.
 */

export interface ContactFormProps {
  submitLabel: string;
  formHeading?: string;
  serviceOptions?: string[];
  onSubmit?: (data: { name: string; email: string; message: string; services: string[] }) => void;
}

type Status = { ok: boolean; message: string };

function errorFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const error = (body as { error?: unknown }).error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  const message = (body as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

export default function ContactForm({
  submitLabel,
  formHeading,
  serviceOptions,
  onSubmit,
}: ContactFormProps) {
  const endpoint = useContactEndpoint();
  const [status, setStatus] = useState<Status | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const services = formData.getAll("service").map(String).filter(Boolean);
    const message = String(formData.get("message") || "").trim();
    const data = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message,
      services,
    };
    if (onSubmit) {
      onSubmit(data);
      return;
    }

    const url =
      endpoint || (typeof document !== "undefined" ? document.body.getAttribute("data-wb-contact") : null);
    if (!url) {
      setStatus({ ok: false, message: "Messages are sent from the published site." });
      return;
    }

    setPending(true);
    setStatus(null);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: services.length ? `Interested in: ${services.join(", ")}\n\n${message}` : message,
        }),
      });
      const result: unknown = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(errorFromBody(result) || "Your message couldn't be sent. Please try again.");
      }
      form.reset();
      const thanks =
        result && typeof result === "object" && typeof (result as { message?: unknown }).message === "string"
          ? (result as { message: string }).message
          : "Thank you! Your message has been received.";
      setStatus({ ok: true, message: thanks });
    } catch (error) {
      setStatus({
        ok: false,
        message: error instanceof Error ? error.message : "Your message couldn't be sent. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="wb-contact-form" onSubmit={(event) => void handleSubmit(event)}>
      {formHeading && <h3 className="wb-contact-form-title">{formHeading}</h3>}

      {serviceOptions && serviceOptions.length > 0 && (
        <div className="wb-contact-services-group">
          <label className="wb-contact-field-label">I&apos;m interested in:</label>
          <div className="wb-contact-chips-row">
            {serviceOptions.map((opt, i) => (
              <label key={i} className="wb-contact-chip">
                <input type="checkbox" name="service" value={opt} defaultChecked={i === 0} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="wb-contact-input-row">
        <label className="wb-contact-field">
          <span className="wb-contact-field-label">Your name</span>
          <input
            type="text"
            name="name"
            placeholder="Jane Doe"
            autoComplete="name"
            required
            className="wb-contact-input"
          />
        </label>
        <label className="wb-contact-field">
          <span className="wb-contact-field-label">Email address</span>
          <input
            type="email"
            name="email"
            placeholder="jane@company.com"
            autoComplete="email"
            required
            className="wb-contact-input"
          />
        </label>
      </div>

      <label className="wb-contact-field">
        <span className="wb-contact-field-label">Project details / Message</span>
        <textarea
          name="message"
          placeholder="Tell us about your timeline, scope, and objectives..."
          rows={4}
          required
          className="wb-contact-textarea"
        />
      </label>

      <div className="wb-contact-form-footer">
        <button type="submit" className="wb-btn wb-btn-primary wb-contact-submit-btn" disabled={pending}>
          {pending ? "Sending…" : submitLabel}
        </button>
        <span className="wb-contact-privacy-note">🔒 We respect your privacy. No spam.</span>
      </div>
      {status && (
        <p className={`wb-contact-form-status${status.ok ? " is-success" : " is-error"}`} role="status">
          {status.message}
        </p>
      )}
    </form>
  );
}
