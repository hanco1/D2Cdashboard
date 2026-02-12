import {
  createStoredResponsePackage,
  deriveFocusArea,
  deriveHeadline,
  derivePriority,
  getQuestionById,
  preferredName,
  preferredRole,
} from "@/lib/form-utils";
import type { FormValue, StoredAnswer } from "@/types/form";
import type { Submission } from "@/types/submission";

function createAnswer(questionId: string, value: FormValue, otherValue?: string): StoredAnswer {
  const ref = getQuestionById(questionId);
  if (!ref) {
    throw new Error(`Unknown question id: ${questionId}`);
  }

  return {
    question_id: ref.question.question_id,
    question_text: ref.question.question_text,
    section_id: ref.section.section_id,
    section_title: ref.section.section_title,
    question_type: ref.question.question_type,
    required: ref.question.required,
    value,
    other_value: otherValue,
  };
}

function createDemoSubmission(input: {
  id: string;
  createdAt: string;
  answers: Record<string, StoredAnswer>;
  status?: Submission["status"];
}): Submission {
  return {
    id: input.id,
    respondentName: preferredName(input.answers),
    respondentRole: preferredRole(input.answers),
    headline: deriveHeadline(input.answers),
    focusArea: deriveFocusArea(input.answers),
    priority: derivePriority(input.answers),
    status: input.status ?? "New",
    responses: createStoredResponsePackage(input.answers),
    createdAt: input.createdAt,
  };
}

const now = Date.now();

export const demoSubmissions: Submission[] = [
  createDemoSubmission({
    id: "demo-1",
    createdAt: new Date(now - 1000 * 60 * 42).toISOString(),
    answers: {
      q1: createAnswer("q1", "Project Manager (PM)"),
      q2: createAnswer("q2", "Elena Brooks"),
      q3: createAnswer(
        "q3",
        "Progress billing prep (8 hours/month), searching bid files (3 hours/week), and monthly labor consolidation (6 hours/month).",
      ),
      q4: createAnswer("q4", ["Microsoft Excel", "Microsoft Teams", "QuickBooks Desktop"]),
      q5: createAnswer("q5", "Almost daily"),
      q6: createAnswer(
        "q6",
        "I export SiteMax daily logs into Excel, then copy labor data into QuickBooks and paste a summary into the project tracker.",
      ),
      q7: createAnswer(
        "q7",
        "Month-end consolidation of labor and subcontractor costs across multiple files. It is repetitive and error-prone because each project uses a slightly different template.",
      ),
      q8: createAnswer("q8", "Daily"),
      q9: createAnswer("q9", ["Project cost data", "Historical Bid", "Contract terms"]),
      q10: createAnswer(
        "q10",
        "Version confusion when multiple people update cost sheets in parallel. Reconciliation often takes another half day.",
      ),
      q15: createAnswer("q15", "Frequent user (e.g., ChatGPT, Perplexity/Gemini)"),
      q16: createAnswer("q16", [
        "Extract key information from PDFs",
        "Auto-fill forms based on previous data",
      ]),
      q18: createAnswer("q18", "Progress billing auto-preparation"),
      q19: createAnswer("q19", "Can accept 1-2 hours of training"),
    },
  }),
  createDemoSubmission({
    id: "demo-2",
    createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    status: "In Review",
    answers: {
      q1: createAnswer("q1", "Estimator"),
      q2: createAnswer("q2", "Anonymous"),
      q3: createAnswer(
        "q3",
        "Comparing current bid scope with historical cost references and manually collecting supplier quotes.",
      ),
      q4: createAnswer("q4", ["Microsoft Excel", "Microsoft Outlook", "SharePoint"]),
      q5: createAnswer("q5", "Several times per week"),
      q6: createAnswer(
        "q6",
        "I copy quantities from PDF takeoffs into bid templates, then manually match item descriptions from previous bids.",
      ),
      q7: createAnswer(
        "q7",
        "Locating similar historical jobs and rebuilding cost assumptions line by line for each new bid.",
      ),
      q8: createAnswer("q8", "Several times per week"),
      q9: createAnswer("q9", ["Historical Bid", "Specification/Scope", "Supplier quotes"]),
      q10: createAnswer("q10", "Manual calculations in spreadsheets, especially when scope has alternates."),
      q11: createAnswer("q11", [
        "Historical similar project pricing and actual costs",
        "Auto-extracted scope and quantities from PDF",
      ]),
      q15: createAnswer("q15", "Heard of it, tried occasionally"),
      q16: createAnswer("q16", [
        "Extract key information from PDFs",
        "Predict costs based on historical data",
      ]),
      q18: createAnswer("q18", "Bid risk analysis assistant"),
      q19: createAnswer("q19", "Happy to invest time if it improves efficiency"),
    },
  }),
  createDemoSubmission({
    id: "demo-3",
    createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
    answers: {
      q1: createAnswer("q1", "Other", "Foreman"),
      q2: createAnswer("q2", "Marcus Hill"),
      q3: createAnswer(
        "q3",
        "Daily site logs, tracking safety notes, and sending labor updates to PM and accounting.",
      ),
      q4: createAnswer("q4", ["SiteMax", "Microsoft Teams", "Paper forms"]),
      q5: createAnswer("q5", "Occasionally"),
      q6: createAnswer("q6", "Copying field notes from paper sheets into SiteMax at end of day."),
      q7: createAnswer("q7", "Re-entering the same site information into multiple systems and reports."),
      q8: createAnswer("q8", "Occasionally"),
      q9: createAnswer("q9", ["Site photos", "Project cost data"]),
      q10: createAnswer("q10", "Manual entry mistakes when transcribing notes from site to computer."),
      q12: createAnswer(
        "q12",
        "Mobile-first logging with offline capture, voice notes, and auto-sync to billing and cost codes.",
      ),
      q14: createAnswer("q14", ["Project progress summary (all projects on one page)", "Safety incident tracking"]),
      q15: createAnswer("q15", "Completely new to me"),
      q16: createAnswer("q16", ["Auto-fill forms based on previous data", "Other"], "Simple daily summary generation"),
      q18: createAnswer("q18", "Daily site log auto-consolidation"),
      q19: createAnswer("q19", "Want it very simple, no training needed"),
      q20: createAnswer("q20", "Mobile support is critical for field teams."),
    },
  }),
];

