import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hydro shadow-glow-hydro">
        <div className="absolute inset-0 rounded-xl bg-gradient-blaze opacity-60 mix-blend-overlay" />
        <span className="relative font-black text-primary-foreground text-lg tracking-tighter">H</span>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-tight text-foreground">
            Hydro<span className="text-gradient-hydro">Blaze</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-0.5">
            Media Portal
          </span>
        </div>
      )}
    </div>
  );
}
