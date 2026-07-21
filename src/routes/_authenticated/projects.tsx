import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/projects")({
  component: () => (
    <ModulePlaceholder
      title="Projects"
      description="Grid, table and Kanban views for every client engagement."
      icon={FolderKanban}
      features={[
        "Grid, table and Kanban views",
        "Project status, priority and progress",
        "Assigned employees and roles",
        "Deadlines and milestones",
        "Files, notes and activity log",
        "Client linking and invoicing",
      ]}
    />
  ),
});
