import { getImageUrl } from "@/lib/publicApi";
import { cn } from "@/lib/utils";

export interface DestinationHighlightCardProps {
  title: string;
  body?: string | null;
  imageUrl?: string | null;
  className?: string;
}

/**
 * Highlight tiles on destination detail — same visual language as {@link DestinationActivityCard}
 * (flat catalog style, emerald left accent, compact image strip).
 */
export default function DestinationHighlightCard({
  title,
  body,
  imageUrl,
  className,
}: DestinationHighlightCardProps) {
  const src = imageUrl ? getImageUrl(imageUrl) : null;

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-md border border-border bg-muted/25 text-left shadow-none transition-colors",
        "border-l-[3px] border-l-emerald-600/80 dark:border-l-emerald-500/90",
        className
      )}
    >
      {src && (
        <div className="relative h-[5.25rem] w-full shrink-0 overflow-hidden bg-muted sm:h-[6rem]">
          <img
            src={src}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col p-2.5 pt-2 sm:p-3 sm:pt-2.5">
        {title && (
          <h3 className="line-clamp-2 font-display text-[13px] font-semibold leading-snug text-foreground sm:text-sm">
            {title}
          </h3>
        )}
        {body && (
          <p className="mt-1 line-clamp-4 text-[11px] leading-snug text-muted-foreground sm:line-clamp-5 sm:text-xs">
            {body}
          </p>
        )}
      </div>
    </div>
  );
}
