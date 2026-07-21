import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PageHeader({
  title, description, actions, icon,
}: { title: string; description?: string; actions?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-hydro shadow-glow-hydro text-primary-foreground">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-6 md:p-8 max-w-[1600px] mx-auto w-full", className)}>{children}</div>;
}
