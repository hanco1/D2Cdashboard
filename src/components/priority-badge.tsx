import clsx from "clsx";
import { priorityClass } from "@/lib/style";
import type { Priority } from "@/types/submission";

type PriorityBadgeProps = {
  priority: Priority;
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        priorityClass(priority),
      )}
    >
      {priority}
    </span>
  );
}
