import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/chat")({
  component: () => <ModulePlaceholder title="Chat" description="Realtime team and project chat." icon={MessageSquare} comingSoon />,
});
