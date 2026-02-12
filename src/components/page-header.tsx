import type { ReactNode } from "react";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  rightSlot?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  rightSlot,
}: PageHeaderProps) {
  return (
    <header className="glass-panel animate-rise p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
          ) : null}
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {rightSlot}
          {actionHref && actionLabel ? (
            <Link href={actionHref} className="btn btn-primary px-4 text-sm">
              {actionLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <AppNav />
    </header>
  );
}
