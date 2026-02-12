import Link from "next/link";

export default function SubmissionNotFound() {
  return (
    <main className="app-shell flex min-h-screen items-center py-10">
      <section className="glass-panel mx-auto max-w-xl space-y-4 p-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Submission Not Found</h1>
        <p className="text-sm text-slate-600">The response may have been removed or the link is invalid.</p>
        <Link href="/dashboard" className="btn btn-primary px-4 text-sm">
          Back to Dashboard
        </Link>
      </section>
    </main>
  );
}
