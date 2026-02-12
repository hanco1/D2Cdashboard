"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { assessmentForm } from "@/lib/form-definition";
import { formSections, isQuestionAnswered, isQuestionVisible } from "@/lib/form-utils";
import type { ChoiceQuestion, FormQuestion, FormValue } from "@/types/form";

type ErrorMap = Record<string, string>;
type DraftData = {
  answers?: Record<string, FormValue>;
  otherText?: Record<string, string>;
  currentSection?: number;
};

const DRAFT_STORAGE_KEY = "d2c_assessment_draft_v1";
const COLLAPSIBLE_SCENARIO_QUESTION_IDS = new Set(["q11", "q12", "q13"]);

function hasOtherSelection(question: ChoiceQuestion, value: FormValue | undefined) {
  if (!question.has_other_option || value === undefined) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.includes("Other");
  }

  return value === "Other";
}

function parseDraftAnswers(input: unknown): Record<string, FormValue> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const source = input as Record<string, unknown>;
  const next: Record<string, FormValue> = {};

  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string") {
      next[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      const clean = value.filter((item): item is string => typeof item === "string");
      next[key] = clean;
    }
  }

  return next;
}

function parseDraftTextMap(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const source = input as Record<string, unknown>;
  const next: Record<string, string> = {};

  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string") {
      next[key] = value;
    }
  }

  return next;
}

