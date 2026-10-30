import { useEffect, useState, type ReactNode } from "react";
import { Button, Spinner } from "@heroui/react";
import {
  ArrowRightLeft,
  Check,
  ClipboardList,
  Copy,
  ExternalLink,
  FileText,
  Film,
  MailCheck,
  MailWarning,
  Plus,
  RefreshCw,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { errorMessage } from "../../api/http.ts";
import {
  adminQuestionnairesApi,
  type Questionnaire,
  type QuestionnaireActivity,
  type QuestionnaireAssets,
  type QuestionnaireStatus,
} from "../../features/questionnaire/api.ts";
import TemplateThumbnail from "../websites/TemplateThumbnail.tsx";
import CommonModal from "../ui/AppModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import TextAreaInput from "../ui/TextAreaInput.tsx";
import QuestionnaireStatusMenu from "./QuestionnaireStatusMenu.tsx";
import {
  emailNotSent,
  formatWhen,
  STATUS_META,
  timeAgo,
} from "./questionnaire-labels.ts";

type Busy = "status" | "note" | "resend" | null;

type QuestionnaireDetailModalProps = {
  questionnaire: Questionnaire;
  onClose: () => void;
  onChanged: (updated: Questionnaire) => void;
  onDelete: (questionnaire: Questionnaire) => void;
};

export default function QuestionnaireDetailModal({
  questionnaire: initial,
  onClose,
  onChanged,
  onDelete,
}: QuestionnaireDetailModalProps) {
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState(initial);
  const [activity, setActivity] = useState<QuestionnaireActivity[] | null>(null);
  const [assets, setAssets] = useState<QuestionnaireAssets | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const detail = await adminQuestionnairesApi.get(initial.id);
        if (cancelled) return;
        setActivity(detail.activity);
        setAssets(detail.assets);
        const current = detail.questionnaire.read
          ? detail.questionnaire
          : await adminQuestionnairesApi.update(initial.id, { read: true });
        if (cancelled) return;
        setQuestionnaire(current);
        onChanged(current);
      } catch (err) {
        if (cancelled) return;
        setError(errorMessage(err));
        setActivity([]);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [initial.id, onChanged]);

  async function handleStatusChange(status: QuestionnaireStatus) {
    if (status === questionnaire.status) return;
    setBusy("status");
    setError(null);
    try {
      const updated = await adminQuestionnairesApi.update(questionnaire.id, { status });
      setQuestionnaire(updated);
      onChanged(updated);
      const detail = await adminQuestionnairesApi.get(questionnaire.id);
      setActivity(detail.activity);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleAddNote() {
    const text = note.trim();
    if (!text) return;
    setBusy("note");
    setError(null);
    try {
      const item = await adminQuestionnairesApi.addNote(questionnaire.id, text);
      setActivity((prev) => (prev ? [item, ...prev] : [item]));
      setNote("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleResendEmail() {
    setBusy("resend");
    setError(null);
    try {
      const updated = await adminQuestionnairesApi.resendEmail(questionnaire.id);
      setQuestionnaire(updated);
      onChanged(updated);
      const detail = await adminQuestionnairesApi.get(questionnaire.id);
      setActivity(detail.activity);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  function copyPublicLink() {
    const link = `${window.location.origin}/start`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }

  function copyEmail() {
    navigator.clipboard.writeText(questionnaire.email).then(() => {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    });
  }

  function copyPhone() {
    navigator.clipboard.writeText(questionnaire.phone).then(() => {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    });
  }

  function handleCreateWebsite() {
    onClose();
    const clientIdParam = questionnaire.clientId ? `&clientId=${questionnaire.clientId}` : "";
    navigate(`/websites/new?mode=ai${clientIdParam}&questionnaireId=${questionnaire.id}`);
  }

  const { answers } = questionnaire;
  const hasFiles = Boolean(
    assets?.logo ||
    (assets && assets.files.length > 0) ||
    questionnaire.filesLink,
  );

  return (
    <CommonModal
      isOpen
      onClose={onClose}
      size="lg"
      title={questionnaire.businessName}
      subtitle={`Submitted ${formatWhen(questionnaire.createdAt)} · ${timeAgo(questionnaire.createdAt)}`}
      modalFooter={
        <div className="flex w-full items-center justify-between gap-3">
          <Button
            size="sm"
            variant="ghost"
            className="text-ed-danger hover:bg-ed-danger/10"
            onPress={() => onDelete(questionnaire)}
          >
            <Trash2 className="size-4" aria-hidden /> Delete
          </Button>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onPress={onClose}>
              Close
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-brand font-semibold text-white shadow-xs hover:bg-brand-hover"
              onPress={handleCreateWebsite}
            >
              <Plus className="size-4" aria-hidden /> Create website
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {error && <FormAlert status="danger">{error}</FormAlert>}

        {/* Top Status & Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-ink-muted">Status:</span>
            <QuestionnaireStatusMenu
              status={questionnaire.status}
              onChange={handleStatusChange}
              isDisabled={busy === "status"}
            />
            {busy === "status" && <Spinner size="sm" aria-label="Updating status" />}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onPress={copyPublicLink}
              className="gap-1.5 text-xs"
            >
              {copiedLink ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              {copiedLink ? "Link copied" : "Share public form"}
            </Button>
            {emailNotSent(questionnaire) && (
              <Button
                size="sm"
                variant="outline"
                isDisabled={busy === "resend"}
                onPress={handleResendEmail}
                className="gap-1.5 text-xs text-amber-700"
              >
                {busy === "resend" ? <Spinner size="sm" /> : <RefreshCw className="size-3.5" />}
                Resend email
              </Button>
            )}
          </div>
        </div>

        {/* Email Warning Banner if delivery failed */}
        {emailNotSent(questionnaire) && (
          <FormAlert status="warning" title="Notification email failed to deliver">
            <span className="block">{questionnaire.emailError ?? "The notification email could not be sent."}</span>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              isPending={busy === "resend"}
              onPress={handleResendEmail}
            >
              Resend notification email
            </Button>
          </FormAlert>
        )}

        {/* Section 1: Contact & Business Details */}
        <section>
          <h3 className="text-xs font-medium tracking-wide text-ink-muted uppercase">
            Contact &amp; Business
          </h3>
          <dl className="mt-2 divide-y divide-line rounded-xl border border-line bg-surface shadow-2xs">
            <Field label="Business name">
              <span className="font-semibold text-ink">{questionnaire.businessName}</span>
            </Field>
            <Field label="Contact person">
              {questionnaire.name}
            </Field>
            <Field label="Email address">
              <span className="flex min-w-0 items-center gap-1.5">
                <a
                  href={`mailto:${questionnaire.email}`}
                  className="truncate text-brand hover:underline"
                >
                  {questionnaire.email}
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={copiedEmail ? "Email copied" : "Copy email"}
                  className="grid size-6 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-canvas hover:text-ink transition-colors"
                >
                  {copiedEmail ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                </button>
              </span>
            </Field>
            <Field label="Phone number">
              <span className="flex min-w-0 items-center gap-1.5">
                <a
                  href={`tel:${questionnaire.phone}`}
                  className="text-brand hover:underline"
                >
                  {questionnaire.phone}
                </a>
                <button
                  type="button"
                  onClick={copyPhone}
                  aria-label={copiedPhone ? "Phone copied" : "Copy phone"}
                  className="grid size-6 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-canvas hover:text-ink transition-colors"
                >
                  {copiedPhone ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                </button>
              </span>
            </Field>
            {questionnaire.clientBusinessName && (
              <Field label="Client workspace">
                <span className="inline-flex items-center rounded-md bg-canvas px-2 py-0.5 text-xs font-medium text-ink">
                  {questionnaire.clientBusinessName}
                </span>
              </Field>
            )}
            {questionnaire.ref && (
              <Field label="Referral code">
                <span className="font-mono text-xs text-ink-muted">{questionnaire.ref}</span>
              </Field>
            )}
          </dl>
        </section>

        {/* Section 2: Website Specifications */}
        <section>
          <h3 className="text-xs font-medium tracking-wide text-ink-muted uppercase">
            Website Specifications
          </h3>
          <dl className="mt-2 divide-y divide-line rounded-xl border border-line bg-surface shadow-2xs">
            <Field label="Industry / Type">
              <span className="inline-block rounded-md bg-canvas px-2.5 py-1 text-xs font-medium text-ink">
                {answers?.businessType || "Not specified"}
              </span>
            </Field>

            <Field label="Pages requested">
              {answers?.pages && answers.pages.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {answers.pages.map((page) => (
                    <span
                      key={page}
                      className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand"
                    >
                      {page}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-ink-muted">Default pages</span>
              )}
            </Field>

            <Field label="Look &amp; Style">
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
                <span>
                  {answers?.look} · {answers?.style}
                </span>
                <span className="rounded-md bg-canvas px-2 py-0.5 text-xs font-normal text-ink-muted">
                  Palette: {answers?.palette}
                </span>
              </div>
            </Field>

            {(assets?.theme || answers?.themeId) && (
              <Field label="Theme">
                {assets?.theme ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-5 w-10 items-end gap-0.5 rounded border border-black/10 p-0.5"
                      style={{ background: assets.theme.settings.colors.background }}
                      aria-hidden
                    >
                      <span
                        className="h-2.5 w-3 rounded-2xs"
                        style={{ background: assets.theme.settings.colors.primary }}
                      />
                      <span
                        className="h-1.5 flex-1 rounded-2xs"
                        style={{ background: assets.theme.settings.colors.secondary }}
                      />
                    </span>
                    <span className="font-medium text-ink">{assets.theme.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-ink-muted italic">Team chooses</span>
                )}
              </Field>
            )}

            {(assets?.template || answers?.templateKey) && (
              <Field label="Starting template">
                {assets?.template ? (
                  <div className="flex items-center gap-3">
                    <div className="w-16 shrink-0 overflow-hidden rounded border border-line">
                      <TemplateThumbnail
                        template={{ ...assets.template, isCustom: false }}
                        theme={assets.theme?.settings}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink">{assets.template.name}</p>
                      <p className="truncate text-xs text-ink-muted">{assets.template.category}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-ink-muted italic">No template selected</span>
                )}
              </Field>
            )}

            <Field label="Contact methods">
              <div className="flex flex-wrap items-center gap-2">
                <ReachBadge
                  label="Call button"
                  enabled={Boolean(answers?.reach?.call?.enabled)}
                  extra={answers?.reach?.call?.differentContact}
                />
                <ReachBadge
                  label="WhatsApp"
                  enabled={Boolean(answers?.reach?.whatsapp?.enabled)}
                  extra={answers?.reach?.whatsapp?.differentContact}
                />
                <ReachBadge
                  label="Enquiry form"
                  enabled={Boolean(answers?.reach?.enquiryForm?.enabled)}
                  extra={answers?.reach?.enquiryForm?.differentContact}
                />
                <ReachBadge
                  label="Map location"
                  enabled={Boolean(answers?.reach?.mapLocation?.enabled)}
                />
              </div>
              {answers?.reach?.socialLinks && answers.reach.socialLinks.length > 0 && (
                <p className="mt-2 text-xs text-ink-muted">
                  Social profiles: <span className="font-medium text-ink">{answers.reach.socialLinks.join(", ")}</span>
                </p>
              )}
            </Field>

            {answers?.features && answers.features.length > 0 && (
              <Field label="Requested features">
                <div className="flex flex-wrap gap-1.5">
                  {answers.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-xs text-ink"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </Field>
            )}

            <Field label="Asset readiness">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 text-xs">
                <div className="rounded-lg bg-canvas/60 p-2 border border-line/60">
                  <span className="block text-[11px] text-ink-muted">Logo</span>
                  <span className="font-semibold text-ink">{answers?.logo || "—"}</span>
                </div>
                <div className="rounded-lg bg-canvas/60 p-2 border border-line/60">
                  <span className="block text-[11px] text-ink-muted">Copy / Text</span>
                  <span className="font-semibold text-ink">{answers?.text || "—"}</span>
                </div>
                <div className="rounded-lg bg-canvas/60 p-2 border border-line/60">
                  <span className="block text-[11px] text-ink-muted">Photos</span>
                  <span className="font-semibold text-ink">{answers?.photos || "—"}</span>
                </div>
                <div className="rounded-lg bg-canvas/60 p-2 border border-line/60">
                  <span className="block text-[11px] text-ink-muted">Domain</span>
                  <span className="font-semibold text-ink">{answers?.domain || "—"}</span>
                </div>
                <div className="rounded-lg bg-canvas/60 p-2 border border-line/60">
                  <span className="block text-[11px] text-ink-muted">Timeline</span>
                  <span className="font-semibold text-ink">{answers?.needed || "—"}</span>
                </div>
              </div>
            </Field>
          </dl>
        </section>

        {/* Section 3: Files & Assets (only shown if provided) */}
        {hasFiles && (
          <section>
            <h3 className="text-xs font-medium tracking-wide text-ink-muted uppercase">
              Files &amp; Deliverables
            </h3>
            <div className="mt-2 space-y-3 rounded-xl border border-line bg-surface p-4 shadow-2xs">
              {assets?.logo && (
                <div>
                  <span className="block text-xs font-medium text-ink-muted">Provided logo</span>
                  <a
                    href={assets.logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex h-14 max-w-44 items-center justify-center overflow-hidden rounded-lg border border-line bg-canvas p-2 transition-colors hover:border-brand"
                    title={assets.logo.fileName}
                  >
                    <img
                      src={assets.logo.url}
                      alt="Client logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </a>
                </div>
              )}

              {assets && assets.files.length > 0 && (
                <div>
                  <span className="block text-xs font-medium text-ink-muted">
                    Uploaded assets ({assets.files.length})
                  </span>
                  <ul className="mt-2 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                    {assets.files.map((file) => (
                      <li key={file.id}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={file.fileName}
                          className="group relative block aspect-square overflow-hidden rounded-lg border border-line bg-canvas transition-colors hover:border-brand"
                        >
                          {file.kind === "IMAGE" ? (
                            <img
                              src={file.url}
                              alt={file.altText ?? file.fileName}
                              className="size-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <span className="flex size-full flex-col items-center justify-center gap-1 p-2 text-center text-xs text-ink-muted">
                              {file.kind === "VIDEO" ? (
                                <Film className="size-5 text-brand" />
                              ) : (
                                <FileText className="size-5 text-brand" />
                              )}
                              <span className="w-full truncate text-[10px]">{file.fileName}</span>
                            </span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {questionnaire.filesLink && (
                <div className="pt-1">
                  <span className="block text-xs font-medium text-ink-muted">Cloud storage link</span>
                  <a
                    href={questionnaire.filesLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline break-all"
                  >
                    {questionnaire.filesLink} <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section 4: Client Notes (if provided) */}
        {questionnaire.notes && (
          <section>
            <h3 className="text-xs font-medium tracking-wide text-ink-muted uppercase">
              Client Notes &amp; Instructions
            </h3>
            <p className="mt-2 rounded-xl border border-line bg-canvas px-4 py-3 text-sm leading-relaxed break-words whitespace-pre-line text-ink">
              {questionnaire.notes}
            </p>
          </section>
        )}

        {/* Section 5: Internal Notes and Activity Timeline */}
        <section>
          <h3 className="text-xs font-medium tracking-wide text-ink-muted uppercase">
            Internal Notes &amp; Activity
          </h3>
          <div className="mt-2 space-y-2">
            <TextAreaInput
              label="Add an internal note"
              name="questionnaire-note"
              value={note}
              onChange={setNote}
              rows={2}
              placeholder="e.g. Spoke to client on phone, agreed on modern minimalist look"
              description="Only Super Admins can see internal notes."
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                isDisabled={!note.trim()}
                isPending={busy === "note"}
                onPress={handleAddNote}
              >
                Add note
              </Button>
            </div>
          </div>

          {activity === null ? (
            <div className="grid place-items-center py-6">
              <Spinner size="sm" aria-label="Loading activity" />
            </div>
          ) : (
            <ol className="mt-5 space-y-4">
              {activity.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
              <TimelineRow
                icon={<ClipboardList className="size-3.5" />}
                title="Questionnaire submitted"
                at={questionnaire.createdAt}
              />
            </ol>
          )}
        </section>
      </div>
    </CommonModal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] items-start gap-3 px-4 py-2.5 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <dt className="pt-0.5 text-xs font-medium text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-sm break-words text-ink">{children}</dd>
    </div>
  );
}

function ReachBadge({
  label,
  enabled,
  extra,
}: {
  label: string;
  enabled: boolean;
  extra?: string | null;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        enabled
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-line bg-canvas text-ink-muted"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${enabled ? "bg-emerald-600" : "bg-ink-muted/50"}`}
        aria-hidden
      />
      {label}
      {enabled && extra ? ` (${extra})` : ""}
    </span>
  );
}

function ActivityItem({ item }: { item: QuestionnaireActivity }) {
  const who = item.actorName ?? "System";
  switch (item.kind) {
    case "NOTE":
      return (
        <TimelineRow
          icon={<StickyNote className="size-3.5" />}
          title={`${who} added a note`}
          at={item.createdAt}
        >
          {item.body && (
            <p className="mt-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm break-words whitespace-pre-line text-ink">
              {item.body}
            </p>
          )}
        </TimelineRow>
      );
    case "STATUS_CHANGED": {
      const label =
        item.body && item.body in STATUS_META
          ? STATUS_META[item.body as QuestionnaireStatus].label
          : item.body;
      return (
        <TimelineRow
          icon={<ArrowRightLeft className="size-3.5" />}
          title={`${who} changed the status to ${label}`}
          at={item.createdAt}
        />
      );
    }
    case "EMAIL_SENT":
      return (
        <TimelineRow
          icon={<MailCheck className="size-3.5" />}
          title={
            item.actorName
              ? `${who} resent the email notification`
              : "Email notification delivered"
          }
          at={item.createdAt}
        />
      );
    case "EMAIL_NOT_SENT":
      return (
        <TimelineRow
          icon={<MailWarning className="size-3.5 text-amber-600" />}
          title="Notification email failed to deliver"
          at={item.createdAt}
        >
          {item.body && <p className="mt-0.5 text-xs text-ink-muted">{item.body}</p>}
        </TimelineRow>
      );
  }
}

function TimelineRow({
  icon,
  title,
  at,
  children,
}: {
  icon: ReactNode;
  title: string;
  at: string;
  children?: ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span
        className="grid size-7 shrink-0 place-items-center rounded-full bg-canvas text-ink-muted border border-line/50"
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm text-ink">
          {title}
          <span className="ml-2 text-xs text-ink-muted" title={formatWhen(at)}>
            {timeAgo(at)}
          </span>
        </p>
        {children}
      </div>
    </li>
  );
}
