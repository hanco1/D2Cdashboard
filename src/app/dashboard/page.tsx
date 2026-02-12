import Link from "next/link";
import { ClearSubmissionsControl } from "@/components/clear-submissions-control";
import { PageHeader } from "@/components/page-header";
import { SubmissionCard } from "@/components/submission-card";
import { buildDashboardMetrics } from "@/lib/analysis";
import { listSubmissions } from "@/lib/submissions";

export default async function DashboardPage() {
  const submissions = await listSubmissions();
  const metrics = buildDashboardMetrics(submissions);

  return (
    <main className="app-shell space-y-5 pb-10 sm:space-y-6 sm:pb-14">
      <PageHeader
        eyebrow="Internal Dashboard"
        title="Response Control Center"
        description="Monitor submitted assessments, priority patterns, and workflow signals in one place."
        rightSlot={<ClearSubmissionsControl />}
        actionHref="/form"
        actionLabel="Open Public Form"
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="glass-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total Responses</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{metrics.totalResponses}</p>
        </article>
        <article className="glass-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">High Priority</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{metrics.highPriorityCount}</p>
        </article>
        <article className="glass-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Anonymous</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{metrics.anonymousCount}</p>
        </article>
        <article className="glass-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Last 7 Days</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{metrics.thisWeekCount}</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="glass-panel p-4 sm:p-5 xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Most Requested AI Features</h2>
          <div className="mt-4 grid gap-2">
            {metrics.topAutomationRequests.length > 0 ? (
              metrics.topAutomationRequests.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm"
                >
                  <span className="text-slate-700">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No data yet.</p>
            )}
          </div>
        </article>

        <article className="glass-panel p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-slate-900">AI Familiarity Mix</h2>
          <div className="mt-4 space-y-2">
            {metrics.aiFamiliarity.length > 0 ? (
              metrics.aiFamiliarity.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm"
                >
                  <span className="text-slate-700">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No data yet.</p>
            )}
          </div>
        </article>
      </section>

      <section className="glass-panel p-4 sm:p-5">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Latest Submissions</h2>
            <p className="text-sm text-slate-600">Click a card to open the full response details.</p>
          </div>
          <Link href="/form" className="btn btn-secondary px-3 text-sm">
            Share Form Link
          </Link>
        </div>

        {submissions.length > 0 ? (
          <div className="grid-auto-cards">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-white/65 bg-white/60 p-4 text-sm text-slate-600">
            No submissions yet. Open the public form and submit the first response.
          </p>
        )}
      </section>
    </main>
  );
}
