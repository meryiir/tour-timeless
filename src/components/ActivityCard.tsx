import { Link } from "react-router-dom";
import { Star, MapPin, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Activity } from "@/data/mockData";
import { getImageUrl, type Activity as ApiActivity } from "@/lib/publicApi";
import { useCurrency } from "@/contexts/CurrencyContext";

type ActivityCardProps = Activity | ApiActivity | (Activity & { premiumPrice?: number; budgetPrice?: number });

interface ActivityCardComponentProps {
  activity: ActivityCardProps;
  selectedTourType?: 'all' | 'private' | 'shared';
}

export default function ActivityCard({ activity, selectedTourType = 'all' }: ActivityCardComponentProps) {
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  // Handle both mock data format and API format
  const isApiFormat = 'imageUrl' in activity || 'ratingAverage' in activity;
  
  const image = isApiFormat 
    ? getImageUrl((activity as ApiActivity).imageUrl) 
    : (activity as Activity).image;
  
  const rating = isApiFormat 
    ? (activity as ApiActivity).ratingAverage || 0
    : (activity as Activity).rating || 0;
  
  const destination = typeof activity.destination === 'string'
    ? activity.destination
    : (activity as any).destination?.name || (activity as ApiActivity).location || 'N/A';
  
  const activityId = isApiFormat 
    ? (activity as ApiActivity).id.toString()
    : (activity as Activity).id;

  return (
    <Link
      to={`/activities/${activityId}`}
      className="group block rounded-xl overflow-hidden bg-card shadow-card hover-lift"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={image}
          alt={activity.title}
          className="w-full h-full object-cover img-zoom"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
            {activity.category || ''}
          </span>
        </div>
        {activity.featured && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-secondary text-secondary-foreground">
              {t('activities.featured')}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <MapPin className="h-3.5 w-3.5" />
          {destination}
        </div>
        <h3 className="font-display text-lg font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
          {activity.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {activity.shortDescription || ''}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {activity.duration && (
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{activity.duration}</span>
            )}
            {rating > 0 && (
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-secondary text-secondary" />{rating.toFixed(1)}</span>
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
