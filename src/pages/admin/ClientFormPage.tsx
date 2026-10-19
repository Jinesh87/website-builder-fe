import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button, Spinner } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { adminClientsApi, type Client, type ClientDetailsInput } from "../../api/admin-clients.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import {
  PASSWORD_HINT,
  USERNAME_HINT,
  validateEmail,
  validatePassword,
  validateUsername,
} from "../../auth/validation.ts";
import { ClientStatusChip, formatDate, SOURCE_LABELS } from "../../components/admin/client-labels.tsx";
import CommonModal from "../../components/ui/CommonModal.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import TextAreaInput from "../../components/ui/TextAreaInput.tsx";
import TextInput from "../../components/ui/TextInput.tsx";

type Feedback = { status: "success" | "danger" | "warning"; message: string } | null;
type FormState = Required<ClientDetailsInput>;
type Credentials = { password: string; confirmPassword: string };
type FieldErrors = Partial<Record<keyof FormState | keyof Credentials, string>>;
type FeedbackState = { feedback?: Feedback };

const EMPTY_FORM: FormState = { businessName: "", fullName: "", email: "", phone: "", address: "", username: "" };
const EMPTY_CREDENTIALS: Credentials = { password: "", confirmPassword: "" };

/** Server error codes that belong to a single form field. */
const FIELD_ERROR_CODES: Record<string, keyof FieldErrors> = {
  EMAIL_TAKEN: "email",
  EMAIL_REQUIRED: "email",
  USERNAME_TAKEN: "username",
  USERNAME_NOT_ALLOWED: "username",
};

function toForm(client: Client): FormState {
  return {
    businessName: client.businessName,
    fullName: client.owner?.fullName ?? "",
    email: client.owner?.email ?? "",
    phone: client.owner?.phone ?? "",
    address: client.address ?? "",
    username: client.owner?.username ?? "",
  };
}

/** `usesUsername`: the client logs in with a username, so email is optional. */
function validate(form: FormState, usesUsername: boolean): FieldErrors {
  return {
    businessName: form.businessName.trim().length < 2 ? "Enter the business name" : undefined,
    fullName: form.fullName.trim().length < 2 ? "Enter the contact person's name" : undefined,
    email: form.email.trim() || !usesUsername ? validateEmail(form.email) : undefined,
    username: usesUsername ? validateUsername(form.username) : undefined,
    phone:
      form.phone.trim() && !/^\+?[0-9 ()-]{7,20}$/.test(form.phone.trim()) ? "Enter a valid phone number" : undefined,
  };
}

function validateCredentials({ password, confirmPassword }: Credentials): FieldErrors {
  return {
    password: validatePassword(password),
    confirmPassword: confirmPassword !== password ? "Passwords don't match" : undefined,
  };
}

function apiFieldErrors(err: ApiError): FieldErrors {
  const field = FIELD_ERROR_CODES[err.code];
  return field ? { [field]: err.message } : err.fieldErrors();
}

export default function ClientFormPage() {
  const { id } = useParams<{ id: string }>();
  // Remount per client so state never leaks between "new" and an existing client.
  return <ClientForm key={id ?? "new"} clientId={id} />;
}

