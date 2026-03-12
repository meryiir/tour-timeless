import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ActivityCard from "@/components/ActivityCard";
import FadeInSection from "@/components/FadeInSection";
import { publicApi, getImageUrl, type Activity as ApiActivity } from "@/lib/publicApi";

export default function ActivitiesPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [destination, setDestination] = useState("all");
  const [sort, setSort] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // Initialize search from URL parameter
  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [searchParams]);

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['publicActivities'],
    queryFn: () => publicApi.getActivities(0, 100),
  });

  const { data: destinationsData, isLoading: destinationsLoading } = useQuery({
    queryKey: ['publicDestinations'],
    queryFn: () => publicApi.getDestinations(0, 100),
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['publicCategories'],
    queryFn: () => publicApi.getCategories(),
  });

  // Transform API activities to match ActivityCard expected format
  const transformedActivities = useMemo(() => {
    if (!activitiesData?.content) return [];
    return activitiesData.content
      .filter((a) => a.active !== false)
      .map((a: ApiActivity) => ({
        id: a.id.toString(),
        title: a.title,
        shortDescription: a.shortDescription || '',
        fullDescription: a.fullDescription || '',
        category: a.category || '',
        destination: a.destination?.name || a.location || '',
        destinationId: a.destination?.id.toString() || '',
        price: a.price,
        duration: a.duration || '',
        rating: a.ratingAverage || 0,
        reviewCount: a.reviewCount || 0,
        difficulty: (a.difficultyLevel || 'Easy') as "Easy" | "Moderate" | "Challenging" | "Expert",
        image: getImageUrl(a.imageUrl),
        images: a.galleryImages?.map(img => getImageUrl(img)) || [],
        featured: a.featured || false,
        included: [],
        excluded: [],
        itinerary: [],
        availableDates: a.availableDates || [],
        status: a.active ? "active" : "inactive" as "active" | "inactive",
      }));
  }, [activitiesData]);

  const filtered = useMemo(() => {
    let result = [...transformedActivities];
    if (search) {
      result = result.filter((a) => 
        a.title.toLowerCase().includes(search.toLowerCase()) || 
        a.destination.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category !== "all") result = result.filter((a) => a.category === category);
    if (destination !== "all") result = result.filter((a) => a.destinationId === destination);
    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sort === "rating") result.sort((a, b) => b.rating - a.rating);
    else result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return result;
  }, [transformedActivities, search, category, destination, sort]);

  const isLoading = activitiesLoading || destinationsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="py-12">
        <section className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Explore Activities</h1>
            <p className="text-primary-foreground/80 max-w-xl mx-auto">Discover unique experiences curated by travel experts across the globe.</p>
          </div>
        </section>
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading activities...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categories = categoriesData || [];
  const destinations = destinationsData?.content || [];

  return (
    <div className="py-12">
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Explore Activities</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Discover unique experiences curated by travel experts across the globe.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search activities..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />Filters
          </Button>
          <div className={`flex flex-col md:flex-row gap-3 ${showFilters ? "block" : "hidden md:flex"}`}>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Destination" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Destinations</SelectItem>
                {destinations.map((d) => <SelectItem key={d.id.toString()} value={d.id.toString()}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">{filtered.length} activities found</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a, i) => (
            <FadeInSection key={a.id} delay={i * 0.05}>
              <ActivityCard activity={a} />
            </FadeInSection>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No activities found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
