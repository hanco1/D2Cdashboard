import { assessmentForm } from "@/lib/form-definition";
import type {
  ChoiceQuestion,
  FormQuestion,
  FormSection,
  FormValue,
  StoredAnswer,
  StoredResponses,
  TextQuestion,
} from "@/types/form";
import type { Priority } from "@/types/submission";

export const formSections = assessmentForm.sections;

export const formQuestionIndex = new Map<string, { section: FormSection; question: FormQuestion }>();

for (const section of formSections) {
  for (const question of section.questions) {
    formQuestionIndex.set(question.question_id, { section, question });
  }
}

export function getQuestionById(questionId: string) {
  return formQuestionIndex.get(questionId);
}

export function isQuestionVisible(question: FormQuestion, answers: Record<string, FormValue>) {
  if (!question.conditional_on) {
    return true;
  }

  const targetValue = answers[question.conditional_on.question_id];
  if (targetValue === undefined || targetValue === null) {
    return false;
  }

  if (Array.isArray(targetValue)) {
    const hasMatch = targetValue.includes(question.conditional_on.value);
    return question.conditional_on.condition === "equal" ? hasMatch : !hasMatch;
  }

  const isEqual = targetValue === question.conditional_on.value;
  return question.conditional_on.condition === "equal" ? isEqual : !isEqual;
}

export function isQuestionAnswered(question: FormQuestion, value: FormValue | undefined) {
  if (value === undefined) {
    return false;
  }

  if (question.question_type === "choice") {
    if (question.allow_multiple) {
      return Array.isArray(value) && value.length > 0;
    }

    return typeof value === "string" && value.trim().length > 0;
  }

  return typeof value === "string" && value.trim().length > 0;
}

function dedupeList(value: string[]) {
  return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
}

function normalizeChoiceValue(question: ChoiceQuestion, value: FormValue): string | string[] {
  if (question.allow_multiple) {
    if (!Array.isArray(value)) {
      return [];
    }

    return dedupeList(value);
  }

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value.trim();
}

function normalizeTextValue(question: TextQuestion, value: FormValue): string {
  if (Array.isArray(value)) {
    return (value[0] ?? "").trim();
  }

  if (question.long_answer) {
    return value.replace(/\r\n/g, "\n").trim();
  }

  return value.trim();
}

export function normalizeQuestionValue(question: FormQuestion, value: FormValue): FormValue {
  if (question.question_type === "choice") {
    return normalizeChoiceValue(question, value);
  }

  return normalizeTextValue(question, value);
}

export function stringValue(value: FormValue | undefined) {
  if (value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value;
}

export function buildStoredAnswer(params: {
  question: FormQuestion;
  section: FormSection;
  value: FormValue;
  otherValue?: string;
}): StoredAnswer {
  return {
    question_id: params.question.question_id,
    question_text: params.question.question_text,
    section_id: params.section.section_id,
    section_title: params.section.section_title,
    question_type: params.question.question_type,
    required: params.question.required,
    value: params.value,
    other_value: params.otherValue || undefined,
  };
}

export function derivePriority(answers: Record<string, StoredAnswer>): Priority {
  let score = 0;

  const q5 = stringValue(answers.q5?.value).toLowerCase();
  const q8 = stringValue(answers.q8?.value).toLowerCase();

  if (q5.includes("almost daily")) {
    score += 3;
  } else if (q5.includes("several times")) {
    score += 2;
  } else if (q5.includes("occasionally")) {
    score += 1;
  }

  if (q8.includes("daily")) {
    score += 3;
  } else if (q8.includes("several times")) {
    score += 2;
  } else if (q8.includes("occasionally")) {
    score += 1;
  }

  const q7Length = stringValue(answers.q7?.value).length;
  const q10Length = stringValue(answers.q10?.value).length;

  if (q7Length > 140) {
    score += 1;
  }

  if (q10Length > 120) {
    score += 1;
  }

  if (score >= 7) {
    return "Critical";
  }

  if (score >= 5) {
    return "High";
  }

  if (score >= 3) {
    return "Medium";
  }

  return "Low";
}

export function createStoredResponsePackage(answers: Record<string, StoredAnswer>): StoredResponses {
  return {
    form_title: assessmentForm.form_metadata.form_title,
    form_version: assessmentForm.form_metadata.version,
    submitted_at: new Date().toISOString(),
    answers,
  };
}

export function preferredName(answers: Record<string, StoredAnswer>) {
  const q2 = stringValue(answers.q2?.value).trim();
  return q2 || "Anonymous";
}

export function preferredRole(answers: Record<string, StoredAnswer>) {
  const q1 = answers.q1;
  if (!q1) {
    return "Unspecified role";
  }

  const base = stringValue(q1.value).trim();
  if (!base) {
    return "Unspecified role";
  }

  if (base === "Other" && q1.other_value) {
    return q1.other_value;
  }

  return base;
}

export function deriveHeadline(answers: Record<string, StoredAnswer>) {
  const painPoint = stringValue(answers.q7?.value).trim();
  if (painPoint) {
    return painPoint.slice(0, 160);
  }

  const topTool = stringValue(answers.q18?.value).trim();
  if (topTool) {
    return `Top requested tool: ${topTool}`;
  }

  return "Initial assessment response";
}

export function deriveFocusArea(answers: Record<string, StoredAnswer>) {
  const q18 = answers.q18;
  if (!q18) {
    return "No priority tool selected";
  }

  const value = stringValue(q18.value).trim();
  if (value === "Other" && q18.other_value) {
    return q18.other_value;
  }

  return value || "No priority tool selected";
}

export function displayAnswer(answer: StoredAnswer | undefined) {
  if (!answer) {
    return "No answer";
  }

  if (Array.isArray(answer.value)) {
    if (answer.value.length === 0) {
      return "No answer";
    }

    if (answer.other_value) {
      return [...answer.value, `Other: ${answer.other_value}`].join("; ");
    }

    return answer.value.join("; ");
  }

  const base = answer.value.trim();
  if (!base) {
    return "No answer";
  }

  if (base === "Other" && answer.other_value) {
    return `Other: ${answer.other_value}`;
  }

  return base;
}
