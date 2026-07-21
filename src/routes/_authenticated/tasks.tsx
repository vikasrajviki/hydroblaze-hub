import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/tasks")({
  component: () => (
    <ModulePlaceholder
      title="Tasks"
      description="Table, Kanban and calendar views with full task detail."
      icon={CheckSquare}
      features={[
        "Table, Kanban and calendar views",
        "Priority, due date and status",
        "Assignee and watchers",
        "Checklists and subtasks",
        "Comments and attachments",
        "Activity history",
      ]}
    />
  ),
});
