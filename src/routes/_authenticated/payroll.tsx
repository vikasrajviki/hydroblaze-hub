import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";
export const Route = createFileRoute("/_authenticated/payroll")({
  component: () => <ModulePlaceholder title="Payroll" description="Automated payroll cycles and payslips." icon={Wallet} comingSoon />,
});
