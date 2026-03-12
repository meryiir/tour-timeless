import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DestinationCard from "@/components/DestinationCard";
import FadeInSection from "@/components/FadeInSection";
import { publicApi, getImageUrl } from "@/lib/publicApi";

export default function DestinationsPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const { data, isLoading } = useQuery({
    queryKey: ['publicDestinations'],
    queryFn: () => publicApi.getDestinations(0, 100),
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
      <div className="py-12">
        <section className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Destinations</h1>
            <p className="text-primary-foreground/80 max-w-xl mx-auto">Explore our curated collection of the world's most breathtaking destinations.</p>
          </div>
        </section>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading destinations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const destinations = filteredDestinations;

  return (
    <div className="py-12">
      <section className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Destinations</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Explore our curated collection of the world's most breathtaking destinations.</p>
          {searchQuery && (
            <p className="text-primary-foreground/70 mt-2">Search results for: "{searchQuery}"</p>
          )}
        </div>
      </section>
      <div className="container mx-auto px-4 py-12">
        {destinations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.map((d, i) => (
                <FadeInSection key={d.id} delay={i * 0.1}>
                  <DestinationCard destination={{
                    id: d.id.toString(),
                    name: d.name,
                    image: getImageUrl(d.imageUrl),
                    country: d.country || '',
                    activityCount: 0, // Will be calculated if needed
                  }} />
                </FadeInSection>
              ))}
            </div>
            {destinations.map((d) => (
              <FadeInSection key={d.id} className="mt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <img src={getImageUrl(d.imageUrl)} alt={d.name} className="rounded-xl w-full aspect-[4/3] object-cover" />
                  <div>
                    <h2 className="font-display text-2xl font-bold mb-3">{d.name}</h2>
                    <p className="text-muted-foreground mb-4">{d.shortDescription || d.fullDescription || ''}</p>
                    <p className="text-sm font-medium text-primary">{d.country || ''}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No destinations found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
