import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/crm")({
  component: () => <ModulePlaceholder title="CRM" description="Lead and contact management." icon={Briefcase} comingSoon />,
});
