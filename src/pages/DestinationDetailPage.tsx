import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import ActivityCard from "@/components/ActivityCard";
import FadeInSection from "@/components/FadeInSection";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getImageUrl } from "@/lib/publicApi";
import { Seo } from "@/components/seo/Seo";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPlace, buildBreadcrumbList } from "@/lib/jsonLd";
import { getSitePublicUrl } from "@/lib/siteUrl";

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

  const destinationActivities = activitiesData?.content ?? [];

  const destinationJsonLd = useMemo(() => {
    if (!destination) return [];
    const base = getSitePublicUrl();
    const path = `/destinations/${destination.slug}`;
    const url = `${base}${path}`;
    const rawImg = destination.imageUrl ? getImageUrl(destination.imageUrl) : "";
    const image =
      !rawImg || rawImg.includes("placeholder")
        ? undefined
        : rawImg.startsWith("http")
          ? rawImg
          : `${base}${rawImg.startsWith("/") ? rawImg : `/${rawImg}`}`;
    const desc = (
      destination.shortDescription ||
      destination.fullDescription ||
      t("seo.destinationDescriptionFallback", { name: destination.name })
    ).slice(0, 5000);
    const place = buildPlace({ name: destination.name, description: desc, url, image });
    const crumbs = buildBreadcrumbList([
      { name: t("nav.home"), url: `${base}/` },
      { name: t("nav.destinations"), url: `${base}/destinations` },
      { name: destination.name, url },
    ]);
    return [place, crumbs];
  }, [destination, t]);

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

  return (
    <div className="py-12">
      <Seo
        title={`${destination.name} | ${t("seo.siteName")}`}
        description={(
          destination.shortDescription ||
          destination.fullDescription ||
          t("seo.destinationDescriptionFallback", { name: destination.name })
        ).slice(0, 160)}
        canonicalPath={`/destinations/${destination.slug}`}
        imageUrl={destination.imageUrl ? getImageUrl(destination.imageUrl) : undefined}
      />
      <JsonLd data={destinationJsonLd} />
      <div className="container mx-auto px-4">
        <FadeInSection>
          <PageBreadcrumb
            items={[
              { label: t("nav.home"), to: "/" },
              { label: t("nav.destinations"), to: "/destinations" },
              { label: destination.name },
            ]}
            currentPath={`/destinations/${destination.slug}`}
            includeJsonLd={false}
            className="mb-6"
          />
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
