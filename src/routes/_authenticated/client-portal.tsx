import { createFileRoute } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/client-portal")({
  component: () => <ModulePlaceholder title="Client Portal" description="Give clients a scoped, branded view of their projects." icon={Globe} comingSoon />,
});
