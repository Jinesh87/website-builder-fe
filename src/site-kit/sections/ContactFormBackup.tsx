import { useState, type FormEvent } from "react";
import { useContactEndpoint } from "../contact-endpoint.tsx";
import { fieldMaxLength, fieldOptions, isChoiceField } from "../contact-builder.ts";
import type { ContactFormField } from "../types.ts";

/**
 * Inquiry form on contact sections.
 * The editor and draft preview post it to the site's public contact endpoint.
 * Published HTML posts the same fields through static-runtime.js.
 */

export interface ContactFormProps {
  submitLabel: string;
  formHeading?: string;
  serviceOptions?: string[];
  /** Customized fields; the default name, email and message form is shown without them. */
  fields?: ContactFormField[];
  /** Lets the server check the answers against the published field list. */
  sectionId?: string;
  onSubmit?: (data: { name: string; email: string; message: string; services: string[] }) => void;
}

type Status = { ok: boolean; message: string };

/** Hidden spam trap; the server drops submissions that fill it in. */
const HONEYPOT_FIELD = "_wb_hp";

function errorFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const error = (body as { error?: unknown }).error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  const message = (body as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

/** Answers keyed by field id; multiple choice fields send every ticked option. */
function collectFieldValues(formData: FormData, fields: readonly ContactFormField[]): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};
  for (const field of fields) {
    if (field.type === "checkboxes") {
      values[field.id] = formData.getAll(field.id).map(String);
    } else {
      values[field.id] = String(formData.get(field.id) ?? "").trim();
    }
  }
  return values;
}

function autoCompleteFor(field: ContactFormField): string | undefined {
  if (field.id === "name") return "name";
  if (field.type === "email") return "email";
  if (field.type === "tel") return "tel";
  return undefined;
}

function FieldLabel({ field }: { field: ContactFormField }) {
  return (
    <span className="wb-contact-field-label">
      {field.label || "Untitled field"}
      {field.required && <span className="wb-contact-required" aria-hidden="true"> *</span>}
    </span>
  );
}

function ContactFieldInput({ field }: { field: ContactFormField }) {
  const options = fieldOptions(field);
  if (isChoiceField(field.type) && options.length === 0) return null;
  const widthClass = `wb-contact-field wb-contact-field-${field.width === "half" ? "half" : "full"}`;

  if (field.type === "radio" || field.type === "checkboxes") {
    const inputType = field.type === "radio" ? "radio" : "checkbox";
    return (
      <fieldset className={`${widthClass} wb-contact-choice-group`}>
        <legend className="wb-contact-field-label-legend">
          <FieldLabel field={field} />
        </legend>
        <div className="wb-contact-chips-row">
          {options.map((option, index) => (
            <label key={`${option}-${index}`} className="wb-contact-chip">
              <input
                type={inputType}
                name={field.id}
                value={option}
                required={field.type === "radio" && field.required && index === 0}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <label className={widthClass}>
      <FieldLabel field={field} />
      {field.type === "textarea" ? (
        <textarea
          name={field.id}
          placeholder={field.placeholder}
          rows={4}
          required={field.required}
          maxLength={fieldMaxLength(field.type)}
          className="wb-contact-textarea"
        />
      ) : field.type === "select" ? (
        <select name={field.id} required={field.required} defaultValue="" className="wb-contact-input wb-contact-select">
          <option value="" disabled={field.required}>
            {field.placeholder || "Select an option"}
          </option>
          {options.map((option, index) => (
            <option key={`${option}-${index}`} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type}
          name={field.id}
          placeholder={field.placeholder}
          autoComplete={autoCompleteFor(field)}
          required={field.required}
          maxLength={field.type === "date" || field.type === "number" ? undefined : fieldMaxLength(field.type)}
          className="wb-contact-input"
        />
      )}
    </label>
  );
}

function DefaultFields({ serviceOptions }: { serviceOptions?: string[] }) {
  return (
    <>
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
    </>
  );
}

export default function ContactForm({
  submitLabel,
  formHeading,
  serviceOptions,
  fields,
  sectionId,
  onSubmit,
}: ContactFormProps) {
  const endpoint = useContactEndpoint();
  const [status, setStatus] = useState<Status | null>(null);
  const [pending, setPending] = useState(false);
  const customFields = fields && fields.length > 0 && sectionId ? fields : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const honeypot = String(formData.get(HONEYPOT_FIELD) || "");
    const services = formData.getAll("service").map(String).filter(Boolean);
    const message = String(formData.get("message") || "").trim();
    const data = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message,
      services,
    };
    if (onSubmit && !customFields) {
      onSubmit(data);
      return;
    }

    const missingChoice = customFields?.find(
      (field) =>
        field.type === "checkboxes" &&
        field.required &&
        fieldOptions(field).length > 0 &&
        formData.getAll(field.id).length === 0,
    );
    if (missingChoice) {
      setStatus({ ok: false, message: `Please choose at least one option for "${missingChoice.label || "this field"}".` });
      return;
    }

    const url =
      endpoint || (typeof document !== "undefined" ? document.body.getAttribute("data-wb-contact") : null);
    if (!url) {
      setStatus({ ok: false, message: "Messages are sent from the published site." });
      return;
    }

    const payload = customFields
      ? { sectionId, fields: collectFieldValues(formData, customFields), [HONEYPOT_FIELD]: honeypot }
      : {
          name: data.name,
          email: data.email,
          message: services.length ? `Interested in: ${services.join(", ")}\n\n${message}` : message,
          [HONEYPOT_FIELD]: honeypot,
        };

    setPending(true);
    setStatus(null);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
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
    <form
      className="wb-contact-form"
      data-wb-section={customFields ? sectionId : undefined}
      onSubmit={(event) => void handleSubmit(event)}
    >
      {formHeading && <h3 className="wb-contact-form-title">{formHeading}</h3>}

      {customFields ? (
        <div className="wb-contact-fields-grid">
          {customFields.map((field) => (
            <ContactFieldInput key={field.id} field={field} />
          ))}
        </div>
      ) : (
        <DefaultFields serviceOptions={serviceOptions} />
      )}

      <div className="wb-contact-hp" aria-hidden="true">
        <label>
          Leave this field empty
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

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
