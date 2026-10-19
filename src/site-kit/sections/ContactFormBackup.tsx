/**
 * BACKUP / FUTURE USE: Interactive Contact Form Component
 *
 * This component preserves the original multi-field interactive contact form
 * (Service selection chips, Name, Email, Textarea, and Submit button).
 *
 * It is backed up here so that when a backend form submission API, email webhook,
 * or form service (e.g. Resend / SendGrid / Formspree / database inquiries) is wired up,
 * it can be re-enabled immediately.
 */

export interface ContactFormProps {
  submitLabel: string;
  formHeading?: string;
  serviceOptions?: string[];
  onSubmit?: (data: { name: string; email: string; message: string; services: string[] }) => void;
}

export default function ContactForm({
  submitLabel,
  formHeading,
  serviceOptions,
  onSubmit,
}: ContactFormProps) {
  return (
    <form
      className="wb-contact-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) {
          const form = e.currentTarget;
          const formData = new FormData(form);
          const services = formData.getAll("service").map(String);
          onSubmit({
            name: String(formData.get("name") || ""),
            email: String(formData.get("email") || ""),
            message: String(formData.get("message") || ""),
            services,
          });
        }
      }}
    >
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
        <button type="submit" className="wb-btn wb-btn-primary wb-contact-submit-btn">
          {submitLabel}
        </button>
        <span className="wb-contact-privacy-note">
          🔒 We respect your privacy. No spam.
        </span>
      </div>
    </form>
  );
}
