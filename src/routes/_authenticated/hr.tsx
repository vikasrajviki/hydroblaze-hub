import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/hr")({
  component: () => <ModulePlaceholder title="HR" description="People operations, leave, reviews and onboarding." icon={UserPlus} comingSoon />,
});
