import { useState } from "react";
import { Send } from "lucide-react";
import { Link } from "react-router-dom";
import { adminEnquiriesApi, type Enquiry } from "../../api/admin-enquiries.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import CommonModal from "../ui/AppModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import TextAreaInput from "../ui/TextAreaInput.tsx";
import TextInput from "../ui/TextInput.tsx";
import { replyHref } from "./enquiry-labels.ts";

const EMAIL_SETUP_CODES = new Set(["EMAIL_NOT_CONFIGURED", "EMAIL_DISABLED", "EMAIL_KEY_UNREADABLE"]);

type EnquiryReplyModalProps = {
  enquiry: Enquiry;
  onClose: () => void;
  onSent: (enquiry: Enquiry) => void;
};

/** Writes and sends a reply to the customer from the dashboard. */
export default function EnquiryReplyModal({ enquiry, onClose, onSent }: EnquiryReplyModalProps) {
  const firstName = enquiry.name.split(" ")[0];
  const [subject, setSubject] = useState(`Re: ${enquiry.subject}`);
  const [message, setMessage] = useState(`Hi ${firstName},\n\n`);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<{ message: string; needsSetup: boolean } | null>(null);

  const greetingOnly = message.trim() === `Hi ${firstName},`;
  const canSend = subject.trim().length > 0 && message.trim().length > 0 && !greetingOnly && !sending;

  async function send() {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      onSent(await adminEnquiriesApi.reply(enquiry.id, { subject: subject.trim(), message: message.trim() }));
    } catch (err) {
      setError({
        message: errorMessage(err),
        needsSetup: err instanceof ApiError && EMAIL_SETUP_CODES.has(err.code),
      });
      setSending(false);
    }
  }

  return (
    <CommonModal
      isOpen
      onClose={onClose}
      size="lg"
      title="Reply by email"
      subtitle={`To ${enquiry.name} · ${enquiry.email}`}
      primaryAction={{
        label: (
          <span className="flex items-center gap-2">
            <Send className="size-4" aria-hidden /> Send reply
          </span>
        ),
        onPress: send,
        isPending: sending,
        isDisabled: !canSend,
      }}
      secondaryAction={{ label: "Cancel", onPress: onClose }}
    >
      <div className="space-y-4">
        {error && (
          <FormAlert status="danger">
            {error.message}
            {error.needsSetup && (
              <>
                {" "}
                <Link to="/admin/settings/email" className="font-medium underline">
                  Open email settings
                </Link>
              </>
            )}
          </FormAlert>
        )}

        <TextInput label="Subject" name="reply-subject" value={subject} onChange={setSubject} isRequired />
        <TextAreaInput
          label="Message"
          name="reply-message"
          value={message}
          onChange={setMessage}
          rows={9}
          isRequired
          description="Their original message is quoted under your reply. When they answer, it goes to the sales inbox."
        />

        <p className="text-xs text-ink-muted">
          Prefer your own mail app?{" "}
          <a href={replyHref(enquiry)} className="font-medium text-brand hover:underline">
            Open it there instead
          </a>
        </p>
      </div>
    </CommonModal>
  );
}
