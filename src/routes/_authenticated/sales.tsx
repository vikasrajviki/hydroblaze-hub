import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/sales")({
  component: () => <ModulePlaceholder title="Sales Pipeline" description="Deal stages, forecasting and revenue." icon={TrendingUp} comingSoon />,
});
