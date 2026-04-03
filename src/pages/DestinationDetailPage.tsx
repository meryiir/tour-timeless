import { useParams, Link } from "react-router-dom";
import { MapPin, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import ActivityCard from "@/components/ActivityCard";
import FadeInSection from "@/components/FadeInSection";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getImageUrl } from "@/lib/publicApi";

export default function DestinationDetailPage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: destination, isLoading, error } = useQuery({
    queryKey: ['destination', slug, i18n.language],
    queryFn: () => publicApi.getDestinationBySlug(slug!, i18n.language),
    enabled: !!slug,
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['destinationActivities', destination?.id, i18n.language],
    queryFn: () =>
      publicApi.filterActivities({
        destinationId: destination!.id,
        page: 0,
        size: 200,
        lang: i18n.language,
      }),
    enabled: !!destination?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{t('destinations.loadingDestination')}</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">{t('destinations.destinationNotFound')}</h1>
        <Link to="/destinations"><Button>{t('destinations.backToDestinations')}</Button></Link>
      </div>
    );
  }

  // Server filter returns active activities for this destination only (not a slice of all tours).
  const destinationActivities = activitiesData?.content ?? [];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <FadeInSection>
          <Link to="/destinations" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ChevronLeft className="h-4 w-4" />{t('destinations.backToDestinations')}
          </Link>
        </FadeInSection>

        {/* Hero Image */}
        {destination.imageUrl && (
          <FadeInSection>
            <div className="aspect-[16/9] rounded-xl overflow-hidden mb-10">
              <img
                key={`${destination.id}-${destination.updatedAt ?? ""}-${destination.imageUrl}`}
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
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">{destination.name}</h1>
                {destination.shortDescription && (
                  <p className="text-lg text-muted-foreground">{destination.shortDescription}</p>
                )}
              </div>
            </FadeInSection>

            {destination.fullDescription && (
              <FadeInSection>
                <div>
                  <h2 className="font-display text-xl font-semibold mb-3">{t('destinations.aboutDestination')}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{destination.fullDescription}</p>
                </div>
              </FadeInSection>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FadeInSection>
              <div className="sticky top-24 p-6 rounded-xl bg-card shadow-elevated border border-border">
                <h3 className="font-display text-lg font-semibold mb-4">{t('destinations.quickInfo')}</h3>
                <div className="space-y-3">
                  {destination.country && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('destinations.country')}</span>
                      <span className="font-medium">{destination.country}</span>
                    </div>
                  )}
                  {destination.city && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('destinations.city')}</span>
                      <span className="font-medium">{destination.city}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('destinations.activities')}</span>
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
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-6">
              {t('destinations.activitiesIn')} {destination.name} ({destinationActivities.length})
            </h2>
            <div className="card-grid">
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
