import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function ModulePlaceholder({
  title, description, icon: Icon, features, comingSoon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
  comingSoon?: boolean;
}) {
  return (
    <PageShell>
      <PageHeader
        title={title}
        description={description}
        icon={<Icon className="h-5 w-5" />}
        actions={
          !comingSoon && (
            <Button size="sm" className="bg-gradient-hydro hover:shadow-glow-hydro text-primary-foreground">
              Get started
            </Button>
          )
        }
      />
      <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-card">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-hydro/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blaze/10 blur-3xl pointer-events-none" />
        <div className="relative p-12 md:p-16 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hydro shadow-glow-hydro text-primary-foreground mb-6">
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight max-w-xl mx-auto">
            {comingSoon ? (
              <>The <span className="text-gradient-brand">{title}</span> module is on the way</>
            ) : (
              <>Your <span className="text-gradient-brand">{title}</span> workspace</>
            )}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            {comingSoon
              ? `${title} will plug into this portal as a standalone module. Reach out to admin to prioritize the roadmap.`
              : `Populate ${title.toLowerCase()} data and this view will light up. Everything below is scaffolding ready for your workflows.`}
          </p>

          {features && (
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto text-left">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 p-3 rounded-lg border border-border/60 bg-background/40">
                  <Sparkles className="h-4 w-4 text-hydro shrink-0 mt-0.5" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageShell>
  );
}

export function ModuleShell({ children }: { children: ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
