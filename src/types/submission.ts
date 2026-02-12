import type { StoredResponses } from "@/types/form";

export const priorities = ["Low", "Medium", "High", "Critical"] as const;

export type Priority = (typeof priorities)[number];

export type SubmissionStatus = "New" | "In Review" | "Closed";

export type Submission = {
  id: string;
  respondentName: string;
  respondentRole: string;
  headline: string;
  focusArea: string;
  priority: Priority;
  status: SubmissionStatus;
  responses: StoredResponses;
  createdAt: string;
};

export type DashboardMetrics = {
  totalResponses: number;
  highPriorityCount: number;
  anonymousCount: number;
  thisWeekCount: number;
  topAutomationRequests: { label: string; count: number }[];
  aiFamiliarity: { label: string; count: number }[];
};
