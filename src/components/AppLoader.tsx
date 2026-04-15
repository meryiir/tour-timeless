import { cn } from "@/lib/utils";

type AppLoaderProps = {
  className?: string;
  label?: string;
  compact?: boolean;
};

export default function AppLoader({
  className,
  label = "Loading…",
  compact,
}: AppLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "grid place-items-center",
        compact ? "min-h-[240px]" : "min-h-[60vh]",
        className,
      )}
    >
      <div className="w-full max-w-[420px] rounded-2xl border border-primary/15 bg-card/70 p-6 text-center shadow-[0_18px_60px_-16px_hsl(30_15%_20%_/_0.18)] backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center overflow-hidden rounded-2xl shadow-md">
          <img src="/logo.png" alt="Mosaic Morocco" className="h-14 w-14 object-cover" />
        </div>

        <div
          className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-primary/5"
          aria-hidden="true"
        >
          <div className="h-7 w-7 rounded-full border-[3px] border-primary/25 border-t-primary motion-safe:animate-spin" />
        </div>

        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

