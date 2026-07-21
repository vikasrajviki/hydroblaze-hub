import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/announcements")({
  component: () => (
    <ModulePlaceholder
      title="Announcements"
      description="Company updates, achievements and pinned notices for the whole team."
      icon={Megaphone}
      features={[
        "Pinned announcements",
        "Company updates",
        "Achievements and shoutouts",
        "Important notices",
        "Recent activity feed",
        "Role-based visibility",
      ]}
    />
  ),
});
