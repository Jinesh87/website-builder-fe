import { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import {
  Check,
  Copy,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { errorMessage } from "../../api/http.ts";
import {
  adminQuestionnairesApi,
  type Questionnaire,
  type QuestionnaireActivity,
  type QuestionnaireStatus,
} from "../../features/questionnaire/api.ts";
import CommonModal from "../ui/AppModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import TextAreaInput from "../ui/TextAreaInput.tsx";
import {
  QUESTIONNAIRE_STATUSES,
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
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const detail = await adminQuestionnairesApi.get(initial.id);
        if (cancelled) return;
        setActivity(detail.activity);
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
      // Reload activity
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

  function handleCreateWebsite() {
    onClose();
    const clientIdParam = questionnaire.clientId ? `&clientId=${questionnaire.clientId}` : "";
    navigate(`/websites/new?mode=ai${clientIdParam}&questionnaireId=${questionnaire.id}`);
  }

  const { answers } = questionnaire;

  return (
    <CommonModal
      isOpen
      onClose={onClose}
      size="lg"
      title={
        <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-ink">
              {questionnaire.businessName}
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                STATUS_META[questionnaire.status]?.tone === "brand"
                  ? "bg-brand/10 text-brand"
                  : STATUS_META[questionnaire.status]?.tone === "warning"
                    ? "bg-amber-500/10 text-amber-500"
                    : STATUS_META[questionnaire.status]?.tone === "success"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-canvas text-ink-muted"
              }`}
            >
              {STATUS_META[questionnaire.status]?.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onPress={copyPublicLink}
              className="gap-1.5 text-xs font-medium"
            >
              {copiedLink ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              {copiedLink ? "Link copied!" : "Copy public link"}
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-brand text-xs font-semibold text-white shadow hover:bg-brand-hover"
              onPress={handleCreateWebsite}
            >
              <Sparkles className="size-3.5" /> Create website
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {error && <FormAlert status="danger">{error}</FormAlert>}

        {/* Status selector & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-muted">Status:</span>
            <select
              value={questionnaire.status}
              disabled={busy === "status"}
              onChange={(e) => handleStatusChange(e.target.value as QuestionnaireStatus)}
              className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink outline-none focus:border-brand"
            >
              {QUESTIONNAIRE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {STATUS_META[st]?.label}
                </option>
              ))}
            </select>
            {busy === "status" && <Spinner size="sm" />}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              isDisabled={busy === "resend"}
              onPress={handleResendEmail}
              className="gap-1.5 text-xs"
            >
              {busy === "resend" ? <Spinner size="sm" /> : <RefreshCw className="size-3.5" />}
              Resend notification
            </Button>
            <Button
              size="sm"
              variant="danger"
              onPress={() => onDelete(questionnaire)}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </div>
        </div>

        {/* 2-Column Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Grouped Sections */}
          <div className="space-y-4 lg:col-span-2">
            {/* Section 1: Contact Details */}
            <div className="rounded-xl border border-line bg-surface p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                1. Contact &amp; Business Details
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-ink-muted">Business name:</span>
                  <p className="font-semibold text-ink">{questionnaire.businessName}</p>
                </div>
                <div>
                  <span className="text-ink-muted">Contact person:</span>
                  <p className="font-semibold text-ink">{questionnaire.name}</p>
                </div>
                <div>
                  <span className="text-ink-muted">Email:</span>
                  <p>
                    <a href={`mailto:${questionnaire.email}`} className="font-semibold text-brand hover:underline">
                      {questionnaire.email}
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-ink-muted">Mobile / Phone:</span>
                  <p>
                    <a href={`tel:${questionnaire.phone}`} className="font-semibold text-brand hover:underline">
                      {questionnaire.phone}
                    </a>
                  </p>
                </div>
                {questionnaire.ref && (
                  <div>
                    <span className="text-ink-muted">Referral Ref:</span>
                    <p className="font-medium text-ink">{questionnaire.ref}</p>
                  </div>
                )}
                {questionnaire.clientBusinessName && (
                  <div>
                    <span className="text-ink-muted">Linked Client Workspace:</span>
                    <p className="font-semibold text-brand">{questionnaire.clientBusinessName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Business & Pages */}
            <div className="rounded-xl border border-line bg-surface p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                2. Business Type &amp; Pages
              </h3>
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <span className="text-ink-muted">Type:</span>
                  <span className="ml-2 inline-block rounded-full bg-canvas px-2.5 py-1 font-semibold text-ink">
                    {answers?.businessType}
                  </span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-1.5">Selected pages:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {answers?.pages?.map((page) => (
                      <span key={page} className="rounded-full bg-brand-soft text-brand px-2.5 py-0.5 font-medium">
                        {page}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Look & Colours */}
            <div className="rounded-xl border border-line bg-surface p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                3. Look &amp; Colours
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
                <div>
                  <span className="text-ink-muted">Visual Look:</span>
                  <p className="font-semibold text-ink mt-0.5">{answers?.look}</p>
                </div>
                <div>
                  <span className="text-ink-muted">Style:</span>
                  <p className="font-semibold text-ink mt-0.5">{answers?.style}</p>
                </div>
                <div>
                  <span className="text-ink-muted">Palette:</span>
                  <p className="font-semibold text-ink mt-0.5">{answers?.palette}</p>
                </div>
              </div>
            </div>

            {/* Section 4: How customers reach */}
            <div className="rounded-xl border border-line bg-surface p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                4. Customer Contact Preferences
              </h3>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${answers?.reach?.call?.enabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <span className="font-medium text-ink">Call button:</span>
                  <span className="text-ink-muted">
                    {answers?.reach?.call?.enabled
                      ? answers.reach.call.differentContact
                        ? `Enabled (${answers.reach.call.differentContact})`
                        : "Enabled"
                      : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${answers?.reach?.whatsapp?.enabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <span className="font-medium text-ink">WhatsApp button:</span>
                  <span className="text-ink-muted">
                    {answers?.reach?.whatsapp?.enabled
                      ? answers.reach.whatsapp.differentContact
                        ? `Enabled (${answers.reach.whatsapp.differentContact})`
                        : "Enabled"
                      : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${answers?.reach?.enquiryForm?.enabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <span className="font-medium text-ink">Enquiry form:</span>
                  <span className="text-ink-muted">
                    {answers?.reach?.enquiryForm?.enabled
                      ? answers.reach.enquiryForm.differentContact
                        ? `Enabled (${answers.reach.enquiryForm.differentContact})`
                        : "Enabled"
                      : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${answers?.reach?.mapLocation?.enabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <span className="font-medium text-ink">Map location:</span>
                  <span className="text-ink-muted">
                    {answers?.reach?.mapLocation?.enabled ? "Enabled (Shows on a map)" : "Disabled"}
                  </span>
                </div>
                {answers?.reach?.socialLinks && answers.reach.socialLinks.length > 0 && (
                  <div className="pt-1">
                    <span className="text-ink-muted">Social links:</span>
                    <span className="ml-2 font-medium text-ink">
                      {answers.reach.socialLinks.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Extras */}
            <div className="rounded-xl border border-line bg-surface p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                5. Extras &amp; Deliverables
              </h3>
              <div className="mt-3 space-y-3 text-xs">
                {answers?.features && answers.features.length > 0 && (
                  <div>
                    <span className="text-ink-muted block mb-1">Requested features:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {answers.features.map((f) => (
                        <span key={f} className="rounded-full bg-canvas border border-line px-2.5 py-0.5 text-ink">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <span className="text-ink-muted">Logo:</span>
                    <p className="font-semibold text-ink">{answers?.logo}</p>
                  </div>
                  <div>
                    <span className="text-ink-muted">Copy / Text:</span>
                    <p className="font-semibold text-ink">{answers?.text}</p>
                  </div>
                  <div>
                    <span className="text-ink-muted">Photos:</span>
                    <p className="font-semibold text-ink">{answers?.photos}</p>
                  </div>
                  <div>
                    <span className="text-ink-muted">Domain:</span>
                    <p className="font-semibold text-ink">{answers?.domain}</p>
                  </div>
                  <div>
                    <span className="text-ink-muted">Needed:</span>
                    <p className="font-semibold text-ink">{answers?.needed}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6: Files & Notes */}
            <div className="rounded-xl border border-line bg-surface p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                6. Files &amp; Notes
              </h3>
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <span className="text-ink-muted">Drive / WeTransfer link:</span>
                  {questionnaire.filesLink ? (
                    <p className="mt-0.5">
                      <a
                        href={questionnaire.filesLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-brand hover:underline break-all"
                      >
                        {questionnaire.filesLink} <ExternalLink className="size-3" />
                      </a>
                    </p>
                  ) : (
                    <p className="text-ink-muted italic">No link provided</p>
                  )}
                </div>

                <div>
                  <span className="text-ink-muted">Notes / instructions:</span>
                  {questionnaire.notes ? (
                    <p className="mt-1 whitespace-pre-wrap rounded-lg bg-canvas p-3 text-ink leading-relaxed">
                      {questionnaire.notes}
                    </p>
                  ) : (
                    <p className="text-ink-muted italic">No extra notes</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline & Notes */}
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-surface p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-2">
                <StickyNote className="size-4" /> Internal Notes &amp; Activity
              </h3>

              <div className="mt-3">
                <TextAreaInput
                  label="Add note"
                  name="note"
                  value={note}
                  onChange={(val) => setNote(val)}
                  rows={3}
                  placeholder="Add an internal note..."
                />
                <Button
                  size="sm"
                  isDisabled={busy === "note" || !note.trim()}
                  onPress={handleAddNote}
                  className="mt-2 w-full gap-1.5 bg-brand text-xs font-semibold text-white shadow"
                >
                  {busy === "note" ? <Spinner size="sm" /> : <Plus className="size-3.5" />} Add note
                </Button>
              </div>

              {/* Activity Timeline */}
              <div className="mt-5 space-y-3 border-t border-line pt-4">
                {activity === null ? (
                  <div className="grid place-items-center py-6">
                    <Spinner size="sm" />
                  </div>
                ) : activity.length === 0 ? (
                  <p className="text-center text-xs text-ink-muted py-4">No activity logged yet.</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {activity.map((act) => (
                      <div key={act.id} className="rounded-lg bg-canvas p-2.5 text-xs">
                        <div className="flex items-center justify-between text-ink-muted">
                          <span className="font-semibold text-ink">
                            {act.actorName || "System"}
                          </span>
                          <span>{timeAgo(act.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-ink-body whitespace-pre-wrap">
                          {act.body || act.kind}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommonModal>
  );
}
