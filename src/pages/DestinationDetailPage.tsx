import { useParams, Link } from "react-router-dom";
import { MapPin, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActivityCard from "@/components/ActivityCard";
import FadeInSection from "@/components/FadeInSection";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getImageUrl, type Activity as ApiActivity } from "@/lib/publicApi";

export default function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: destination, isLoading, error } = useQuery({
    queryKey: ['destination', id],
    queryFn: () => publicApi.getDestinationById(Number(id)),
    enabled: !!id,
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['destinationActivities', id],
    queryFn: () => publicApi.getActivities(0, 100),
    enabled: !!destination,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading destination...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Destination Not Found</h1>
        <Link to="/destinations"><Button>Back to Destinations</Button></Link>
      </div>
    );
  }

  const destinationActivities = activitiesData?.content?.filter(
    (a) => a.destination?.id === destination.id && a.active
  ) || [];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <FadeInSection>
          <Link to="/destinations" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ChevronLeft className="h-4 w-4" />Back to Destinations
          </Link>
        </FadeInSection>

        {/* Hero Image */}
        {destination.imageUrl && (
          <FadeInSection>
            <div className="aspect-[16/9] rounded-xl overflow-hidden mb-10">
              <img 
                src={getImageUrl(destination.imageUrl)} 
                alt={destination.name} 
                className="w-full h-full object-cover img-zoom" 
              />
            </div>
          </FadeInSection>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <FadeInSection>
              <div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  {destination.city && <span>{destination.city}, </span>}
                  {destination.country}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{destination.name}</h1>
                {destination.shortDescription && (
                  <p className="text-lg text-muted-foreground">{destination.shortDescription}</p>
                )}
              </div>
            </FadeInSection>

            {destination.fullDescription && (
              <FadeInSection>
                <div>
                  <h2 className="font-display text-xl font-semibold mb-3">About This Destination</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{destination.fullDescription}</p>
                </div>
              </FadeInSection>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FadeInSection>
              <div className="sticky top-24 p-6 rounded-xl bg-card shadow-elevated border border-border">
                <h3 className="font-display text-lg font-semibold mb-4">Quick Info</h3>
                <div className="space-y-3">
                  {destination.country && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Country</span>
                      <span className="font-medium">{destination.country}</span>
                    </div>
                  )}
                  {destination.city && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">City</span>
                      <span className="font-medium">{destination.city}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Activities</span>
                    <span className="font-medium">{destinationActivities.length}</span>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>

        {/* Activities in this Destination */}
        {destinationActivities.length > 0 && (
          <FadeInSection className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-6">
              Activities in {destination.name} ({destinationActivities.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {destinationActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </FadeInSection>
        )}
      </div>
    </div>
  );
}
