import { cn } from "@/lib/utils";
import logoAsset from "@/assets/hydroblaze-logo.png.asset.json";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={logoAsset.url}
        alt="HydroBlaze Media"
        className="h-9 w-9 object-contain drop-shadow-[0_0_10px_hsl(197_100%_45%/0.35)]"
      />
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
