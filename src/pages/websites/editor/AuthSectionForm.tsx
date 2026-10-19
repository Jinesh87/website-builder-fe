import type {
  AuthAnimation,
  AuthColors,
  AuthData,
  AuthField,
  AuthFieldType,
  AuthPanel,
  AuthSocialLink,
  AuthSocialProvider,
  AuthVariant,
  AuthView,
} from "../../../site-kit/index.ts";
import {
  CheckboxField,
  ColorField,
  FormGroup,
  ImageField,
  ItemList,
  OptionalLinkField,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields.tsx";

type Props = { data: AuthData; onChange: (data: AuthData) => void };

const FIELD_NAME = /^[A-Za-z][\w-]{0,39}$/;
const SAFE_HREF = /^(https?:\/\/\S+|\/(?!\/)\S*|#\S*)$/i;

const VARIANT_OPTIONS: { value: AuthVariant; label: string }[] = [
  { value: "diagonal-split", label: "Diagonal split · brand panel + form" },
  { value: "gradient-spotlight", label: "Gradient spotlight · headline + floating card" },
  { value: "illustration-frame", label: "Illustration frame · image + form card" },
  { value: "glass-aurora", label: "Glass aurora · frosted card on gradients" },
  { value: "dark-wave", label: "Dark wave · centered, animated waves" },
  { value: "product-showcase", label: "Product showcase · form + product panel" },
  { value: "minimal-editorial", label: "Minimal editorial · type-led, monochrome" },
  { value: "bento-grid", label: "Bento grid · form + stat & image tiles" },
  { value: "fullbleed-sheet", label: "Full-bleed sheet · photo + docked panel" },
  { value: "tabbed-compact", label: "Tabbed compact · Login / Sign up tabs" },
];

const VIEW_OPTIONS: { value: AuthView; label: string }[] = [
  { value: "login", label: "Login" },
  { value: "register", label: "Register" },
  { value: "forgot", label: "Forgot password" },
  { value: "otp", label: "OTP verification" },
];

const ANIMATION_OPTIONS: { value: AuthAnimation; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide-up", label: "Slide up (staggered fields)" },
  { value: "slide-side", label: "Slide from side" },
  { value: "scale", label: "Scale in" },
  { value: "blur", label: "Blur in" },
];

const FIELD_TYPE_OPTIONS: { value: AuthFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "password", label: "Password" },
  { value: "confirm-password", label: "Confirm password" },
  { value: "tel", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
];

const PROVIDER_OPTIONS: { value: AuthSocialProvider; label: string }[] = [
  { value: "google", label: "Google" },
  { value: "apple", label: "Apple" },
  { value: "github", label: "GitHub" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X (Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "microsoft", label: "Microsoft" },
];

function FieldsEditor({
  fields,
  onChange,
  max = 12,
}: {
  fields: AuthField[];
  onChange: (fields: AuthField[]) => void;
  max?: number;
}) {
  return (
    <ItemList<AuthField>
      label="Form fields"
      items={fields}
      max={max}
      onChange={onChange}
      addLabel="Add field"
      create={() => ({ name: `field${fields.length + 1}`, label: "New field", type: "text", required: false, width: "full" })}
      itemTitle={(field) => `${field.label || field.name} · ${field.type}`}
      renderItem={(field, update) => (
        <>
          <TextField label="Label" value={field.label} onChange={(label) => update({ ...field, label })} maxLength={80} required />
          <TextField
            label="Field name"
            value={field.name}
            onChange={(name) => update({ ...field, name: name.replace(/\s+/g, "") })}
            maxLength={40}
            required
            error={field.name && !FIELD_NAME.test(field.name) ? "Start with a letter; use letters, numbers, - or _" : undefined}
            hint="Sent with the form data, e.g. firstName."
          />
          <SelectField label="Type" value={field.type} options={FIELD_TYPE_OPTIONS} onChange={(type) => update({ ...field, type })} />
          {field.type !== "checkbox" && (
            <TextField
              label="Placeholder"
              value={field.placeholder}
              onChange={(placeholder) => update({ ...field, placeholder: placeholder || undefined })}
              maxLength={120}
            />
          )}
          {field.type === "select" && (
            <TextAreaField
              label="Dropdown options"
              value={(field.options ?? []).join("\n")}
              onChange={(text) =>
                update({
                  ...field,
                  options: text
                    .split("\n")
                    .map((option) => option.trim())
                    .filter(Boolean)
                    .slice(0, 20),
                })
              }
              hint="One option per line."
            />
          )}
          <SelectField
            label="Width"
            value={field.width ?? "full"}
            options={[
              { value: "full", label: "Full width" },
              { value: "half", label: "Half width (side by side)" },
            ]}
            onChange={(width) => update({ ...field, width })}
          />
          <CheckboxField label="Required" checked={Boolean(field.required)} onChange={(required) => update({ ...field, required })} />
        </>
      )}
    />
  );
}

function ViewHeadingFields({
  heading,
  subheading,
  submitLabel,
  onChange,
}: {
  heading: string;
  subheading?: string;
  submitLabel: string;
  onChange: (patch: { heading?: string; subheading?: string; submitLabel?: string }) => void;
}) {
  return (
    <>
      <TextField label="Heading" value={heading} onChange={(value) => onChange({ heading: value })} maxLength={120} required />
      <TextAreaField label="Subheading" value={subheading} onChange={(value) => onChange({ subheading: value })} maxLength={300} rows={2} />
      <TextField label="Submit button" value={submitLabel} onChange={(value) => onChange({ submitLabel: value })} maxLength={60} required />
    </>
  );
}

function ColorsEditor({ colors, onChange }: { colors: AuthColors; onChange: (colors: AuthColors | undefined) => void }) {
  const update = (patch: Partial<AuthColors>) => {
    const next = Object.fromEntries(Object.entries({ ...colors, ...patch }).filter(([, value]) => Boolean(value)));
    onChange(Object.keys(next).length > 0 ? next : undefined);
  };
  const hasColors = Object.keys(colors).length > 0;
  return (
    <>
      <ColorField label="Accent / buttons" value={colors.accent} onChange={(accent) => update({ accent })} fallback="#4f46e5" />
      <ColorField
        label="Brand panel background"
        value={colors.panel}
        onChange={(panel) => update({ panel })}
        fallback="#3b5bdb"
        hint="Side panels, gradients and dark backgrounds."
      />
      <ColorField label="Brand panel text" value={colors.panelText} onChange={(panelText) => update({ panelText })} fallback="#ffffff" />
      <ColorField label="Form card background" value={colors.card} onChange={(card) => update({ card })} fallback="#ffffff" />
      {hasColors && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="self-start text-ed-xs font-medium text-ed-danger hover:underline"
        >
          Reset design colors to theme
        </button>
      )}
    </>
  );
}

function PanelEditor({ panel, onChange }: { panel: AuthPanel; onChange: (panel: AuthPanel) => void }) {
  const testimonial = panel.testimonial;
  return (
    <>
      <TextField label="Eyebrow" value={panel.eyebrow} onChange={(eyebrow) => onChange({ ...panel, eyebrow })} maxLength={80} />
      <TextField label="Heading" value={panel.heading} onChange={(heading) => onChange({ ...panel, heading })} maxLength={160} />
      <TextAreaField label="Text" value={panel.text} onChange={(text) => onChange({ ...panel, text })} maxLength={400} rows={2} />
      <TextField
        label="Heading while registering"
        value={panel.registerHeading}
        onChange={(registerHeading) => onChange({ ...panel, registerHeading })}
        maxLength={160}
        hint="Diagonal split swaps to this copy on the register page."
      />
      <TextAreaField
        label="Text while registering"
        value={panel.registerText}
        onChange={(registerText) => onChange({ ...panel, registerText })}
        maxLength={400}
        rows={2}
      />
      <ImageField label="Panel image" value={panel.image} onChange={(image) => onChange({ ...panel, image })} optional />
      <ItemList<string>
        label="Highlights"
        items={panel.highlights ?? []}
        max={6}
        onChange={(highlights) => onChange({ ...panel, highlights })}
        create={() => "New highlight"}
        itemTitle={(item) => item}
        addLabel="Add highlight"
        renderItem={(item, update) => <TextField label="Text" value={item} onChange={update} maxLength={120} required />}
      />
      <ItemList<{ value: string; label: string }>
        label="Stats (bento)"
        items={panel.stats ?? []}
        max={4}
        onChange={(stats) => onChange({ ...panel, stats })}
        create={() => ({ value: "10k+", label: "Happy users" })}
        itemTitle={(stat) => `${stat.value} ${stat.label}`}
        addLabel="Add stat"
        renderItem={(stat, update) => (
          <>
            <TextField label="Value" value={stat.value} onChange={(value) => update({ ...stat, value })} maxLength={20} required />
            <TextField label="Label" value={stat.label} onChange={(label) => update({ ...stat, label })} maxLength={80} required />
          </>
        )}
      />
      <CheckboxField
        label="Show testimonial"
        checked={Boolean(testimonial)}
        onChange={(on) =>
          onChange({ ...panel, testimonial: on ? { quote: "This changed how our team works.", name: "Customer name", role: "Role, Company" } : undefined })
        }
      />
      {testimonial && (
        <>
          <TextAreaField
            label="Quote"
            value={testimonial.quote}
            onChange={(quote) => onChange({ ...panel, testimonial: { ...testimonial, quote } })}
            maxLength={300}
            required
          />
          <TextField
            label="Name"
            value={testimonial.name}
            onChange={(name) => onChange({ ...panel, testimonial: { ...testimonial, name } })}
            maxLength={80}
            required
          />
          <TextField
            label="Role"
            value={testimonial.role}
            onChange={(role) => onChange({ ...panel, testimonial: { ...testimonial, role } })}
            maxLength={120}
          />
          <ImageField
            label="Avatar"
            value={testimonial.avatar}
            onChange={(avatar) => onChange({ ...panel, testimonial: { ...testimonial, avatar } })}
            optional
          />
        </>
      )}
    </>
  );
}

export default function AuthSectionForm({ data, onChange }: Props) {
  const set = (patch: Partial<AuthData>) => onChange({ ...data, ...patch });
  const { login, register, forgot, otp, social } = data;

  return (
    <>
      <FormGroup title="Design & layout" description="Pick one of 10 designs. Everything below applies to all of them.">
        <SelectField label="Design" value={data.variant} options={VARIANT_OPTIONS} onChange={(variant) => set({ variant })} />
        <SelectField
          label="Page shown first"
          value={data.defaultView ?? "login"}
          options={VIEW_OPTIONS.filter((option) => option.value === "login" || data[option.value].enabled)}
          onChange={(defaultView) => set({ defaultView })}
          hint="Also switches the canvas preview, so you can edit each page."
        />
        <SelectField
          label="Form position"
          value={data.formPosition ?? "right"}
          options={[
            { value: "right", label: "Right" },
            { value: "left", label: "Left" },
          ]}
          onChange={(formPosition) => set({ formPosition })}
        />
        <SelectField
          label="Height"
          value={data.minHeight ?? "screen"}
          options={[
            { value: "screen", label: "Full screen" },
            { value: "auto", label: "Fit content" },
          ]}
          onChange={(minHeight) => set({ minHeight })}
        />
        <SelectField label="Page transition" value={data.animation ?? "fade"} options={ANIMATION_OPTIONS} onChange={(animation) => set({ animation })} />
        <CheckboxField
          label="Ambient background motion"
          checked={data.backgroundMotion ?? true}
          onChange={(backgroundMotion) => set({ backgroundMotion })}
          hint="Drifting gradients, waves and slow image zoom. Disabled for visitors who prefer reduced motion."
        />
      </FormGroup>

      <FormGroup title="Brand">
        <TextField label="Brand name" value={data.brandName} onChange={(brandName) => set({ brandName })} maxLength={60} />
        <ImageField
          label="Logo"
          value={data.logo}
          onChange={(logo) => set({ logo })}
          dimensionHint="200 × 50 px (horizontal) or 60 × 60 px (square)"
          hint="Transparent PNG, SVG, or WebP"
          optional
        />
      </FormGroup>

      <FormGroup title="Form style & typography" description="Fonts follow the section font picker in the Style tab.">
        <SelectField
          label="Input style"
          value={data.inputStyle ?? "outline"}
          options={[
            { value: "outline", label: "Outline" },
            { value: "filled", label: "Filled" },
            { value: "underline", label: "Underline" },
            { value: "pill", label: "Pill" },
          ]}
          onChange={(inputStyle) => set({ inputStyle })}
        />
        <SelectField
          label="Button shape"
          value={data.buttonShape ?? "rounded"}
          options={[
            { value: "rounded", label: "Rounded" },
            { value: "pill", label: "Pill" },
            { value: "square", label: "Square" },
          ]}
          onChange={(buttonShape) => set({ buttonShape })}
        />
        <SelectField
          label="Heading size"
          value={data.headingSize ?? "md"}
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
          onChange={(headingSize) => set({ headingSize })}
        />
        <CheckboxField label="Show field labels" checked={data.showLabels ?? true} onChange={(showLabels) => set({ showLabels })} />
        <CheckboxField label="Show field icons" checked={Boolean(data.showFieldIcons)} onChange={(showFieldIcons) => set({ showFieldIcons })} />
        <CheckboxField
          label="Show / hide password toggle"
          checked={data.showPasswordToggle ?? true}
          onChange={(showPasswordToggle) => set({ showPasswordToggle })}
        />
      </FormGroup>

      <FormGroup title="Design colors" description="Leave empty to follow the site theme.">
        <ColorsEditor colors={data.colors ?? {}} onChange={(colors) => set({ colors })} />
      </FormGroup>

      <FormGroup title="Side panel & imagery" description="Used by designs that show a brand panel, image or tiles.">
        <PanelEditor panel={data.panel ?? {}} onChange={(panel) => set({ panel })} />
      </FormGroup>

      <FormGroup title="Login page" badge="Always on">
        <ViewHeadingFields
          heading={login.heading}
          subheading={login.subheading}
          submitLabel={login.submitLabel}
          onChange={(patch) => set({ login: { ...login, ...patch } })}
        />
        <FieldsEditor fields={login.fields} onChange={(fields) => set({ login: { ...login, fields } })} />
        <CheckboxField
          label="Show “Remember me”"
          checked={Boolean(login.showRemember)}
          onChange={(showRemember) => set({ login: { ...login, showRemember } })}
        />
        {login.showRemember && (
          <TextField
            label="Remember me label"
            value={login.rememberLabel}
            onChange={(rememberLabel) => set({ login: { ...login, rememberLabel } })}
            maxLength={60}
          />
        )}
        {forgot.enabled && (
          <TextField
            label="Forgot password link"
            value={login.forgotLabel}
            onChange={(forgotLabel) => set({ login: { ...login, forgotLabel } })}
            maxLength={60}
          />
        )}
        {register.enabled && (
          <>
            <TextField
              label="Sign-up prompt"
              value={login.switchPrompt}
              onChange={(switchPrompt) => set({ login: { ...login, switchPrompt } })}
              maxLength={80}
            />
            <TextField
              label="Sign-up link"
              value={login.switchLabel}
              onChange={(switchLabel) => set({ login: { ...login, switchLabel } })}
              maxLength={40}
            />
          </>
        )}
      </FormGroup>

      <FormGroup title="Register page" badge={register.enabled ? "On" : "Off"}>
        <CheckboxField
          label="Enable registration"
          checked={register.enabled}
          onChange={(enabled) => set({ register: { ...register, enabled } })}
        />
        {register.enabled && (
          <>
            <ViewHeadingFields
              heading={register.heading}
              subheading={register.subheading}
              submitLabel={register.submitLabel}
              onChange={(patch) => set({ register: { ...register, ...patch } })}
            />
            <FieldsEditor fields={register.fields} onChange={(fields) => set({ register: { ...register, fields } })} />
            <CheckboxField
              label="Require accepting terms"
              checked={Boolean(register.showTerms)}
              onChange={(showTerms) => set({ register: { ...register, showTerms } })}
            />
            {register.showTerms && (
              <>
                <TextField
                  label="Terms text"
                  value={register.termsText}
                  onChange={(termsText) => set({ register: { ...register, termsText } })}
                  maxLength={120}
                />
                <OptionalLinkField
                  label="Terms link"
                  value={register.termsLink}
                  onChange={(termsLink) => set({ register: { ...register, termsLink } })}
                  fallback={{ label: "Terms & Conditions", href: "/terms" }}
                />
              </>
            )}
            <TextField
              label="Log-in prompt"
              value={register.switchPrompt}
              onChange={(switchPrompt) => set({ register: { ...register, switchPrompt } })}
              maxLength={80}
            />
            <TextField
              label="Log-in link"
              value={register.switchLabel}
              onChange={(switchLabel) => set({ register: { ...register, switchLabel } })}
              maxLength={40}
            />
          </>
        )}
      </FormGroup>

      <FormGroup title="Forgot password page" badge={forgot.enabled ? "On" : "Off"}>
        <CheckboxField
          label="Enable password reset"
          checked={forgot.enabled}
          onChange={(enabled) => set({ forgot: { ...forgot, enabled } })}
        />
        {forgot.enabled && (
          <>
            <ViewHeadingFields
              heading={forgot.heading}
              subheading={forgot.subheading}
              submitLabel={forgot.submitLabel}
              onChange={(patch) => set({ forgot: { ...forgot, ...patch } })}
            />
            <FieldsEditor fields={forgot.fields} max={4} onChange={(fields) => set({ forgot: { ...forgot, fields } })} />
            <TextField
              label="Back link"
              value={forgot.backLabel}
              onChange={(backLabel) => set({ forgot: { ...forgot, backLabel } })}
              maxLength={60}
            />
            <TextField
              label="Success heading"
              value={forgot.successHeading}
              onChange={(successHeading) => set({ forgot: { ...forgot, successHeading } })}
              maxLength={120}
            />
            <TextAreaField
              label="Success text"
              value={forgot.successText}
              onChange={(successText) => set({ forgot: { ...forgot, successText } })}
              maxLength={300}
              rows={2}
            />
          </>
        )}
      </FormGroup>

      <FormGroup title="OTP verification" badge={otp.enabled ? "On" : "Off"}>
        <CheckboxField
          label="Enable OTP verification"
          checked={otp.enabled}
          onChange={(enabled) => set({ otp: { ...otp, enabled } })}
        />
        {otp.enabled && (
          <>
            <ViewHeadingFields
              heading={otp.heading}
              subheading={otp.subheading}
              submitLabel={otp.submitLabel}
              onChange={(patch) => set({ otp: { ...otp, ...patch } })}
            />
            <SelectField
              label="Code length"
              value={otp.length}
              options={[
                { value: 4, label: "4 digits" },
                { value: 5, label: "5 digits" },
                { value: 6, label: "6 digits" },
              ]}
              onChange={(length) => set({ otp: { ...otp, length } })}
            />
            <TextField
              label="Resend link"
              value={otp.resendLabel}
              onChange={(resendLabel) => set({ otp: { ...otp, resendLabel } })}
              maxLength={40}
              hint="Leave empty to hide the resend option."
            />
            <TextField
              label="Resend cooldown (seconds)"
              type="number"
              value={String(otp.resendSeconds ?? 30)}
              onChange={(value) => set({ otp: { ...otp, resendSeconds: Math.min(Math.max(Number(value) || 0, 0), 300) } })}
            />
            <CheckboxField
              label="Ask for a code after login"
              checked={Boolean(otp.requireOnLogin)}
              onChange={(requireOnLogin) => set({ otp: { ...otp, requireOnLogin } })}
            />
            <CheckboxField
              label="Ask for a code after registering"
              checked={Boolean(otp.requireOnRegister)}
              onChange={(requireOnRegister) => set({ otp: { ...otp, requireOnRegister } })}
            />
            <CheckboxField
              label="Ask for a code during password reset"
              checked={Boolean(otp.requireOnForgot)}
              onChange={(requireOnForgot) => set({ otp: { ...otp, requireOnForgot } })}
            />
          </>
        )}
      </FormGroup>

      <FormGroup title="Social login" badge={social.enabled ? "On" : "Off"}>
        <CheckboxField
          label="Show social login buttons"
          checked={social.enabled}
          onChange={(enabled) => set({ social: { ...social, enabled } })}
        />
        {social.enabled && (
          <>
            <TextField
              label="Divider text"
              value={social.label}
              onChange={(label) => set({ social: { ...social, label } })}
              maxLength={60}
            />
            <SelectField
              label="Button style"
              value={social.style ?? "icons"}
              options={[
                { value: "icons", label: "Icon buttons in a row" },
                { value: "full", label: "Full-width “Continue with …”" },
              ]}
              onChange={(style) => set({ social: { ...social, style } })}
            />
            <SelectField
              label="Position"
              value={social.position ?? "bottom"}
              options={[
                { value: "top", label: "Above the form" },
                { value: "bottom", label: "Below the form" },
              ]}
              onChange={(position) => set({ social: { ...social, position } })}
            />
            <CheckboxField
              label="Also show on register page"
              checked={social.showOnRegister ?? true}
              onChange={(showOnRegister) => set({ social: { ...social, showOnRegister } })}
            />
            <ItemList<AuthSocialLink>
              label="Providers"
              items={social.providers}
              max={PROVIDER_OPTIONS.length}
              onChange={(providers) => set({ social: { ...social, providers } })}
              create={() => ({
                provider: PROVIDER_OPTIONS.find((option) => !social.providers.some((p) => p.provider === option.value))?.value ?? "google",
                href: "#",
              })}
              itemTitle={(link) => PROVIDER_OPTIONS.find((option) => option.value === link.provider)?.label ?? link.provider}
              addLabel="Add provider"
              renderItem={(link, update) => (
                <>
                  <SelectField
                    label="Provider"
                    value={link.provider}
                    options={PROVIDER_OPTIONS}
                    onChange={(provider) => update({ ...link, provider })}
                  />
                  <TextField
                    label="Sign-in URL"
                    value={link.href}
                    onChange={(href) => update({ ...link, href })}
                    placeholder="https://… or # for a placeholder button"
                    maxLength={2048}
                    required
                    error={link.href && !SAFE_HREF.test(link.href.trim()) ? "Use https://…, a /path or #" : undefined}
                  />
                </>
              )}
            />
          </>
        )}
      </FormGroup>

      <FormGroup title="After sign in">
        <TextField
          label="Success heading"
          value={data.successHeading}
          onChange={(successHeading) => set({ successHeading })}
          maxLength={120}
        />
        <TextAreaField
          label="Success text"
          value={data.successText}
          onChange={(successText) => set({ successText })}
          maxLength={300}
          rows={2}
        />
        <OptionalLinkField
          label="Continue button"
          value={data.successLink}
          onChange={(successLink) => set({ successLink })}
          fallback={{ label: "Continue", href: "/" }}
        />
        <TextField
          label="Footer note"
          value={data.footerNote}
          onChange={(footerNote) => set({ footerNote })}
          maxLength={160}
          hint="Small print under the form, e.g. a security note."
        />
      </FormGroup>
    </>
  );
}
