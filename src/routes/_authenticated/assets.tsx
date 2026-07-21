import { createFileRoute } from "@tanstack/react-router";
import { Image as ImageIcon } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/assets")({
  component: () => (
    <ModulePlaceholder
      title="Assets"
      description="Media library for images, videos, brand assets, logos and icons."
      icon={ImageIcon}
      features={[
        "Images, videos and brand assets",
        "Folder organization",
        "Preview and download",
        "Search and tag filtering",
        "Bulk upload",
        "Version history",
      ]}
    />
  ),
});
