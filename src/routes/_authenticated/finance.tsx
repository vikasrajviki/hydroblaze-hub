import { createFileRoute } from "@tanstack/react-router";
import { PiggyBank } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/finance")({
  component: () => <ModulePlaceholder title="Finance" description="Budgets, spend and cash flow." icon={PiggyBank} comingSoon />,
});
