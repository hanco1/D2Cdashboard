import type { Priority } from "@/types/submission";

export function priorityClass(priority: Priority) {
  switch (priority) {
    case "Low":
      return "priority-low";
    case "Medium":
      return "priority-medium";
    case "High":
      return "priority-high";
    case "Critical":
      return "priority-critical";
    default:
      return "priority-medium";
  }
}
