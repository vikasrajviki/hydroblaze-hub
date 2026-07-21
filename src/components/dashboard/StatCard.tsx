import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  delta?: number;
  hint?: string;
  icon: LucideIcon;
  accent?: "hydro" | "blaze" | "neutral";
};

export function StatCard({ label, value, delta, hint, icon: Icon, accent = "neutral" }: StatCardProps) {
  const accentGlow =
    accent === "hydro" ? "shadow-glow-hydro" :
    accent === "blaze" ? "shadow-glow-blaze" : "";
  const accentBg =
    accent === "hydro" ? "bg-gradient-hydro" :
    accent === "blaze" ? "bg-gradient-blaze" : "bg-muted";

  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 shadow-card overflow-hidden hover:border-border/80 transition-all">
      <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-hydro/5 blur-2xl group-hover:bg-hydro/10 transition-all" />
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center text-primary-foreground", accentBg, accentGlow)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight tabular-nums">{value}</span>
        {typeof delta === "number" && (
          <span className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium",
            delta >= 0 ? "text-emerald-400" : "text-destructive"
          )}>
            {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
