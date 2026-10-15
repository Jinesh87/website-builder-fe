import { useState, type FormEvent } from "react";
import { Button, Checkbox, FieldError, Label } from "@heroui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi, type SignupInput } from "../../api/auth.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import { validateEmail, validatePassword } from "../../auth/validation.ts";
import FormAlert from "../../components/ui/FormAlert.tsx";
import TextInput from "../../components/ui/TextInput.tsx";
import AuthSplitLayout from "../../layouts/AuthSplitLayout.tsx";
import type { VerifyEmailState } from "./VerifyEmailPage.tsx";

type SignupForm = Required<SignupInput>;
type SignupErrors = Partial<Record<keyof SignupForm, string>>;

const INITIAL_FORM: SignupForm = {
  fullName: "",
  businessName: "",
  email: "",
  password: "",
  phone: "",
  acceptTerms: false,
};

function validate(form: SignupForm): SignupErrors {
  const errors: SignupErrors = {};
  if (form.fullName.trim().length < 2) errors.fullName = "Enter your full name";
  if (form.businessName.trim().length < 2) errors.businessName = "Enter your business name";
  errors.email = validateEmail(form.email);
  errors.password = validatePassword(form.password);
  if (form.phone.trim() && !/^\+?[0-9 ()-]{7,20}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number";
  }
  if (!form.acceptTerms) errors.acceptTerms = "You must accept the Terms of Service and Privacy Policy";
  return errors;
}

const SIGNUP_STEPS = ["Create account", "Verify email", "Open your dashboard"];

function SignupSteps() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">Sign up steps</p>
      <ol className="mt-4 space-y-3">
        {SIGNUP_STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-3 text-sm">
            <span
              className={`grid size-6 place-items-center rounded-full text-xs ${
                index === 0 ? "bg-brand text-white" : "border border-white/30 text-white/70"
              }`}
            >
              {index + 1}
            </span>
            <span className={index === 0 ? "text-white" : "text-white/70"}>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notice, from } = (location.state as { notice?: string; from?: string } | null) ?? {};
  const [form, setForm] = useState<SignupForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof SignupForm>(key: K) {
    return (value: SignupForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setError(null);
    setEmailTaken(false);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const result = await authApi.signup({
        ...form,
        fullName: form.fullName.trim(),
        businessName: form.businessName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
      });
      const state: VerifyEmailState = {
        email: result.email,
        resendAvailableInSeconds: result.resendAvailableInSeconds,
        from,
      };
      navigate("/verify-email", { state });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors());
        setEmailTaken(err.code === "EMAIL_TAKEN");
      }
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      heading="Create your account and start building"
      description="After sign up you get your own dashboard. Only you can see and edit your websites, media and settings."
      aside={<SignupSteps />}
    >
      <h2 className="text-2xl font-semibold text-ink">Sign up</h2>
      <p className="mt-1 text-sm text-ink-body">
        Already have an account?{" "}
        <Link to="/login" state={from ? { from } : undefined} className="font-medium text-brand hover:underline">
          Log in
        </Link>
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-4">
        {notice && <p className="rounded-lg bg-canvas px-4 py-3 text-sm text-ink-body">{notice}</p>}
        <TextInput
          label="Full name"
          name="fullName"
          autoComplete="name"
          placeholder="Your name"
          value={form.fullName}
          onChange={update("fullName")}
          error={errors.fullName}
          autoFocus
        />
        <TextInput
          label="Business name"
          name="businessName"
          autoComplete="organization"
          placeholder="Your business"
          value={form.businessName}
          onChange={update("businessName")}
          error={errors.businessName}
        />
        <TextInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@business.com"
          value={form.email}
          onChange={update("email")}
          error={errors.email}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={update("password")}
            error={errors.password}
          />
          <TextInput
            label="Phone (optional)"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91"
            value={form.phone}
            onChange={update("phone")}
            error={errors.phone}
          />
        </div>

        <Checkbox
          isSelected={form.acceptTerms}
          onChange={update("acceptTerms")}
          isInvalid={Boolean(errors.acceptTerms)}
          validationBehavior="aria"
        >
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label className="text-sm text-ink-body">
              I agree to the Terms of Service and Privacy Policy
            </Label>
          </Checkbox.Content>
          <FieldError>{errors.acceptTerms}</FieldError>
        </Checkbox>

        <Button type="submit" fullWidth isPending={submitting}>
          Create account
        </Button>

        {error && (
          <FormAlert status="danger">
            {error}
            {emailTaken && (
              <>
                {" "}
                <Link to="/login" state={from ? { from } : undefined} className="font-medium underline">
                  Log in instead
                </Link>
              </>
            )}
          </FormAlert>
        )}

        <p className="rounded-lg bg-canvas px-4 py-3 text-xs leading-relaxed text-ink-muted">
          We'll email you a 6-digit code to verify your address.
        </p>
      </form>
    </AuthSplitLayout>
  );
}
