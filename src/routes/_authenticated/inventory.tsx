import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/inventory")({
  component: () => <ModulePlaceholder title="Inventory" description="Equipment, licenses and physical stock." icon={Package} comingSoon />,
});
