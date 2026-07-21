import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/clients")({
  component: () => (
    <ModulePlaceholder
      title="Clients"
      description="Central database of every client HydroBlaze Media works with."
      icon={Users}
      features={[
        "Company profile and contact person",
        "Email, phone and notes",
        "Linked projects and documents",
        "Meeting notes and history",
        "Invoice history",
        "Custom fields",
      ]}
    />
  ),
});
