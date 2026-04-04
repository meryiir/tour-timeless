import { Link } from "react-router-dom";
import { Star, MapPin, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getImageUrl, type Activity as ApiActivity } from "@/lib/publicApi";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface ActivityCardComponentProps {
  activity: ApiActivity;
  className?: string;
}

export default function ActivityCard({ activity, className }: ActivityCardComponentProps) {
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();

  const image = getImageUrl(activity.imageUrl);
  const rating = activity.ratingAverage || 0;
  const destination =
    activity.destination?.name || activity.location || "N/A";

  return (
    <Link
      to={`/activities/${activity.slug}`}
      className={cn(
        "group flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-border bg-card shadow-card hover-lift",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
        <img
          src={image}
          alt={activity.title}
          className="h-full w-full object-cover img-zoom"
        />
        <div className="absolute left-1.5 top-1.5 max-w-[55%] sm:left-3 sm:top-3 sm:max-w-none">
          <span className="inline-block rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold leading-tight text-primary-foreground sm:px-3 sm:py-1 sm:text-xs">
            {activity.category || ""}
          </span>
        </div>
        {activity.featured && (
          <div className="absolute right-1.5 top-1.5 max-w-[42%] sm:right-3 sm:top-3 sm:max-w-none">
            <span className="inline-block rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-semibold leading-tight text-secondary-foreground sm:px-3 sm:py-1 sm:text-xs">
              {t("activities.featured")}
            </span>
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-2.5 sm:p-4 md:p-5">
        <div className="mb-1.5 flex shrink-0 items-center gap-0.5 text-[11px] text-muted-foreground sm:mb-2 sm:gap-1 sm:text-sm">
          <MapPin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          <span className="line-clamp-1">{destination}</span>
        </div>
        <h3 className="mb-1.5 line-clamp-3 min-h-0 font-display text-[13px] font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary sm:mb-2 sm:text-lg sm:leading-normal">
          {activity.title}
        </h3>
        <p className="mb-0 line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:text-sm sm:leading-normal">
          {activity.shortDescription || ""}
        </p>
        <div className="mt-auto flex flex-col gap-1.5 border-t border-border pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:pt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground sm:gap-3 sm:text-sm">
            {activity.duration && (
              <span className="flex min-w-0 items-center gap-0.5 sm:gap-1">
                <Clock className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                <span className="truncate">{activity.duration}</span>
              </span>
            )}
            {rating > 0 && (
              <span className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                <Star className="h-3 w-3 shrink-0 fill-secondary text-secondary sm:h-3.5 sm:w-3.5" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-start sm:items-end">
            <span className="text-sm font-bold tabular-nums text-primary sm:text-lg">{formatPrice(activity.price)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
