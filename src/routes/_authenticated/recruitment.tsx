import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/recruitment")({
  component: () => <ModulePlaceholder title="Recruitment" description="Pipelines, candidates and interviews." icon={UserPlus} comingSoon />,
});
