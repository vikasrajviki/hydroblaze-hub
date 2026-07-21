import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/reports")({
  component: () => (
    <ModulePlaceholder
      title="Reports"
      description="Executive reporting across projects, employees, clients and revenue."
      icon={BarChart3}
      features={[
        "Project performance",
        "Employee productivity",
        "Client performance",
        "Revenue overview",
        "Chart and table views",
        "Export options",
      ]}
    />
  ),
});
