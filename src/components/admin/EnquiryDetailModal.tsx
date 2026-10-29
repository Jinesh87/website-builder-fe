import { useEffect, useState, type ReactNode } from "react";
import { Button, Spinner } from "@heroui/react";
import { ArrowRightLeft, Check, Copy, Inbox, MailCheck, MailWarning, Reply, Send, StickyNote, Trash2 } from "lucide-react";
import {
  adminEnquiriesApi,
  type Enquiry,
  type EnquiryActivity,
  type EnquiryStatus,
} from "../../api/admin-enquiries.ts";
import { errorMessage } from "../../api/http.ts";
import CommonModal from "../ui/AppModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import TextAreaInput from "../ui/TextAreaInput.tsx";
import EnquiryStatusMenu from "./EnquiryStatusMenu.tsx";
import { emailNotSent, formatWhen, STATUS_META, timeAgo } from "./enquiry-labels.ts";

type Busy = "status" | "note" | "resend" | null;

type EnquiryDetailModalProps = {
  /** The row as shown in the list; the full detail loads on open. */
  enquiry: Enquiry;
  onClose: () => void;
  /** Must be stable: it runs when the modal marks the enquiry read. */
  onChanged: (enquiry: Enquiry) => void;
  onReply: (enquiry: Enquiry) => void;
  onDelete: (enquiry: Enquiry) => void;
};

