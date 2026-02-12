export type ConditionalRule = {
  question_id: string;
  condition: "equal" | "not_equal";
  value: string;
};

export type QuestionPriority = "critical" | "high" | "medium";

export type BaseQuestion = {
  question_id: string;
  question_text: string;
  question_type: "choice" | "text";
  required: boolean;
  subtitle?: string;
  points?: number;
  priority?: QuestionPriority;
  conditional_on?: ConditionalRule;
};

export type ChoiceQuestion = BaseQuestion & {
  question_type: "choice";
  allow_multiple: boolean;
  options: string[];
  has_other_option?: boolean;
};

export type TextQuestion = BaseQuestion & {
  question_type: "text";
  long_answer: boolean;
};

export type FormQuestion = ChoiceQuestion | TextQuestion;

export type FormSection = {
  section_id: string;
  section_title: string;
  section_description: string;
  questions: FormQuestion[];
};

export type FormDefinition = {
  form_metadata: {
    form_title: string;
    form_description: string;
    created_by: string;
    created_date: string;
    version: string;
    form_type: string;
    response_settings: {
      allow_anonymous: boolean;
      one_response_per_person: boolean;
      accept_responses: boolean;
      show_progress_bar: boolean;
      shuffle_questions: boolean;
    };
  };
  sections: FormSection[];
  thank_you_message: {
    title: string;
    message: string;
  };
  analysis_instructions: {
    priority_scoring: {
      critical: string[];
      high: string[];
      medium: string[];
    };
    key_metrics: string[];
    output_format: {
      excel_analysis: boolean;
      power_bi_dashboard: boolean;
      summary_report: boolean;
    };
  };
};

export type FormValue = string | string[];

export type FormAnswerInput = {
  answers: Record<string, FormValue>;
  other_text: Record<string, string>;
};

export type StoredAnswer = {
  question_id: string;
  question_text: string;
  section_id: string;
  section_title: string;
  question_type: "choice" | "text";
  required: boolean;
  value: FormValue;
  other_value?: string;
};

export type StoredResponses = {
  form_title: string;
  form_version: string;
  submitted_at: string;
  answers: Record<string, StoredAnswer>;
};
