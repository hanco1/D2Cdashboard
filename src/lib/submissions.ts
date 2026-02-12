import { randomUUID } from "node:crypto";
import { assessmentForm } from "@/lib/form-definition";
import {
  createStoredResponsePackage,
  deriveFocusArea,
  deriveHeadline,
  derivePriority,
  preferredName,
  preferredRole,
} from "@/lib/form-utils";
import { demoSubmissions } from "@/lib/demo-data";
import { getSupabaseServerClient } from "@/lib/supabase";
import { validateSubmissionPayload } from "@/lib/validation";
import type { Database, Json } from "@/types/database";
import type { StoredAnswer, StoredResponses } from "@/types/form";
import type { Submission } from "@/types/submission";

type SubmissionRow = Database["public"]["Tables"]["submissions"]["Row"];
type SubmissionInsert = Database["public"]["Tables"]["submissions"]["Insert"];

type CreateData = {
  respondentName: string;
  respondentRole: string;
  headline: string;
  focusArea: string;
  priority: Submission["priority"];
  responses: StoredResponses;
};

function asStoredResponses(value: Json): StoredResponses {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return createStoredResponsePackage({});
  }

  const raw = value as Partial<StoredResponses>;
  const answers =
    raw.answers && typeof raw.answers === "object" && !Array.isArray(raw.answers)
      ? (raw.answers as Record<string, StoredAnswer>)
      : {};

  return {
    form_title:
      typeof raw.form_title === "string" ? raw.form_title : assessmentForm.form_metadata.form_title,
    form_version:
      typeof raw.form_version === "string" ? raw.form_version : assessmentForm.form_metadata.version,
    submitted_at:
      typeof raw.submitted_at === "string" ? raw.submitted_at : new Date().toISOString(),
    answers,
  };
}

function fromRow(row: SubmissionRow): Submission {
  return {
    id: row.id,
    respondentName: row.respondent_name || "Anonymous",
    respondentRole: row.respondent_role || "Unspecified role",
    headline: row.headline,
    focusArea: row.focus_area || "No priority tool selected",
    priority: row.priority,
    status: row.status,
    responses: asStoredResponses(row.responses),
    createdAt: row.created_at,
  };
}

function toInsertPayload(input: CreateData): SubmissionInsert {
  return {
    respondent_name: input.respondentName === "Anonymous" ? null : input.respondentName,
    respondent_role: input.respondentRole,
    headline: input.headline,
    focus_area: input.focusArea,
    priority: input.priority,
    status: "New",
    responses: input.responses as unknown as Json,
  };
}

function buildCreateData(answers: Record<string, StoredAnswer>): CreateData {
  const responses = createStoredResponsePackage(answers);
  return {
    respondentName: preferredName(answers),
    respondentRole: preferredRole(answers),
    headline: deriveHeadline(answers),
    focusArea: deriveFocusArea(answers),
    priority: derivePriority(answers),
    responses,
  };
}

function sortNewest(items: Submission[]) {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function listSubmissions(): Promise<Submission[]> {
  const client = getSupabaseServerClient();

  if (!client) {
    return sortNewest(demoSubmissions);
  }

  const { data, error } = await client
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load submissions:", error?.message);
    return sortNewest(demoSubmissions);
  }

  const rows = data as SubmissionRow[];
  return rows.map(fromRow);
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const client = getSupabaseServerClient();

  if (!client) {
    return demoSubmissions.find((item) => item.id === id) ?? null;
  }

  const { data, error } = await client
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error(`Failed to load submission ${id}:`, error.message);
    }
    return null;
  }

  return fromRow(data as SubmissionRow);
}

export type CreateSubmissionResult = {
  ok: boolean;
  id?: string;
  errors?: string[];
};

export type ClearSubmissionsResult = {
  ok: boolean;
  deletedCount?: number;
  errors?: string[];
};

export async function createSubmission(payload: unknown): Promise<CreateSubmissionResult> {
  const validated = validateSubmissionPayload(payload);

  if (!validated.ok || !validated.normalizedAnswers) {
    return {
      ok: false,
      errors: validated.errors,
    };
  }

  const createData = buildCreateData(validated.normalizedAnswers);

  const client = getSupabaseServerClient();

  if (!client) {
    const id = randomUUID();
    demoSubmissions.unshift({
      id,
      respondentName: createData.respondentName,
      respondentRole: createData.respondentRole,
      headline: createData.headline,
      focusArea: createData.focusArea,
      priority: createData.priority,
      status: "New",
      responses: createData.responses,
      createdAt: new Date().toISOString(),
    });

    return { ok: true, id };
  }

  const { data, error } = await client
    .from("submissions")
    .insert(toInsertPayload(createData))
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      errors: [error?.message ?? "Failed to create submission."],
    };
  }

  const inserted = data as { id: string };
  return { ok: true, id: inserted.id };
}

export async function clearAllSubmissions(): Promise<ClearSubmissionsResult> {
  const client = getSupabaseServerClient();

  if (!client) {
    const deletedCount = demoSubmissions.length;
    demoSubmissions.length = 0;
    return { ok: true, deletedCount };
  }

  const { count, error } = await client
    .from("submissions")
    .delete({ count: "exact" })
    .not("id", "is", null);

  if (error) {
    return {
      ok: false,
      errors: [error.message],
    };
  }

  return {
    ok: true,
    deletedCount: count ?? 0,
  };
}