export default function EnquiryDetailModal({
  enquiry: initial,
  onClose,
  onChanged,
  onReply,
  onDelete,
}: EnquiryDetailModalProps) {
  const [enquiry, setEnquiry] = useState(initial);
  const [activity, setActivity] = useState<EnquiryActivity[] | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function open() {
      try {
        const detail = await adminEnquiriesApi.get(initial.id);
        if (cancelled) return;
        setActivity(detail.activity);
        const current = detail.enquiry.read ? detail.enquiry : await adminEnquiriesApi.update(initial.id, { read: true });
        if (cancelled) return;
        setEnquiry(current);
        onChanged(current);
      } catch (err) {
        if (cancelled) return;
        setError(errorMessage(err));
        setActivity([]);
      }
    }
    void open();
    return () => {
      cancelled = true;
    };
  }, [initial.id, onChanged]);

  async function run(kind: Exclude<Busy, null>, action: () => Promise<Enquiry>) {
    setBusy(kind);
    setError(null);
    try {
      const updated = await action();
      setEnquiry(updated);
      onChanged(updated);
      setActivity((await adminEnquiriesApi.get(updated.id)).activity);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  const changeStatus = (status: EnquiryStatus) => run("status", () => adminEnquiriesApi.update(enquiry.id, { status }));
  const resendEmail = () => run("resend", () => adminEnquiriesApi.resendEmail(enquiry.id));

  async function addNote() {
    const body = note.trim();
    if (!body) return;
    setBusy("note");
    setError(null);
    try {
      const created = await adminEnquiriesApi.addNote(enquiry.id, body);
      setActivity((current) => [created, ...(current ?? [])]);
      setNote("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(enquiry.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Couldn't copy. Select the email address and copy it manually.");
    }
  }

  return (
    <CommonModal
      isOpen
      onClose={onClose}
      size="lg"
      title="Enquiry details"
      subtitle={`Received ${formatWhen(enquiry.createdAt)}`}
      modalFooter={
        <div className="flex w-full items-center justify-between gap-3">
          <Button size="sm" variant="ghost" className="text-ed-danger" onPress={() => onDelete(enquiry)}>
            <Trash2 className="size-4" aria-hidden /> Delete
          </Button>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onPress={onClose}>
              Close
            </Button>
            <Button size="sm" onPress={() => onReply(enquiry)}>
              <Reply className="size-4" aria-hidden /> Reply
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {error && <FormAlert status="danger">{error}</FormAlert>}

        <dl className="divide-y divide-line rounded-xl border border-line">
          <Field label="Name">{enquiry.name}</Field>
          <Field label="Email">
            <span className="flex min-w-0 items-center gap-1.5">
              <a href={`mailto:${enquiry.email}`} className="truncate text-brand hover:underline">
                {enquiry.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                aria-label={copied ? "Email copied" : "Copy email"}
                className="grid size-6 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-canvas hover:text-ink"
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              </button>
            </span>
          </Field>
          <Field label="Phone">
            {enquiry.phone ? (
              <a href={`tel:${enquiry.phone}`} className="text-brand hover:underline">
                {enquiry.phone}
              </a>
            ) : (
              <span className="text-ink-muted">Not provided</span>
            )}
          </Field>
          <Field label="Subject">{enquiry.subject}</Field>
          <Field label="Status">
            <EnquiryStatusMenu status={enquiry.status} onChange={changeStatus} isDisabled={busy === "status"} />
          </Field>
        </dl>

        <section>
          <h3 className="text-xs font-medium tracking-wide text-ink-muted uppercase">Message</h3>
          <p className="mt-2 rounded-xl bg-canvas px-4 py-3 text-sm leading-relaxed break-words whitespace-pre-line text-ink">
            {enquiry.message}
          </p>
        </section>

        {emailNotSent(enquiry) && (
          <FormAlert status="warning" title="The sales inbox didn't get this enquiry by email">
            <span className="block">{enquiry.emailError ?? "The email could not be sent."}</span>
            <Button size="sm" variant="outline" className="mt-2" isPending={busy === "resend"} onPress={resendEmail}>
              Resend email
            </Button>
          </FormAlert>
        )}

        <section>
          <h3 className="text-xs font-medium tracking-wide text-ink-muted uppercase">Notes and activity</h3>
          <div className="mt-2 space-y-2">
            <TextAreaInput
              label="Add an internal note"
              name="enquiry-note"
              value={note}
              onChange={setNote}
              rows={2}
              placeholder="e.g. Called, sending a quote on Monday"
              description="Only Super Admins can see notes."
            />
            <div className="flex justify-end">
              <Button size="sm" variant="outline" isDisabled={!note.trim()} isPending={busy === "note"} onPress={addNote}>
                Add note
              </Button>
            </div>
          </div>

          {activity === null ? (
            <div className="grid place-items-center py-6">
              <Spinner size="sm" aria-label="Loading activity" />
            </div>
          ) : (
            <ol className="mt-4 space-y-4">
              {activity.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
              <TimelineRow icon={<Inbox className="size-3.5" />} title="Enquiry received from the contact page" at={enquiry.createdAt} />
            </ol>
          )}
        </section>
      </div>
    </CommonModal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-3 px-4 py-2.5">
      <dt className="text-xs font-medium text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-sm break-words text-ink">{children}</dd>
    </div>
  );
}

function ActivityItem({ item }: { item: EnquiryActivity }) {
  const who = item.actorName ?? "System";
  switch (item.kind) {
    case "NOTE":
      return (
        <TimelineRow icon={<StickyNote className="size-3.5" />} title={`${who} added a note`} at={item.createdAt}>
          <ActivityBody text={item.body} />
        </TimelineRow>
      );
    case "REPLY_SENT":
      return (
        <TimelineRow icon={<Send className="size-3.5" />} title={`${who} replied by email`} at={item.createdAt}>
          <ActivityBody text={item.body} />
        </TimelineRow>
      );
    case "STATUS_CHANGED": {
      const label = item.body && item.body in STATUS_META ? STATUS_META[item.body as EnquiryStatus].label : item.body;
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
          title={item.actorName ? `${who} resent the email to the sales inbox` : "Email sent to the sales inbox"}
          at={item.createdAt}
        />
      );
    case "EMAIL_NOT_SENT":
      return (
        <TimelineRow icon={<MailWarning className="size-3.5" />} title="Email to the sales inbox was not sent" at={item.createdAt}>
          {item.body && <p className="mt-0.5 text-xs text-ink-muted">{item.body}</p>}
        </TimelineRow>
      );
  }
}

function ActivityBody({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p className="mt-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm break-words whitespace-pre-line text-ink">
      {text}
    </p>
  );
}

function TimelineRow({ icon, title, at, children }: { icon: ReactNode; title: string; at: string; children?: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-canvas text-ink-muted" aria-hidden>
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
