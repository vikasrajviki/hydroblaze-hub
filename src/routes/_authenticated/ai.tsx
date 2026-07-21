import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/ai")({
  component: () => <ModulePlaceholder title="AI Assistant" description="An in-portal assistant trained on your workspace." icon={Bot} comingSoon />,
});
