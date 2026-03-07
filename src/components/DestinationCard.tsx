import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import type { Destination } from "@/data/mockData";

export default function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link
      to={`/destinations`}
      className="group relative block rounded-xl overflow-hidden aspect-[3/4] hover-lift"
    >
      <img
        src={destination.image}
        alt={destination.name}
        className="w-full h-full object-cover img-zoom"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center gap-1 text-sm text-primary-foreground/80 mb-1">
          <MapPin className="h-3.5 w-3.5" />
          {destination.country}
        </div>
        <h3 className="font-display text-xl font-bold text-primary-foreground mb-1">{destination.name}</h3>
        <p className="text-sm text-primary-foreground/70">{destination.activityCount} Activities</p>
      </div>
    </Link>
  );
}
