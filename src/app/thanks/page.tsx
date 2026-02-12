import Link from "next/link";
import { assessmentForm } from "@/lib/form-definition";

type ThanksPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function ThanksPage({ searchParams }: ThanksPageProps) {
  const { id } = await searchParams;

  return (
    <main className="app-shell flex min-h-screen items-center py-10">
      <section className="glass-panel animate-rise mx-auto w-full max-w-2xl space-y-5 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{assessmentForm.thank_you_message.title}</h1>
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
          {assessmentForm.thank_you_message.message}
        </p>

        <div className="flex flex-wrap gap-3 border-t border-white/70 pt-4">
          <Link href="/form" className="btn btn-primary px-4 text-sm">
            Submit Another Response
          </Link>
          <Link href="/dashboard" className="btn btn-secondary px-4 text-sm">
            Open Dashboard
          </Link>
          {id ? (
            <Link href={`/dashboard/${id}`} className="btn btn-secondary px-4 text-sm">
              View This Submission
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
