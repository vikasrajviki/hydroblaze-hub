import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/documents")({ component: DocumentsPage });

function DocumentsPage() {
  return (
    <PageShell>
      <PageHeader title="Documents" description="Files stored in Google Drive." icon={<FileText className="h-5 w-5" />} />
      <EmptyState
        icon={FileText}
        title="Connect Google Drive"
        description="Documents live in your Google Drive — no files are stored locally. Ask Lovable to set up the Google Drive App User Connector so each team member can sign in with their own Google account and browse, upload, rename, and delete their Drive files here."
        action={<Button asChild variant="outline" size="sm"><a href="https://drive.google.com" target="_blank" rel="noreferrer">Open Google Drive</a></Button>}
      />
    </PageShell>
  );
}
