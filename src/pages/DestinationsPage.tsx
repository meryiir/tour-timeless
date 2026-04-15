import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import DestinationCard from "@/components/DestinationCard";
import FadeInSection from "@/components/FadeInSection";
import { publicApi, getImageUrl } from "@/lib/publicApi";
import { Seo } from "@/components/seo/Seo";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildItemList, buildWebPage } from "@/lib/jsonLd";
import { absoluteUrlWithLang, getSitePublicUrl } from "@/lib/siteUrl";
import { Button } from "@/components/ui/button";

export default function DestinationsPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ['publicDestinations', i18n.language],
    queryFn: () => publicApi.getDestinations(0, 100, i18n.language),
  });

  const filteredDestinations = useMemo(() => {
    if (!data?.content) return [];
    if (!searchQuery) return data.content;
    return data.content.filter((d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  if (isLoading) {
    return (
      <div className="pt-[100px] pb-12">
        <section className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">{t("nav.destinations")}</h1>
            <p className="text-primary-foreground/80 max-w-xl mx-auto">{t("destinations.subtitle", "Explore our curated collection of the world's most breathtaking destinations.")}</p>
          </div>
        </section>
        <div className="container mx-auto mt-6 px-4 pt-12 pb-12 sm:mt-8 sm:pt-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">{t("destinations.loading", "Loading destinations...")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <section className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">{t("nav.destinations")}</h1>
            <p className="text-primary-foreground/80 max-w-xl mx-auto">{t("destinations.subtitle", "Explore our curated collection of the world's most breathtaking destinations.")}</p>
          </div>
        </section>
        <div className="container mx-auto mt-6 px-4 pt-12 pb-12 sm:mt-8 sm:pt-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive mb-4">{t("destinations.error", "Failed to load destinations. Please try again later.")}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-primary hover:underline"
              >
                {t("destinations.reload", "Reload page")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const destinations = filteredDestinations;
  const pageJsonLd = useMemo(() => {
    const base = getSitePublicUrl();
    const url = absoluteUrlWithLang("/destinations", i18n.language);
    const webpage = buildWebPage({
      name: t("seo.destinations.title"),
      description: t("seo.destinations.description"),
      url,
      type: "CollectionPage",
      isPartOfWebSiteUrl: base,
    });
    const itemUrls = destinations
      .slice(0, 50)
      .map((d) => absoluteUrlWithLang(`/destinations/${d.slug}`, i18n.language));
    const list = buildItemList({
      name: t("seo.destinations.title"),
      url,
      itemUrls,
    });
    return [webpage, list];
  }, [destinations, t, i18n.language]);

  return (
    <div className="pt-[100px] pb-12">
      <Seo title={t("seo.destinations.title")} description={t("seo.destinations.description")} canonicalPath="/destinations" />
      <JsonLd data={pageJsonLd} />
      <section className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">{t("nav.destinations")}</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">{t("destinations.subtitle", "Explore our curated collection of the world's most breathtaking destinations.")}</p>
          {searchQuery && (
            <p className="text-primary-foreground/70 mt-2">{t("destinations.searchResults", "Search results for:")} "{searchQuery}"</p>
          )}
        </div>
      </section>
      <div className="container mx-auto mt-6 px-4 pt-12 pb-12 sm:mt-8 sm:pt-16">
        <PageBreadcrumb
          items={[
            { label: t("nav.home"), to: "/" },
            { label: t("nav.destinations") },
          ]}
          currentPath="/destinations"
          className="mb-8"
        />
        {destinations.length > 0 ? (
          <>
            <div className="card-grid">
              {destinations.map((d, i) => (
                <FadeInSection key={d.id} delay={i * 0.1}>
                  <DestinationCard destination={{
                    id: d.id,
                    name: d.name,
                    slug: d.slug,
                    imageUrl: d.imageUrl,
                    country: d.country,
                    city: d.city,
                    shortDescription: d.shortDescription,
                    fullDescription: d.fullDescription,
                    featured: d.featured,
                  }} />
                </FadeInSection>
              ))}
            </div>
            {destinations.map((d) => (
              <FadeInSection key={d.id} className="mt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <img 
                    src={getImageUrl(d.imageUrl)} 
                    alt={d.name} 
                    className="rounded-xl w-full aspect-[4/3] object-cover"
                    style={{ boxShadow: 'none' }}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div>
                    <h2 className="font-display text-2xl font-bold mb-3">
                      <Link to={`/destinations/${d.slug}`} className="hover:underline">
                        {d.name}
                      </Link>
                    </h2>
                    <p className="text-muted-foreground mb-4">{d.shortDescription || d.fullDescription || ''}</p>
                    <p className="text-sm font-medium text-primary">{d.country || ''}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button asChild variant="default" size="sm">
                        <Link to={`/destinations/${d.slug}`}>{t("destinations.viewDestination", "View destination")}</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/activities?destination=${encodeURIComponent(String(d.id))}`}>
                          {t("destinations.seeToursIn", "See tours in")} {d.name}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{t("destinations.noResults", "No destinations found.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
