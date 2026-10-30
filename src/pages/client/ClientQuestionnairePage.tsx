import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { Calendar, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/auth-context.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import { STATUS_META } from "../../components/admin/questionnaire-labels.ts";
import {
  questionnaireApi,
  type Questionnaire,
} from "../../features/questionnaire/api.ts";
import QuestionnaireForm from "../../features/questionnaire/QuestionnaireForm.tsx";

export default function ClientQuestionnairePage() {
  const { user } = useAuth();
  const [mine, setMine] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubmissions = () => {
    setLoading(true);
    questionnaireApi
      .listMine()
      .then((items) => setMine(items))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  return (
    <div className="px-6 py-8 sm:px-8 space-y-8">
      <PageHeader
        title="Website Questionnaire"
        description="Share your business brief, design preferences, and requirements so our AI can generate your custom website."
      />

      {/* Questionnaire Form in matching clean light theme */}
      <QuestionnaireForm
        brandName="Bytezora"
        standalone={false}
        theme="light"
        onSuccess={() => loadSubmissions()}
        prefillClient={{
          businessName: user?.client?.businessName,
          name: user?.fullName,
          phone: user?.phone,
          email: user?.email,
        }}
      />

      {/* Previous Submissions Section */}
      <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="text-base font-bold text-ink">Your Previous Submissions</h2>
            <p className="text-xs text-ink-muted">
              Track status and AI generation progress of your website briefs.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSubmissions}
            className="text-xs font-semibold text-brand hover:underline"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid place-items-center py-10">
            <Spinner size="md" />
          </div>
        ) : mine.length === 0 ? (
          <div className="py-10 text-center text-sm text-ink-muted">
            No previous questionnaire submissions yet. Fill out the form above to start your AI website!
          </div>
        ) : (
          <div className="mt-4 divide-y divide-line">
            {mine.map((sub) => {
              const meta = STATUS_META[sub.status] || STATUS_META.NEW;
              const formattedDate = new Date(sub.createdAt).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" },
              );
              return (
                <div
                  key={sub.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">
                        {sub.businessName}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.pill}`}
                      >
                        <span className={`size-1.5 rounded-full ${meta.dot}`} aria-hidden />
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted">
                      Type: {sub.answers?.businessType} · Style: {sub.answers?.style} · Palette: {sub.answers?.palette} · Pages: {sub.answers?.pages?.join(", ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-ink-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {formattedDate}
                    </span>
                    {sub.websiteId ? (
                      <Link
                        to={`/websites/${sub.websiteId}`}
                        className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                      >
                        <Globe className="size-3.5" /> Open Website
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
