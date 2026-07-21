import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/support")({
  component: () => <ModulePlaceholder title="Support Tickets" description="Internal and client support workflow." icon={LifeBuoy} comingSoon />,
});
