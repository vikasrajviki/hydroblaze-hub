import { createFileRoute } from "@tanstack/react-router";
import { Plug } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/integrations")({
  component: () => <ModulePlaceholder title="Integrations" description="Connect the tools your team already uses." icon={Plug} comingSoon />,
});
