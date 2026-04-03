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
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
        {(destination.country || destination.city) && (
          <div className="flex items-center gap-0.5 text-[11px] text-white/90 mb-0.5 sm:gap-1 sm:text-sm sm:mb-1">
            <MapPin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
            {destination.city && <span>{destination.city}, </span>}
            {destination.country}
          </div>
        )}
        <h3 className="font-display text-sm font-bold leading-tight text-white mb-0.5 sm:text-xl sm:mb-1">{destination.name}</h3>
        {destination.shortDescription && (
          <p className="text-[11px] leading-snug text-white/80 line-clamp-2 sm:text-sm">{destination.shortDescription}</p>
        )}
      </div>
    </Link>
  );
}
