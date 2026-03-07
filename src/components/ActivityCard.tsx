import { Link } from "react-router-dom";
import { Star, MapPin, Clock } from "lucide-react";
import type { Activity } from "@/data/mockData";

export default function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Link
      to={`/activities/${activity.id}`}
      className="group block rounded-xl overflow-hidden bg-card shadow-card hover-lift"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={activity.image}
          alt={activity.title}
          className="w-full h-full object-cover img-zoom"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
            {activity.category}
          </span>
        </div>
        {activity.featured && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-secondary text-secondary-foreground">
              Featured
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <MapPin className="h-3.5 w-3.5" />
          {activity.destination}
        </div>
        <h3 className="font-display text-lg font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
          {activity.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {activity.shortDescription}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{activity.duration}</span>
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-secondary text-secondary" />{activity.rating}</span>
          </div>
          <span className="text-lg font-bold text-primary">${activity.price}</span>
        </div>
      </div>
    </Link>
  );
}
