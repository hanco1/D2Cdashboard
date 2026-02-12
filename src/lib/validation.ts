import { z } from "zod";
import {
  buildStoredAnswer,
  formSections,
  isQuestionAnswered,
  isQuestionVisible,
  normalizeQuestionValue,
} from "@/lib/form-utils";
import type { FormAnswerInput, FormValue, StoredAnswer } from "@/types/form";

const formValueSchema = z.union([z.string(), z.array(z.string())]);

const payloadSchema = z.object({
  answers: z.record(z.string(), formValueSchema),
  other_text: z.record(z.string(), z.string()).default({}),
});

export type ValidatedSubmission = {
  ok: boolean;
  errors: string[];
  normalizedAnswers?: Record<string, StoredAnswer>;
};

function questionLabel(question: { question_text: string }) {
  return `"${question.question_text}"`;
}

function sectionHint(section: { section_title: string }) {
  return `(Section: ${section.section_title})`;
}

function includesOther(value: FormValue) {
  if (Array.isArray(value)) {
    return value.includes("Other");
  }

  return value === "Other";
}

export function validateSubmissionPayload(payload: unknown): ValidatedSubmission {
  const parsed = payloadSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      errors: ["Payload format is invalid."],
    };
  }

  const normalizedAnswers: Record<string, StoredAnswer> = {};
  const errors: string[] = [];

  for (const section of formSections) {
    for (const question of section.questions) {
      const isVisible = isQuestionVisible(question, parsed.data.answers);
      if (!isVisible) {
        continue;
      }

      let rawValue = parsed.data.answers[question.question_id];
      if (question.question_id === "q2" && question.question_type === "text" && rawValue === undefined) {
        rawValue = "Anonymous";
      }

      if (rawValue === undefined) {
        if (question.required) {
          errors.push(
            `Required question is missing: ${questionLabel(question)} ${sectionHint(section)}.`,
          );
        }
        continue;
      }

      let normalizedValue = normalizeQuestionValue(question, rawValue);

      if (question.question_type === "choice") {
        if (question.allow_multiple) {
          if (!Array.isArray(normalizedValue)) {
            errors.push(
              `Invalid answer format for ${questionLabel(question)} ${sectionHint(section)}.`,
            );
            continue;
          }

          const invalidOptions = normalizedValue.filter((option) => !question.options.includes(option));
          if (invalidOptions.length > 0) {
            errors.push(
              `Invalid option selected for ${questionLabel(question)} ${sectionHint(section)}.`,
            );
            continue;
          }
        } else {
          if (Array.isArray(normalizedValue)) {
            errors.push(
              `Invalid answer format for ${questionLabel(question)} ${sectionHint(section)}.`,
            );
            continue;
          }

          if (normalizedValue && !question.options.includes(normalizedValue)) {
            errors.push(
              `Invalid option selected for ${questionLabel(question)} ${sectionHint(section)}.`,
            );
            continue;
          }
        }

        if (question.has_other_option && includesOther(normalizedValue)) {
          const otherValue = (parsed.data.other_text[question.question_id] ?? "").trim();
          if (!otherValue) {
            errors.push(
              `Please specify the "Other" value for ${questionLabel(question)} ${sectionHint(section)}.`,
            );
            continue;
          }

          if (question.required && !isQuestionAnswered(question, normalizedValue)) {
            errors.push(
              `This question is required: ${questionLabel(question)} ${sectionHint(section)}.`,
            );
            continue;
          }

          normalizedAnswers[question.question_id] = buildStoredAnswer({
            question,
            section,
            value: normalizedValue,
            otherValue,
          });
          continue;
        }

        if (question.required && !isQuestionAnswered(question, normalizedValue)) {
          errors.push(`This question is required: ${questionLabel(question)} ${sectionHint(section)}.`);
          continue;
        }

        if (isQuestionAnswered(question, normalizedValue)) {
          normalizedAnswers[question.question_id] = buildStoredAnswer({
            question,
            section,
            value: normalizedValue,
          });
        }

        continue;
      }

      if (Array.isArray(normalizedValue)) {
        errors.push(`Invalid answer format for ${questionLabel(question)} ${sectionHint(section)}.`);
        continue;
      }

      if (question.question_id === "q2" && !normalizedValue.trim()) {
        normalizedValue = "Anonymous";
      }

      if (question.required && !isQuestionAnswered(question, normalizedValue)) {
        errors.push(`This question is required: ${questionLabel(question)} ${sectionHint(section)}.`);
        continue;
      }

      if (isQuestionAnswered(question, normalizedValue)) {
        normalizedAnswers[question.question_id] = buildStoredAnswer({
          question,
          section,
          value: normalizedValue,
        });
      }
    }
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    errors: [],
    normalizedAnswers,
  };
}

export function parseFormInput(payload: unknown): FormAnswerInput | null {
  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}
