import Link from "next/link";
import { headers } from "next/headers";
import { AssessmentForm } from "@/components/assessment-form";
import { detectDeviceKind } from "@/lib/device";
import { assessmentForm } from "@/lib/form-definition";

type FormViewMode = "auto" | "mobile" | "laptop";

type FormPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseViewMode(value: string | undefined): FormViewMode {
  if (value === "mobile" || value === "laptop") {
    return value;
  }

  return "auto";
}

function resolveDetectedLayout(deviceKind: ReturnType<typeof detectDeviceKind>) {
  return deviceKind === "mobile" ? "mobile" : "laptop";
}

function modeButtonClass(active: boolean) {
  if (active) {
    return "btn btn-primary min-h-10 px-3 text-xs sm:text-sm";
  }

  return "btn btn-secondary min-h-10 px-3 text-xs sm:text-sm";
}

export default async function FormPage({ searchParams }: FormPageProps) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const deviceKind = detectDeviceKind(userAgent);
  const requestedView = parseViewMode(Array.isArray(params.view) ? params.view[0] : params.view);
  const detectedLayout = resolveDetectedLayout(deviceKind);
  const effectiveLayout = requestedView === "auto" ? detectedLayout : requestedView;

  const isMobile = effectiveLayout === "mobile";
  const showDesktopLayout = !isMobile;
  const detectedLabel =
    deviceKind === "mobile" ? "Mobile" : deviceKind === "tablet" ? "Tablet" : "Laptop";
  const renderedLabel = isMobile ? "Mobile layout" : "Laptop layout";

  const viewModePanel = (
    <div className="rounded-xl border border-white/70 bg-white/65 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">View Mode</p>
      <p className="mt-1 text-xs text-slate-600 sm:text-sm">
        Detected: <span className="font-semibold text-slate-800">{detectedLabel}</span> | Rendering:
        <span className="font-semibold text-slate-800"> {renderedLabel}</span>
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/form" className={modeButtonClass(requestedView === "auto")}>
          Auto Detect
        </Link>
        <Link href="/form?view=mobile" className={modeButtonClass(requestedView === "mobile")}>
          Force Mobile
        </Link>
        <Link href="/form?view=laptop" className={modeButtonClass(requestedView === "laptop")}>
          Force Laptop
        </Link>
      </div>
    </div>
  );

  return (
    <main className="app-shell space-y-4 pb-14 sm:space-y-6 sm:pb-20">
      {isMobile ? (
        <header className="glass-panel p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Quick Response Mode
              </p>
              <h1 className="mt-1 text-lg font-semibold text-slate-900">D2C Initial Assessment</h1>
            </div>
            <span className="rounded-full border border-white/70 bg-white/65 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              10-15 min
            </span>
          </div>

          <div className="mt-3">{viewModePanel}</div>
        </header>
      ) : (
        <header className="glass-panel p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Public Assessment Form</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
            {assessmentForm.form_metadata.form_title}
          </h1>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
            {assessmentForm.form_metadata.form_description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="rounded-full border border-white/70 bg-white/65 px-3 py-1 font-semibold text-slate-700">
              Created by {assessmentForm.form_metadata.created_by}
            </span>
            <span className="rounded-full border border-white/70 bg-white/65 px-3 py-1 font-semibold text-slate-700">
              Version {assessmentForm.form_metadata.version}
            </span>
            <span className="rounded-full border border-white/70 bg-white/65 px-3 py-1 font-semibold text-slate-700">
              10-15 min
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/" className="btn btn-secondary min-h-10 px-3 text-sm">
              Home
            </Link>
            <Link href="/dashboard" className="btn btn-secondary min-h-10 px-3 text-sm">
              Dashboard (Desktop)
            </Link>
          </div>

          <div className="mt-4">{viewModePanel}</div>
        </header>
      )}

      {isMobile ? (
        <details className="glass-panel p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">View section outline</summary>
          <ol className="mt-3 space-y-2 text-sm text-slate-700">
            {assessmentForm.sections.map((section, index) => (
              <li key={section.section_id} className="rounded-lg border border-white/70 bg-white/60 px-3 py-2">
                <span className="font-semibold">
                  {index + 1}. {section.section_title}
                </span>
              </li>
            ))}
          </ol>
        </details>
      ) : null}

      <section className={showDesktopLayout ? "grid items-start gap-4 grid-cols-[280px_minmax(0,1fr)]" : "space-y-4"}>
        {showDesktopLayout ? (
          <aside className="glass-panel sticky top-4 max-h-[calc(100vh-2rem)] space-y-4 overflow-y-auto p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Section Outline</p>
            <ol className="space-y-2 text-sm text-slate-700">
              {assessmentForm.sections.map((section, index) => (
                <li key={section.section_id} className="rounded-lg border border-white/70 bg-white/60 px-3 py-2">
                  <p className="font-semibold">
                    {index + 1}. {section.section_title}
                  </p>
                  <p className="text-xs text-slate-500">{section.section_description}</p>
                </li>
              ))}
            </ol>
          </aside>
        ) : null}

        <AssessmentForm />
      </section>
    </main>
  );
}
