import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/documents")({
  component: () => (
    <ModulePlaceholder
      title="Documents"
      description="Google Drive-powered document workspace. Files uploaded here sync straight to your connected Drive."
      icon={FileText}
      features={[
        "Google Drive as source of truth (no local storage)",
        "Folders, search and preview",
        "Rename, move and delete",
        "Download supported file types",
        "Upload date, size and uploader",
        "Modular integration for future providers",
      ]}
    />
  ),
});
