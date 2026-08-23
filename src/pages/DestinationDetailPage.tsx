import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, MapPin, X, ZoomIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ActivityCard from "@/components/ActivityCard";
import FadeInSection from "@/components/FadeInSection";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getImageUrl } from "@/lib/publicApi";
import { Seo } from "@/components/seo/Seo";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPlace, buildBreadcrumbList } from "@/lib/jsonLd";
import { absoluteUrlWithLang, getSitePublicUrl } from "@/lib/siteUrl";

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
  const pageCards = destination?.pageCards ?? [];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxOpen = lightboxIndex !== null;
  const activeCard = lightboxIndex != null ? pageCards[lightboxIndex] : undefined;

  useEffect(() => {
    if (!lightboxOpen || pageCards.length < 2) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setLightboxIndex((current) =>
          current == null ? current : current > 0 ? current - 1 : pageCards.length - 1,
        );
      } else if (event.key === "ArrowRight") {
        setLightboxIndex((current) =>
          current == null ? current : current < pageCards.length - 1 ? current + 1 : 0,
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, pageCards.length]);

  const destinationJsonLd = useMemo(() => {
    if (!destination) return [];
    const base = getSitePublicUrl();
    const path = `/destinations/${destination.slug}`;
    const url = absoluteUrlWithLang(path, i18n.language);
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
      { name: t("nav.home"), url: absoluteUrlWithLang("/", i18n.language) },
      { name: t("nav.destinations"), url: absoluteUrlWithLang("/destinations", i18n.language) },
      { name: destination.name, url },
    ]);
    return [place, crumbs];
  }, [destination, t, i18n.language]);

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
        <Seo
          title={`${t("destinations.destinationNotFound")} — ${t("seo.siteName")}`}
          description={t("destinations.destinationNotFound")}
          canonicalPath={slug ? `/destinations/${slug}` : "/destinations"}
          noIndex
        />
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

            {pageCards.length > 0 && (
              <FadeInSection>
                <div>
                  <h2 className="font-display text-xl font-semibold mb-6">{t('destinations.highlights')}</h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {pageCards.map((card, index) => (
                      <button
                        type="button"
                        key={card.id ?? `${destination.id}-card-${index}`}
                        className="group overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onClick={() => setLightboxIndex(index)}
                      >
                        {card.imageUrl ? (
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <img
                              src={getImageUrl(card.imageUrl)}
                              alt={card.title || destination.name}
                              className="h-full w-full object-cover img-zoom"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                            <span className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                              <ZoomIn className="h-4 w-4" aria-hidden />
                            </span>
                          </div>
                        ) : null}
                        <div className="p-4 space-y-2">
                          {card.title ? (
                            <h3 className="font-display text-base font-semibold text-foreground">{card.title}</h3>
                          ) : null}
                          {card.body ? (
                            <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
                          ) : null}
                        </div>
                      </button>
                    ))}
                  </div>
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

      <Dialog open={lightboxOpen} onOpenChange={(open) => !open && setLightboxIndex(null)}>
        <DialogContent
          className="!fixed !inset-0 !h-[100dvh] !max-h-[100dvh] !min-h-0 !w-full !max-w-none !translate-x-0 !translate-y-0 !rounded-none p-0 bg-black border-0 [&>button]:hidden overflow-hidden"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">
            {activeCard?.title || t("destinations.highlights")}
          </DialogTitle>
          <div className="relative flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-neutral-950">
            {activeCard?.imageUrl ? (
              <>
                <img
                  src={getImageUrl(activeCard.imageUrl)}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl saturate-110"
                />
                <div className="pointer-events-none absolute inset-0 z-[1] bg-black/35" />
                <img
                  src={getImageUrl(activeCard.imageUrl)}
                  alt={activeCard.title || destination.name}
                  className="absolute inset-0 z-10 h-full w-full object-contain object-center p-4 pb-40 sm:p-8 sm:pb-44"
                />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center bg-neutral-900 px-6" />
            )}

            <Button
              variant="ghost"
              size="icon"
              className="absolute z-50 h-12 w-12 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 right-[max(1rem,calc(env(safe-area-inset-right,0px)+0.5rem))] top-[max(1rem,calc(env(safe-area-inset-top,0px)+0.5rem))]"
              onClick={() => setLightboxIndex(null)}
              aria-label={t("common.close")}
            >
              <X className="h-6 w-6" />
            </Button>

            {pageCards.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-[max(0.75rem,env(safe-area-inset-left,0px))] top-1/2 z-50 h-12 w-12 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 sm:h-14 sm:w-14"
                  onClick={() =>
                    setLightboxIndex((current) =>
                      current == null ? 0 : current > 0 ? current - 1 : pageCards.length - 1,
                    )
                  }
                  aria-label={t("common.previous")}
                >
                  <ChevronLeft className="h-7 w-7" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-[max(0.75rem,env(safe-area-inset-right,0px))] top-1/2 z-50 h-12 w-12 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 sm:h-14 sm:w-14"
                  onClick={() =>
                    setLightboxIndex((current) =>
                      current == null ? 0 : current < pageCards.length - 1 ? current + 1 : 0,
                    )
                  }
                  aria-label={t("common.next")}
                >
                  <ChevronLeft className="h-7 w-7 rotate-180" />
                </Button>
              </>
            )}

            {(activeCard?.title || activeCard?.body) && (
              <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/80 to-transparent px-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-16 sm:px-10">
                <div className="mx-auto max-w-3xl text-center text-white">
                  {activeCard.title ? (
                    <h3 className="font-display text-xl font-semibold sm:text-2xl">{activeCard.title}</h3>
                  ) : null}
                  {activeCard.body ? (
                    <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-base">{activeCard.body}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
