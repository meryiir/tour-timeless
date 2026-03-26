import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { getImageUrl, type Destination } from "@/lib/publicApi";

export default function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link
      to={`/destinations/${destination.slug}`}
      className="group relative block rounded-xl overflow-hidden aspect-[3/4] hover-lift"
    >
      <img
        src={getImageUrl(destination.imageUrl)}
        alt={destination.name}
        className="w-full h-full object-cover img-zoom"
        style={{ boxShadow: 'none' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder.svg';
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
        {(destination.country || destination.city) && (
          <div className="flex items-center gap-1 text-sm text-white/90 mb-1">
            <MapPin className="h-3.5 w-3.5" />
            {destination.city && <span>{destination.city}, </span>}
            {destination.country}
          </div>
        )}
        <h3 className="font-display text-xl font-bold text-white mb-1">{destination.name}</h3>
        {destination.shortDescription && (
          <p className="text-sm text-white/80 line-clamp-2">{destination.shortDescription}</p>
        )}
      </div>
    </Link>
  );
}