export function AssessmentForm() {
  const router = useRouter();
  const formRootRef = useRef<HTMLElement | null>(null);

  const [answers, setAnswers] = useState<Record<string, FormValue>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<ErrorMap>({});
  const [submitError, setSubmitError] = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  const [collapsedScenarioQuestions, setCollapsedScenarioQuestions] = useState<
    Record<string, boolean>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as DraftData;
      const draftAnswers = parseDraftAnswers(parsed.answers);
      if (draftAnswers.q2 === "Anonymous") {
        delete draftAnswers.q2;
      }
      setAnswers(draftAnswers);
      setOtherText(parseDraftTextMap(parsed.otherText));

      if (typeof parsed.currentSection === "number" && Number.isFinite(parsed.currentSection)) {
        setCurrentSection(Math.max(0, Math.floor(parsed.currentSection)));
      }
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } finally {
      setDraftReady(true);
    }
  }, []);

  const sections = useMemo(
    () =>
      formSections.map((section) => ({
        ...section,
        questions: section.questions.filter((question) => isQuestionVisible(question, answers)),
      })),
    [answers],
  );

  useEffect(() => {
    if (sections.length === 0) {
      return;
    }

    setCurrentSection((prev) => Math.min(Math.max(prev, 0), sections.length - 1));
  }, [sections.length]);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    const payload: DraftData = {
      answers,
      otherText,
      currentSection,
    };

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  }, [answers, otherText, currentSection, draftReady]);

  const sectionStats = useMemo(
    () =>
      sections.map((section) => {
        const requiredQuestions = section.questions.filter((question) => question.required);
        const answeredRequired = requiredQuestions.filter((question) =>
          isQuestionAnswered(question, answers[question.question_id]),
        ).length;

        return {
          sectionId: section.section_id,
          requiredTotal: requiredQuestions.length,
          answeredRequired,
        };
      }),
    [sections, answers],
  );

  const requiredVisibleQuestions = useMemo(
    () => sections.flatMap((section) => section.questions.filter((question) => question.required)),
    [sections],
  );

  const answeredRequiredCount = useMemo(
    () =>
      requiredVisibleQuestions.filter((question) =>
        isQuestionAnswered(question, answers[question.question_id]),
      ).length,
    [requiredVisibleQuestions, answers],
  );

  const progress =
    requiredVisibleQuestions.length > 0
      ? Math.round((answeredRequiredCount / requiredVisibleQuestions.length) * 100)
      : 0;

  const current = sections[currentSection] ?? sections[0];
  const currentStat = sectionStats[currentSection];

  if (!current || !currentStat) {
    return null;
  }

  function scrollToFormTop() {
    const topNode = formRootRef.current;
    if (!topNode) {
      return;
    }

    const targetY = topNode.getBoundingClientRect().top + window.scrollY - 8;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  }

  function goToSection(nextIndex: number) {
    setCurrentSection(nextIndex);
    requestAnimationFrame(() => scrollToFormTop());
  }

  function setQuestionValue(questionId: string, value: FormValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }

  function setOtherValue(questionId: string, value: string) {
    setOtherText((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${questionId}_other`];
      return next;
    });
  }

  function toggleScenarioCollapse(questionId: string) {
    setCollapsedScenarioQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  }

  function toggleMultiChoice(question: ChoiceQuestion, option: string, checked: boolean) {
    const existing = answers[question.question_id];
    const list = Array.isArray(existing) ? existing : [];

    if (checked) {
      setQuestionValue(question.question_id, [...new Set([...list, option])]);
      return;
    }

    const next = list.filter((item) => item !== option);
    setQuestionValue(question.question_id, next);

    if (option === "Other") {
      setOtherValue(question.question_id, "");
    }
  }

  function validateQuestions(questions: FormQuestion[]) {
    const nextErrors: ErrorMap = {};

    for (const question of questions) {
      let value = answers[question.question_id];
      const isAnonymousNameQuestion =
        question.question_id === "q2" && question.question_type === "text";

      if (isAnonymousNameQuestion && (typeof value !== "string" || !value.trim())) {
        value = "Anonymous";
      }

      if (question.required && !isQuestionAnswered(question, value)) {
        nextErrors[question.question_id] = "This question is required.";
        continue;
      }

      if (question.question_type === "choice" && hasOtherSelection(question, value)) {
        const other = (otherText[question.question_id] ?? "").trim();
        if (!other) {
          nextErrors[`${question.question_id}_other`] = "Please specify the Other value.";
        }
      }
    }

    return nextErrors;
  }

  function validateCurrentSection() {
    const nextErrors = validateQuestions(current.questions);
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  }

  function validateAllSections() {
    const allVisibleQuestions = sections.flatMap((section) => section.questions);
    const nextErrors = validateQuestions(allVisibleQuestions);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function nextSection() {
    if (!validateCurrentSection()) {
      return;
    }

    goToSection(Math.min(currentSection + 1, sections.length - 1));
  }

  function previousSection() {
    goToSection(Math.max(0, currentSection - 1));
  }

  async function submitForm() {
    setSubmitError("");

    if (!validateAllSections()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          other_text: otherText,
        }),
      });

      const result = (await response.json()) as { id?: string; error?: string };

      if (!response.ok) {
        setSubmitError(result.error ?? "Unable to submit the form. Please try again.");
        return;
      }

      window.localStorage.removeItem(DRAFT_STORAGE_KEY);

      if (result.id) {
        router.push(`/thanks?id=${result.id}`);
        return;
      }

      router.push("/thanks");
    } catch {
      setSubmitError("Network error. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderQuestion(question: FormQuestion, index: number) {
    const value = answers[question.question_id];
    const isScenarioCollapsible = COLLAPSIBLE_SCENARIO_QUESTION_IDS.has(question.question_id);
    const isCollapsed = isScenarioCollapsible && Boolean(collapsedScenarioQuestions[question.question_id]);
    const hasAnswer = isQuestionAnswered(question, value);

    if (question.question_type === "text") {
      return (
        <div className="glass-card space-y-3 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <label className="field-label text-sm leading-6" htmlFor={question.question_id}>
              {index + 1}. {question.question_text}
              {question.required ? <span className="ml-1 text-rose-500">*</span> : null}
            </label>

            {isScenarioCollapsible ? (
              <button
                type="button"
                className="btn btn-secondary min-h-8 shrink-0 rounded-lg px-2.5 py-1 text-xs"
                onClick={() => toggleScenarioCollapse(question.question_id)}
              >
                {isCollapsed ? "Expand" : "Collapse"}
              </button>
            ) : null}
          </div>

          {question.subtitle ? (
            <p className="whitespace-pre-wrap text-xs leading-5 text-slate-500">{question.subtitle}</p>
          ) : null}

          {isCollapsed ? (
            <p className="rounded-lg border border-white/70 bg-white/60 px-3 py-2 text-xs font-medium text-slate-600">
              {hasAnswer ? "Collapsed. Answer is saved." : "Collapsed. Click Expand to answer this block."}
            </p>
          ) : null}

          {!isCollapsed ? (
            <>
              {question.long_answer ? (
              <textarea
                id={question.question_id}
                className="field-textarea min-h-[138px]"
                value={typeof value === "string" ? value : ""}
                onChange={(event) => setQuestionValue(question.question_id, event.target.value)}
              />
            ) : (
              <input
                id={question.question_id}
                className={clsx(
                  "field-input h-11",
                  question.question_id === "q2" ? "placeholder:text-slate-400" : "",
                )}
                placeholder={question.question_id === "q2" ? "Anonymous" : ""}
                value={typeof value === "string" ? value : ""}
                onChange={(event) => setQuestionValue(question.question_id, event.target.value)}
              />
            )}

              {errors[question.question_id] ? (
                <p className="text-xs font-medium text-rose-600">{errors[question.question_id]}</p>
              ) : null}
            </>
          ) : null}
        </div>
      );
    }

    const currentValues = Array.isArray(value) ? value : [];
    const selectableOptions = question.options.filter(
      (option) => !(question.has_other_option && option === "Other"),
    );
    const allSelectableChosen =
      question.allow_multiple &&
      selectableOptions.length > 0 &&
      selectableOptions.every((option) => currentValues.includes(option));

    return (
      <div className="glass-card space-y-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="field-label text-sm leading-6">
            {index + 1}. {question.question_text}
            {question.required ? <span className="ml-1 text-rose-500">*</span> : null}
          </p>

          <div className="flex shrink-0 items-center gap-2">
            {question.allow_multiple ? (
              <button
                type="button"
                className="btn btn-secondary min-h-8 shrink-0 rounded-lg px-2.5 py-1 text-xs"
                onClick={() => {
                  if (allSelectableChosen) {
                    setQuestionValue(question.question_id, []);
                    setOtherValue(question.question_id, "");
                    return;
                  }

                  const keepOther = currentValues.includes("Other");
                  const nextValues = keepOther ? [...selectableOptions, "Other"] : selectableOptions;
                  setQuestionValue(question.question_id, nextValues);
                }}
              >
                {allSelectableChosen ? "Clear all" : "Select all"}
              </button>
            ) : null}

            {isScenarioCollapsible ? (
              <button
                type="button"
                className="btn btn-secondary min-h-8 shrink-0 rounded-lg px-2.5 py-1 text-xs"
                onClick={() => toggleScenarioCollapse(question.question_id)}
              >
                {isCollapsed ? "Expand" : "Collapse"}
              </button>
            ) : null}
          </div>
        </div>

        {question.subtitle ? (
          <p className="whitespace-pre-wrap text-xs leading-5 text-slate-500">{question.subtitle}</p>
        ) : null}

        {isCollapsed ? (
          <p className="rounded-lg border border-white/70 bg-white/60 px-3 py-2 text-xs font-medium text-slate-600">
            {hasAnswer ? "Collapsed. Answer is saved." : "Collapsed. Click Expand to answer this block."}
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {question.options.map((option) => {
                const checked = Array.isArray(value) ? value.includes(option) : value === option;

                return (
                  <label
                    key={`${question.question_id}_${option}`}
                    className={clsx(
                      "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm leading-6 transition",
                      checked
                        ? "border-blue-400 bg-blue-50/80 text-slate-800"
                        : "border-white/70 bg-white/70 text-slate-700 hover:bg-white/90",
                    )}
                  >
                    <input
                      type={question.allow_multiple ? "checkbox" : "radio"}
                      name={question.question_id}
                      checked={checked}
                      onChange={(event) => {
                        if (question.allow_multiple) {
                          toggleMultiChoice(question, option, event.target.checked);
                        } else if (event.target.checked) {
                          setQuestionValue(question.question_id, option);
                          if (option !== "Other") {
                            setOtherValue(question.question_id, "");
                          }
                        }
                      }}
                      className="mt-1"
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>

            {hasOtherSelection(question, value) ? (
              <div className="space-y-1">
                <input
                  className="field-input h-11"
                  placeholder="Please specify"
                  value={otherText[question.question_id] ?? ""}
                  onChange={(event) => setOtherValue(question.question_id, event.target.value)}
                />
                {errors[`${question.question_id}_other`] ? (
                  <p className="text-xs font-medium text-rose-600">{errors[`${question.question_id}_other`]}</p>
                ) : null}
              </div>
            ) : null}

            {errors[question.question_id] ? (
              <p className="text-xs font-medium text-rose-600">{errors[question.question_id]}</p>
            ) : null}
          </>
        )}
      </div>
    );
  }

  return (
    <section ref={formRootRef} className="glass-panel p-3 sm:p-6">
      <div className="rounded-2xl border border-white/70 bg-white/60 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Section {currentSection + 1} of {sections.length}
          </p>
          <p className="text-xs font-semibold text-slate-600">
            Required in this section: {currentStat.answeredRequired}/{currentStat.requiredTotal}
          </p>
        </div>

        <h2 className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">{current.section_title}</h2>
        <p className="text-sm text-slate-600">{current.section_description}</p>

        {assessmentForm.form_metadata.response_settings.show_progress_bar ? (
          <div className="mt-4">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Overall progress: {progress}% ({answeredRequiredCount}/{requiredVisibleQuestions.length} required)
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Draft is auto-saved on this device.</p>
          </div>
        ) : null}

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {sections.map((section, index) => {
            const active = index === currentSection;
            const stat = sectionStats[index];

            return (
              <button
                key={section.section_id}
                type="button"
                onClick={() => goToSection(index)}
                className={clsx(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "border-blue-400 bg-blue-50 text-blue-700"
                    : "border-white/70 bg-white/70 text-slate-600 hover:bg-white/90",
                )}
              >
                S{index + 1} {stat.answeredRequired}/{stat.requiredTotal}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
        {current.questions.map((question, index) => (
          <div key={question.question_id}>{renderQuestion(question, index)}</div>
        ))}
      </div>

      {submitError ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {submitError}
        </p>
      ) : null}

      <div className="sticky-safe sticky bottom-2 z-20 mt-6 rounded-2xl border border-white/75 bg-white/88 p-2 backdrop-blur-xl sm:static sm:bottom-auto sm:z-auto">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="btn btn-secondary h-11 w-full text-sm disabled:cursor-not-allowed disabled:opacity-45"
            onClick={previousSection}
            disabled={currentSection === 0 || isSubmitting}
          >
            Previous
          </button>

          {currentSection < sections.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary h-11 w-full text-sm"
              onClick={nextSection}
              disabled={isSubmitting}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary h-11 w-full text-sm disabled:opacity-60"
              onClick={submitForm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
