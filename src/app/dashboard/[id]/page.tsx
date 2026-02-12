import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PriorityBadge } from "@/components/priority-badge";
import { formatDateTime } from "@/lib/format";
import { assessmentForm } from "@/lib/form-definition";
import { displayAnswer } from "@/lib/form-utils";
import { getSubmissionById } from "@/lib/submissions";

export const dynamic = "force-dynamic";

type SubmissionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  const { id } = await params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    notFound();
  }

  return (
    <main className="app-shell space-y-5 pb-10 sm:space-y-6 sm:pb-14">
      <PageHeader
        eyebrow="Submission Detail"
        title={submission.respondentName}
        description={submission.respondentRole}
        actionHref="/dashboard"
        actionLabel="Back to Dashboard"
        rightSlot={<PriorityBadge priority={submission.priority} />}
      />

      <section className="glass-panel space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/70 bg-white/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{submission.status}</p>
          </div>
          <div className="rounded-xl border border-white/70 bg-white/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Submitted At</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(submission.createdAt)}</p>
          </div>
          <div className="rounded-xl border border-white/70 bg-white/60 p-3 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Top Requested Tool</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{submission.focusArea}</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/70 bg-white/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Key Pain Point</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{submission.headline}</p>
        </div>
      </section>

      <section className="space-y-4">
        {assessmentForm.sections.map((section) => (
          <article key={section.section_id} className="glass-panel p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">{section.section_title}</h2>
              <p className="text-sm text-slate-600">{section.section_description}</p>
            </div>

            <div className="space-y-3">
              {section.questions.map((question) => {
                const answer = submission.responses.answers[question.question_id];

                return (
                  <div
                    key={question.question_id}
                    className="rounded-xl border border-white/70 bg-white/65 p-3 sm:p-4"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {question.question_text}
                      {question.required ? (
                        <span className="ml-1 text-xs font-semibold text-slate-500">(Required)</span>
                      ) : null}
                    </p>
                    {question.subtitle ? (
                      <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-500">{question.subtitle}</p>
                    ) : null}
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{displayAnswer(answer)}</p>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      <Link href="/dashboard" className="btn btn-secondary px-4 text-sm">
        Return to Dashboard
      </Link>
    </main>
  );
}
