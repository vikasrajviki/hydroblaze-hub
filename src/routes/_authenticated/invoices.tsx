import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/invoices")({
  component: () => (
    <ModulePlaceholder
      title="Invoices"
      description="Track paid, pending and overdue invoices across clients."
      icon={Receipt}
      features={[
        "Status: paid, pending, overdue",
        "Amount and due date",
        "Client linking",
        "Search and filters",
        "Export to CSV / PDF",
        "Future accounting integrations",
      ]}
    />
  ),
});
