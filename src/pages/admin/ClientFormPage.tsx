import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button, Checkbox, Label, Spinner } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { adminClientsApi, type Client, type ClientDetailsInput } from "../../api/admin-clients.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import { validateEmail } from "../../auth/validation.ts";
import { ClientStatusChip, formatDate, SOURCE_LABELS } from "../../components/admin/client-labels.tsx";
import AiModelPricingPanel from "../../components/admin/AiModelPricingPanel.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import TextAreaInput from "../../components/ui/TextAreaInput.tsx";
import TextInput from "../../components/ui/TextInput.tsx";

type Feedback = { status: "success" | "danger" | "warning"; message: string } | null;
type FieldErrors = Partial<Record<keyof ClientDetailsInput, string>>;
type FeedbackState = { feedback?: Feedback };

const EMPTY_FORM: ClientDetailsInput = { businessName: "", fullName: "", email: "", phone: "", address: "" };

function toForm(client: Client): ClientDetailsInput {
  return {
    businessName: client.businessName,
    fullName: client.owner?.fullName ?? "",
    email: client.owner?.email ?? "",
    phone: client.owner?.phone ?? "",
    address: client.address ?? "",
  };
}

function validate(form: ClientDetailsInput): FieldErrors {
  return {
    businessName: form.businessName.trim().length < 2 ? "Enter the business name" : undefined,
    fullName: form.fullName.trim().length < 2 ? "Enter the contact person's name" : undefined,
    email: validateEmail(form.email),
    phone:
      form.phone.trim() && !/^\+?[0-9 ()-]{7,20}$/.test(form.phone.trim()) ? "Enter a valid phone number" : undefined,
  };
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
  const [form, setForm] = useState<ClientDetailsInput>(EMPTY_FORM);
  const [sendInvite, setSendInvite] = useState(true);
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

  function update<K extends keyof ClientDetailsInput>(key: K) {
    return (value: ClientDetailsInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setFeedback(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    const input: ClientDetailsInput = {
      businessName: form.businessName.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    setSaving(true);
    try {
      if (isNew) {
        const result = await adminClientsApi.create({ ...input, sendInvite });
        const created: Feedback =
          result.inviteSent === false
            ? { status: "warning", message: "Client created, but the invite email couldn't be sent. Check Email settings, then use “Resend invite”." }
            : { status: "success", message: result.inviteSent ? `Client created and invite sent to ${input.email}.` : "Client created." };
        navigate(`/admin/clients/${result.client.id}`, { replace: true, state: { feedback: created } satisfies FeedbackState });
        return;
      }
      const saved = await adminClientsApi.update(clientId, input);
      setClient(saved);
      setForm(toForm(saved));
      setFeedback({ status: "success", message: "Client saved." });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.code === "EMAIL_TAKEN" ? { email: err.message } : err.fieldErrors());
      }
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
    <div className="px-6 py-8 sm:px-8">
    <form onSubmit={handleSubmit} noValidate>
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
              />
              <TextInput
                label="Contact person"
                name="fullName"
                value={form.fullName}
                onChange={update("fullName")}
                error={errors.fullName}
              />
              <TextInput
                label="Email (login)"
                name="email"
                type="email"
                value={form.email}
                onChange={update("email")}
                error={errors.email}
                description={isNew ? undefined : "Changing it cancels any pending invite link."}
              />
              <TextInput
                label="Phone"
                name="phone"
                type="tel"
                placeholder="+91"
                value={form.phone}
                onChange={update("phone")}
                error={errors.phone}
              />
              <div className="sm:col-span-2">
                <TextAreaInput
                  label="Address"
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
              <h2 className="text-base font-semibold text-ink">Account access</h2>
              <p className="mt-1 text-sm text-ink-body">
                The client logs in with the email above after setting their own password.
              </p>
              <Checkbox className="mt-4" isSelected={sendInvite} onChange={setSendInvite}>
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Label className="text-sm text-ink">Send invite email to set password (link valid for 72 hours)</Label>
                </Checkbox.Content>
              </Checkbox>
            </section>
          )}
        </div>

        {client && <ClientSidebar client={client} onChange={setClient} onFeedback={setFeedback} />}
      </div>
    </form>

    {client && (
      <div className="mt-6">
        <AiModelPricingPanel clientId={client.id} />
      </div>
    )}
    </div>
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
          <SummaryRow label="Email verified">{owner?.emailVerified ? "Yes" : "No"}</SummaryRow>
          <SummaryRow label="Last login">{owner?.lastSignedInAt ? formatDate(owner.lastSignedInAt) : "Never"}</SummaryRow>
        </dl>
        {owner?.status === "PENDING_VERIFICATION" && (
          <Button fullWidth variant="outline" size="sm" className="mt-4" isPending={busy === "resend"} onPress={() => run("resend")}>
            {client.source === "ADMIN_CREATED" ? "Resend invite" : "Resend verification code"}
          </Button>
        )}
      </section>

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
