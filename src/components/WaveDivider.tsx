import { cn } from "@/lib/utils";

export default function WaveDivider({
  className,
  compact,
  flip,
}: {
  className?: string;
  compact?: boolean;
  flip?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        compact ? "h-6" : "h-10",
        // Default: subtle light-on-dark + dark-on-light.
        "text-foreground/10 dark:text-white/10",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        className={cn(
          "absolute inset-0 block h-full w-full",
          flip ? "rotate-180" : "",
        )}
        focusable="false"
      >
        {/* Filled wave */}
        <path
          d="M0,20 C80,6 160,34 240,20 C320,6 400,34 480,20 C560,6 640,34 720,20 C800,6 880,34 960,20 C1040,6 1120,34 1200,20 L1200,48 L0,48 Z"
          fill="currentColor"
          opacity="0.9"
        />
        {/* Highlight stroke on crest */}
        <path
          d="M0,20 C80,6 160,34 240,20 C320,6 400,34 480,20 C560,6 640,34 720,20 C800,6 880,34 960,20 C1040,6 1120,34 1200,20"
          fill="none"
          stroke="currentColor"
          opacity="0.35"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

