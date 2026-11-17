import type { ContactFormField, HeroData, HeroFact } from "./types.ts";

/**
 * Fields of the registration-form hero when the owner hasn't customized them.
 * Mirrored by DEFAULT_HERO_REGISTRATION_FIELDS on the server, which validates
 * submissions against the same list.
 */
export const DEFAULT_HERO_REGISTRATION_FIELDS: ContactFormField[] = [
  { id: "name", type: "text", label: "Full name", placeholder: "Enter your full name", required: true, width: "full" },
  { id: "email", type: "email", label: "Email", placeholder: "you@example.com", required: true, width: "half" },
  { id: "phone", type: "tel", label: "Mobile number", placeholder: "+91 98xxxxxxxx", required: true, width: "half" },
];

export const HERO_REGISTRATION_LIMITS = { maxFacts: 4, maxChecklist: 6 } as const;

export const HERO_REGISTRATION_DEFAULTS = {
  heading: "Register now",
  submitLabel: "Submit registration",
} as const;

/** Form fields the registration hero shows; unset or empty lists fall back to the defaults. */
export function heroRegistrationFields(data: Pick<HeroData, "registrationForm">): ContactFormField[] {
  const fields = data.registrationForm?.fields;
  return fields && fields.length > 0 ? fields : DEFAULT_HERO_REGISTRATION_FIELDS;
}

/** Fact tiles with a label or value, capped at the layout's maximum. */
export function heroRegistrationFacts(data: Pick<HeroData, "heroFacts">): HeroFact[] {
  return (data.heroFacts ?? [])
    .filter((fact) => fact.label?.trim() || fact.value?.trim())
    .slice(0, HERO_REGISTRATION_LIMITS.maxFacts);
}

/** Non-empty checklist lines, capped at the layout's maximum. */
export function heroRegistrationChecklist(data: Pick<HeroData, "checklist">): string[] {
  return (data.checklist ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, HERO_REGISTRATION_LIMITS.maxChecklist);
}
