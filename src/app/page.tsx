import Link from "next/link";

export default function Home() {
  return (
    <main className="app-shell flex min-h-screen items-center py-10">
      <section className="glass-panel animate-rise mx-auto w-full max-w-4xl p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Informa Collect</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
          D2C Internal Process Optimization
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Lightweight intake prototype for collecting workflow pain points and automation priorities. The
          public form is designed for QR access, while the dashboard aggregates responses for quick
          operational review.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/dashboard" className="glass-card lift p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Internal</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Open Dashboard</h2>
            <p className="mt-2 text-sm text-slate-600">
              View incoming responses, priority signals, and full submission details.
            </p>
          </Link>

          <Link href="/form" className="glass-card lift p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Public</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Open Assessment Form</h2>
            <p className="mt-2 text-sm text-slate-600">
              Share this page as QR destination for employees to submit workflow feedback.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
