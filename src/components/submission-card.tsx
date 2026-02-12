import Link from "next/link";
import { formatDateTime, formatTimeAgo, shortText } from "@/lib/format";
import { PriorityBadge } from "@/components/priority-badge";
import type { Submission } from "@/types/submission";

type SubmissionCardProps = {
  submission: Submission;
};

export function SubmissionCard({ submission }: SubmissionCardProps) {
  return (
    <Link
      href={`/dashboard/${submission.id}`}
      className="glass-card lift flex h-full flex-col gap-4 p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{submission.status}</p>
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
            {shortText(submission.respondentName, 38)}
          </h3>
          <p className="text-xs text-slate-500 sm:text-sm">{shortText(submission.respondentRole, 58)}</p>
        </div>
        <PriorityBadge priority={submission.priority} />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Most Painful Task</p>
        <p className="text-sm leading-6 text-slate-600">{shortText(submission.headline, 142)}</p>
      </div>

      <div className="rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-xs text-slate-600 sm:text-sm">
        <span className="font-semibold text-slate-700">Top requested tool: </span>
        {shortText(submission.focusArea, 84)}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-white/60 pt-3 text-xs text-slate-500 sm:text-sm">
        <span>{formatTimeAgo(submission.createdAt)}</span>
        <span>{formatDateTime(submission.createdAt)}</span>
      </div>
    </Link>
  );
}