function ClientForm({ clientId }: { clientId: string | undefined }) {
  const isNew = clientId === undefined;
  const navigate = useNavigate();
  const location = useLocation();

  const [client, setClient] = useState<Client | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [credentials, setCredentials] = useState<Credentials>(EMPTY_CREDENTIALS);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>((location.state as FeedbackState | null)?.feedback ?? null);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    adminClientsApi
      .get(clientId)
      .then((loaded) => {
        if (cancelled) return;
        setClient(loaded);
        setForm(toForm(loaded));
      })
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  // New clients always get admin-issued credentials; existing ones keep the login they were created with.
  const usesUsername = isNew || Boolean(client?.owner?.username);

  function update<K extends keyof FormState>(key: K) {
    return (value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  }

  function updateCredential(key: keyof Credentials) {
    return (value: string) => setCredentials((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = { ...validate(form, usesUsername), ...(isNew ? validateCredentials(credentials) : {}) };
    setErrors(nextErrors);
    setFeedback(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    const username = form.username.trim().toLowerCase();
    const input: ClientDetailsInput = {
      businessName: form.businessName.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      ...(usesUsername ? { username } : {}),
    };

    setSaving(true);
    try {
      if (isNew) {
        const created = await adminClientsApi.create({ ...input, username, password: credentials.password });
        const feedback: Feedback = {
          status: "success",
          message: `Client created. They can log in now with the username “${created.owner?.username}” and the password you set.`,
        };
        navigate(`/admin/clients/${created.id}`, { replace: true, state: { feedback } satisfies FeedbackState });
        return;
      }
      const saved = await adminClientsApi.update(clientId, input);
      setClient(saved);
      setForm(toForm(saved));
      setFeedback({ status: "success", message: "Client saved." });
    } catch (err) {
      if (err instanceof ApiError) setErrors(apiFieldErrors(err));
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  if (!isNew && !client) {
    return (
      <div className="px-6 py-8 sm:px-8">
        <BackLink />
        {loadError ? (
          <div className="mt-6 max-w-2xl">
            <FormAlert status="danger">{loadError}</FormAlert>
          </div>
        ) : (
          <div className="grid place-items-center py-20">
            <Spinner aria-label="Loading client" />
          </div>
        )}
      </div>
    );
  }

  const title = isNew ? "Add client" : `Edit client: ${client?.businessName}`;

  return (
    <form onSubmit={handleSubmit} noValidate className="px-6 py-8 sm:px-8">
      <BackLink />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        <div className="flex gap-2">
          <Link to="/admin" className={buttonVariants({ variant: "outline" })}>
            Cancel
          </Link>
          <Button type="submit" isPending={saving}>
            {isNew ? "Create client" : "Save client"}
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="mt-5 max-w-3xl">
          <FormAlert status={feedback.status}>{feedback.message}</FormAlert>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-line bg-surface p-6">
            <h2 className="text-base font-semibold text-ink">Client details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Business name"
                name="businessName"
                value={form.businessName}
                onChange={update("businessName")}
                error={errors.businessName}
                autoFocus={isNew}
                isRequired
              />
              <TextInput
                label="Contact person"
                name="fullName"
                value={form.fullName}
                onChange={update("fullName")}
                error={errors.fullName}
                isRequired
              />
              {usesUsername && !isNew && (
                <TextInput
                  label="Username (login)"
                  name="username"
                  autoComplete="off"
                  value={form.username}
                  onChange={update("username")}
                  error={errors.username}
                  description={USERNAME_HINT}
                  isRequired
                />
              )}
              <TextInput
                label={usesUsername ? "Email (optional)" : "Email (login)"}
                name="email"
                type="email"
                value={form.email}
                onChange={update("email")}
                error={errors.email}
                isRequired={!usesUsername}
                description={
                  usesUsername
                    ? "Used for contact form messages and receipts. Not verified."
                    : isNew
                      ? undefined
                      : "Changing it cancels any pending invite link."
                }
              />
              <TextInput
                label="Phone (optional)"
                name="phone"
                type="tel"
                placeholder="+91"
                value={form.phone}
                onChange={update("phone")}
                error={errors.phone}
              />
              <div className="sm:col-span-2">
                <TextAreaInput
                  label="Address (optional)"
                  name="address"
                  value={form.address}
                  onChange={update("address")}
                  error={errors.address}
                />
              </div>
            </div>
          </section>

          {isNew && (
            <section className="rounded-xl border border-line bg-surface p-6">
              <h2 className="text-base font-semibold text-ink">Login credentials</h2>
              <p className="mt-1 text-sm text-ink-body">
                The account is active right away. Share these details with the client privately; no email or phone
                verification is needed.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <TextInput
                    label="Username"
                    name="username"
                    autoComplete="off"
                    value={form.username}
                    onChange={update("username")}
                    error={errors.username}
                    description={USERNAME_HINT}
                    isRequired
                  />
                </div>
                <TextInput
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={credentials.password}
                  onChange={updateCredential("password")}
                  error={errors.password}
                  description={PASSWORD_HINT}
                  isRequired
                />
                <TextInput
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={credentials.confirmPassword}
                  onChange={updateCredential("confirmPassword")}
                  error={errors.confirmPassword}
                  isRequired
                />
              </div>
            </section>
          )}
        </div>

        {client && <ClientSidebar client={client} onChange={setClient} onFeedback={setFeedback} />}
      </div>
    </form>
  );
}

function BackLink() {
  return (
    <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
      <ArrowLeft className="size-4" aria-hidden /> Clients
    </Link>
  );
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}

function ClientSidebar({
  client,
  onChange,
  onFeedback,
}: {
  client: Client;
  onChange: (client: Client) => void;
  onFeedback: (feedback: Feedback) => void;
}) {
  const [confirmingSuspend, setConfirmingSuspend] = useState(false);
  const [busy, setBusy] = useState<"suspend" | "reactivate" | "resend" | null>(null);
  const owner = client.owner;

  async function run(action: "suspend" | "reactivate" | "resend") {
    setBusy(action);
    onFeedback(null);
    try {
      if (action === "resend") {
        const { emailSent } = await adminClientsApi.resendEmail(client.id);
        onFeedback(
          emailSent
            ? { status: "success", message: `Email sent to ${owner?.email}.` }
            : { status: "danger", message: "The email couldn't be sent. Check Email settings." },
        );
      } else {
        const updated =
          action === "suspend" ? await adminClientsApi.suspend(client.id) : await adminClientsApi.reactivate(client.id);
        onChange(updated);
        onFeedback({
          status: "success",
          message: action === "suspend" ? "Client suspended and signed out everywhere." : "Client reactivated.",
        });
      }
    } catch (err) {
      onFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setBusy(null);
      setConfirmingSuspend(false);
    }
  }

  return (
    <aside className="flex flex-col gap-6">
      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="text-base font-semibold text-ink">Summary</h2>
        <dl className="mt-3">
          <SummaryRow label="Status">
            <ClientStatusChip status={owner?.status} />
          </SummaryRow>
          <SummaryRow label="Source">{SOURCE_LABELS[client.source]}</SummaryRow>
          <SummaryRow label="Joined">{formatDate(client.createdAt)}</SummaryRow>
          {owner?.username && <SummaryRow label="Username">@{owner.username}</SummaryRow>}
          <SummaryRow label="Email verified">
            {owner?.username ? "Not required" : owner?.emailVerified ? "Yes" : "No"}
          </SummaryRow>
          <SummaryRow label="Last login">{owner?.lastSignedInAt ? formatDate(owner.lastSignedInAt) : "Never"}</SummaryRow>
        </dl>
        {owner?.status === "PENDING_VERIFICATION" && (
          <Button fullWidth variant="outline" size="sm" className="mt-4" isPending={busy === "resend"} onPress={() => run("resend")}>
            {client.source === "ADMIN_CREATED" ? "Resend invite" : "Resend verification code"}
          </Button>
        )}
        <Link
          to={`/websites/new?clientId=${encodeURIComponent(client.id)}`}
          className={`${buttonVariants({ variant: "outline", size: "sm", fullWidth: true })} mt-3`}
        >
          Create website for this client
        </Link>
      </section>

      {owner?.username && <ResetPasswordSection client={client} onChange={onChange} onFeedback={onFeedback} />}

      {owner && (
        <section className="rounded-xl border border-red-200 bg-surface p-5">
          <h2 className="text-base font-semibold text-red-700">Danger zone</h2>
          {owner.status === "SUSPENDED" ? (
            <>
              <p className="mt-2 text-xs leading-relaxed text-ink-body">
                This client can't log in. Reactivating restores access with their existing password.
              </p>
              <Button fullWidth variant="outline" className="mt-4" isPending={busy === "reactivate"} onPress={() => run("reactivate")}>
                Reactivate client
              </Button>
            </>
          ) : (
            <>
              <p className="mt-2 text-xs leading-relaxed text-ink-body">
                Suspended clients can't log in and are signed out of every device immediately.
              </p>
              {confirmingSuspend ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="outline" onPress={() => setConfirmingSuspend(false)} isDisabled={busy === "suspend"}>
                    Cancel
                  </Button>
                  <Button variant="danger" isPending={busy === "suspend"} onPress={() => run("suspend")}>
                    Confirm
                  </Button>
                </div>
              ) : (
                <Button fullWidth variant="danger-soft" className="mt-4" onPress={() => setConfirmingSuspend(true)}>
                  Suspend client
                </Button>
              )}
            </>
          )}
        </section>
      )}
    </aside>
  );
}

/** Admin-issued logins have no reset email, so the admin sets a new password here. */
function ResetPasswordSection({
  client,
  onChange,
  onFeedback,
}: {
  client: Client;
  onChange: (client: Client) => void;
  onFeedback: (feedback: Feedback) => void;
}) {
  const [open, setOpen] = useState(false);
  const [credentials, setCredentials] = useState<Credentials>(EMPTY_CREDENTIALS);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  function close() {
    setOpen(false);
    setCredentials(EMPTY_CREDENTIALS);
    setErrors({});
  }

  async function save() {
    const nextErrors = validateCredentials(credentials);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSaving(true);
    try {
      onChange(await adminClientsApi.setPassword(client.id, credentials.password));
      onFeedback({ status: "success", message: "Password updated. The client was signed out of every device." });
      close();
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      onFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <h2 className="text-base font-semibold text-ink">Password</h2>
      <p className="mt-2 text-xs leading-relaxed text-ink-body">
        This client logs in with a username, so they can't reset their password by email. Set a new one here and share
        it privately.
      </p>
      <Button fullWidth variant="outline" size="sm" className="mt-4" onPress={() => setOpen(true)}>
        Reset password
      </Button>

      <CommonModal
        isOpen={open}
        onClose={close}
        title="Reset password"
        subtitle={`For @${client.owner?.username}`}
        primaryAction={{ label: "Save password", onPress: save, isPending: saving }}
        secondaryAction={{ label: "Cancel", onPress: close }}
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="New password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={credentials.password}
            onChange={(password) => setCredentials((current) => ({ ...current, password }))}
            error={errors.password}
            description={PASSWORD_HINT}
            autoFocus
            isRequired
          />
          <TextInput
            label="Confirm password"
            name="confirmNewPassword"
            type="password"
            autoComplete="new-password"
            value={credentials.confirmPassword}
            onChange={(confirmPassword) => setCredentials((current) => ({ ...current, confirmPassword }))}
            error={errors.confirmPassword}
            isRequired
          />
        </div>
      </CommonModal>
    </section>
  );
}
