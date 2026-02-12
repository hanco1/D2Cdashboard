import type { DashboardMetrics, Submission } from "@/types/submission";

function sortedTop(map: Map<string, number>, top = 5) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([label, count]) => ({ label, count }));
}

function answerAsArray(submission: Submission, questionId: string) {
  const answer = submission.responses.answers[questionId];
  if (!answer) {
    return [] as string[];
  }

  if (Array.isArray(answer.value)) {
    const values = answer.value.filter(Boolean);
    if (answer.other_value) {
      values.push(`Other: ${answer.other_value}`);
    }
    return values;
  }

  if (!answer.value.trim()) {
    return [];
  }

  if (answer.value === "Other" && answer.other_value) {
    return [`Other: ${answer.other_value}`];
  }

  return [answer.value];
}

export function buildDashboardMetrics(submissions: Submission[]): DashboardMetrics {
  const topAutomation = new Map<string, number>();
  const aiFamiliarity = new Map<string, number>();

  for (const submission of submissions) {
    for (const item of answerAsArray(submission, "q16")) {
      topAutomation.set(item, (topAutomation.get(item) ?? 0) + 1);
    }

    const aiLabel = answerAsArray(submission, "q15")[0];
    if (aiLabel) {
      aiFamiliarity.set(aiLabel, (aiFamiliarity.get(aiLabel) ?? 0) + 1);
    }
  }

  const sevenDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;

  return {
    totalResponses: submissions.length,
    highPriorityCount: submissions.filter((item) => item.priority === "High" || item.priority === "Critical")
      .length,
    anonymousCount: submissions.filter((item) => item.respondentName === "Anonymous").length,
    thisWeekCount: submissions.filter((item) => new Date(item.createdAt).getTime() >= sevenDaysAgo).length,
    topAutomationRequests: sortedTop(topAutomation, 4),
    aiFamiliarity: sortedTop(aiFamiliarity, 4),
  };
}
