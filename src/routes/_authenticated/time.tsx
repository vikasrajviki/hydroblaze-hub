import { createFileRoute } from "@tanstack/react-router";
import { Timer } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/time")({
  component: () => <ModulePlaceholder title="Time Tracking" description="Track billable time across projects and clients." icon={Timer} comingSoon />,
});
