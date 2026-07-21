import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/content")({
  component: () => (
    <ModulePlaceholder
      title="Content Calendar"
      description="Monthly, weekly and campaign-level content scheduling."
      icon={CalendarDays}
      features={[
        "Monthly and weekly views",
        "Campaign grouping",
        "Assigned designer and editor",
        "Platform and content type",
        "Approval status and publish date",
        "Captions and attachments",
      ]}
    />
  ),
});
