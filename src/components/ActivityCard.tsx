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
        "group flex h-full min-h-0 flex-col overflow-hidden rounded-xl bg-card shadow-card hover-lift",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
        <img
          src={image}
          alt={activity.title}
          className="h-full w-full object-cover img-zoom"
        />
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {activity.category || ""}
          </span>
        </div>
        {activity.featured && (
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {t("activities.featured")}
            </span>
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-5">
        <div className="mb-2 flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{destination}</span>
        </div>
        <h3 className="mb-2 line-clamp-3 min-h-0 font-display text-lg font-semibold text-card-foreground transition-colors group-hover:text-primary">
          {activity.title}
        </h3>
        <p className="mb-0 line-clamp-2 text-sm text-muted-foreground">
          {activity.shortDescription || ""}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {activity.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {activity.duration}
              </span>
            )}
            {rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-primary">{formatPrice(activity.price)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
