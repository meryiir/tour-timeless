import { Link } from "react-router-dom";
import { ChevronRight, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getImageUrl, type Activity as ApiActivity } from "@/lib/publicApi";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface DestinationActivityCardProps {
  activity: ApiActivity;
  className?: string;
}

/**
 * Compact “catalog” tiles for destination pages — smaller footprint than home {@link ActivityCard},
 * flat bordered style + left accent (not floating pills / heavy shadow).
 */
export default function DestinationActivityCard({ activity, className }: DestinationActivityCardProps) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const image = getImageUrl(activity.imageUrl);
  const salePrice = Number(activity.price);
  const listPrice =
    activity.premiumPrice != null && !Number.isNaN(Number(activity.premiumPrice))
      ? Number(activity.premiumPrice)
      : null;
  const showStrikeThrough = listPrice != null && listPrice > salePrice;

  return (
    <Link
      to={`/activities/${activity.id}`}
      aria-label={`${activity.title} — ${t("activities.viewDetails")}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-md border border-border bg-muted/25 text-left shadow-none transition-colors",
        "border-l-[3px] border-l-emerald-600/80 hover:border-l-emerald-500 hover:bg-muted/40 dark:border-l-emerald-500/90",
        className
      )}
    >
      {/* Shorter image strip than home cards (home uses aspect-[4/3] + shadow-card) */}
      <div className="relative h-[5.25rem] w-full shrink-0 overflow-hidden bg-muted sm:h-[6rem]">
        <img
          src={image}
          alt={activity.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-2.5 pt-2 sm:p-3 sm:pt-2.5">
        {activity.category && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800/90 dark:text-emerald-400/95">
            {activity.category}
          </p>
        )}
        <h3 className="line-clamp-2 font-display text-[13px] font-semibold leading-snug text-foreground sm:text-sm">
          {activity.title}
        </h3>
        {activity.shortDescription && (
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:text-xs">
            {activity.shortDescription}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-1.5 border-t border-border/50 pt-2">
          <div className="min-w-0 flex-1">
            {activity.duration && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground sm:text-xs">
                <Clock className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                <span className="truncate">{activity.duration}</span>
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-baseline gap-1.5">
            {showStrikeThrough && (
              <span className="text-[10px] text-muted-foreground line-through sm:text-xs">
                {formatPrice(listPrice)}
              </span>
            )}
            <span className="font-display text-sm font-bold tabular-nums text-emerald-800 dark:text-emerald-400">
              {formatPrice(salePrice)}
            </span>
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
              aria-hidden
            />
          </div>
        </div>

      </div>
    </Link>
  );
}
