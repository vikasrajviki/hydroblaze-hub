import { createFileRoute } from "@tanstack/react-router";
import { UserSquare2 } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/team")({
  component: () => (
    <ModulePlaceholder
      title="Team"
      description="Employee directory, profiles, workload and performance."
      icon={UserSquare2}
      features={[
        "Employee directory",
        "Department and role",
        "Skills and expertise",
        "Assigned projects",
        "Performance and workload",
        "Contact information",
      ]}
    />
  ),
});
