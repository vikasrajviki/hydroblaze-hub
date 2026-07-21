import { createFileRoute } from "@tanstack/react-router";
import { Workflow } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/workflows")({
  component: () => <ModulePlaceholder title="Workflow Automation" description="Automate repetitive team workflows." icon={Workflow} comingSoon />,
});
