import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Star, Shield, Headphones, Globe, ChevronRight, Activity, MapPin, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ActivityCard from "@/components/ActivityCard";
import DestinationCard from "@/components/DestinationCard";
import FadeInSection from "@/components/FadeInSection";
import ParallaxSection from "@/components/ParallaxSection";
import HeroSearch from "@/components/HeroSearch";
import { publicApi, getImageUrl, type Activity as ApiActivity, type ActivityReview } from "@/lib/publicApi";

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  // Removed tourType filter - all activities can be private or shared

  const whyUs = [
    { icon: Shield, title: t("home.trustedSecure"), desc: t("home.trustedSecureDesc") },
    { icon: Star, title: t("home.curatedExperiences"), desc: t("home.curatedExperiencesDesc") },
    { icon: Headphones, title: t("home.support24"), desc: t("home.support24Desc") },
    { icon: Globe, title: t("home.globalNetwork"), desc: t("home.globalNetworkDesc") },
  ];

  const staticTravelerReviews = useMemo(
    () =>
      [
        {
          name: t("home.testimonial1Name"),
          location: t("home.testimonial1Location"),
          text: t("home.testimonial1Body"),
          rating: 5 as const,
        },
        {
          name: t("home.testimonial2Name"),
          location: t("home.testimonial2Location"),
          text: t("home.testimonial2Body"),
          rating: 5 as const,
        },
        {
          name: t("home.testimonial3Name"),
          location: t("home.testimonial3Location"),
          text: t("home.testimonial3Body"),
          rating: 5 as const,
        },
      ] as const,
    [t, i18n.language],
  );
  const { data: featuredActivitiesData } = useQuery({
    queryKey: ['featuredActivities', i18n.language],
    queryFn: () => publicApi.getFeaturedActivities(0, 8, i18n.language),
  });

  const { data: destinationsData } = useQuery({
    queryKey: ['publicDestinations', i18n.language],
    queryFn: () => publicApi.getDestinations(0, 8, i18n.language),
  });

  const { data: allDestinationsData } = useQuery({
    queryKey: ['allDestinations', i18n.language],
    queryFn: () => publicApi.getDestinations(0, 100, i18n.language),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['publicCategories'],
    queryFn: () => publicApi.getCategories(),
  });

  const { data: recentReviewsData } = useQuery({
    queryKey: ['homeRecentReviews', i18n.language],
    queryFn: () => publicApi.getRecentReviews(0, 9, i18n.language),
    staleTime: 60_000,
  });

  // Get all activities for filtering
  const { data: allActivitiesData } = useQuery({
    queryKey: ['allActivities', i18n.language],
    queryFn: () => publicApi.getActivities(0, 100, i18n.language),
  });

  // Transform featured activities
  const featuredActivities = (featuredActivitiesData?.content || []).map((a: ApiActivity) => ({
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

  const destinations = (destinationsData?.content || []).map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    imageUrl: d.imageUrl,
    country: d.country,
    city: d.city,
    shortDescription: d.shortDescription,
    fullDescription: d.fullDescription,
    featured: d.featured,
  }));

  const categories = categoriesData || [];
  const allDestinations = allDestinationsData?.content || [];
  const allActivities = allActivitiesData?.content || [];

  // Helper function to transform activities
  const transformActivity = (a: ApiActivity) => {
    const basePrice = Number(a.price);
    // Use actual premium and budget prices from API, or fallback to calculated values
    const premiumPrice = a.premiumPrice ? Number(a.premiumPrice) : basePrice * 1.6;
    const budgetPrice = a.budgetPrice ? Number(a.budgetPrice) : basePrice;
    
    return {
      id: a.id.toString(),
      title: a.title,
      shortDescription: a.shortDescription || '',
      fullDescription: a.fullDescription || '',
      category: a.category || '',
      destination: a.destination?.name || a.location || '',
      destinationId: a.destination?.id.toString() || '',
      price: basePrice,
      premiumPrice: premiumPrice,
      budgetPrice: budgetPrice,
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
      tourType: a.tourType,
      departureLocation: a.departureLocation,
    };
  };

  // Filter activities by city (using departure location)
  const getActivitiesByCity = (cityName: string) => {
    const cityVariations: Record<string, string[]> = {
      'marrakech': ['marrakech', 'marrakesh'],
      'fes': ['fes', 'fez'],
      'tangier': ['tangier', 'tanger'],
      'casablanca': ['casablanca', 'casa'],
    };
    
    const cityLower = cityName.toLowerCase();
    const variations = cityVariations[cityLower] || [cityLower];
    
    return allActivities
      .filter(a => {
        const departureLocation = a.departureLocation?.toLowerCase() || '';
        return variations.some(variation => departureLocation.includes(variation));
      })
      .map(transformActivity)
      .slice(0, 8);
  };

  // Filter activities by destination name
  const getActivitiesByDestination = (destinationName: string) => {
    const destination = allDestinations.find(d => d.name === destinationName || d.city === destinationName);
    if (!destination) return [];
    return allActivities
      .filter(a => a.destination?.id === destination.id)
      .map(transformActivity)
      .slice(0, 4);
  };

  // Removed getActivitiesByTourType - all activities can be private or shared

  // Day trips from Marrakech (activities with departure location or destination city Marrakech)
  const getDayTripsFromMarrakech = () => {
    const marrakechDestination = allDestinations.find(d => d.city === 'Marrakech');
    return allActivities
      .filter(a => 
        a.departureLocation?.toLowerCase().includes('marrakech') ||
        a.destination?.city === 'Marrakech' ||
        (marrakechDestination && a.destination?.id === marrakechDestination.id)
      )
      .map(transformActivity)
      .slice(0, 4);
  };

  const marrakechTours = getActivitiesByCity('Marrakech');
  const fesTours = getActivitiesByCity('Fes');
  const tangierTours = getActivitiesByCity('Tangier');
  const casablancaTours = getActivitiesByCity('Casablanca');
  const saharaDesertTours = getActivitiesByDestination('Sahara Desert');
  // Removed separate private/shared tours - all activities shown together
  const dayTripsFromMarrakech = getDayTripsFromMarrakech();

  // Transform all activities for display
  const allTransformedActivities = useMemo(() => {
    return allActivities
      .filter((a) => a.active !== false)
      .map(transformActivity);
  }, [allActivities]);

  // No filtering by tour type - all activities can be private or shared
  const filterByTourType = (activities: any[]) => {
    return activities;
  };

  // Get filtered activities based on selected city
  const filteredToursByCity = useMemo(() => {
    if (!selectedCity) return null;
    const cityTours = getActivitiesByCity(selectedCity);
    return filterByTourType(cityTours);
  }, [selectedCity, allActivities]);

  // Get all activities
  const filteredAllActivities = useMemo(() => {
    return filterByTourType(allTransformedActivities);
  }, [allTransformedActivities]);

  return (
    <div className="overflow-x-hidden w-full max-w-full">
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] flex items-start justify-center overflow-hidden pt-24 md:pt-32 lg:pt-40">
        <video 
          src="/assets/videos/tourisme-hero.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay for better depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/50" />
        {/* Solid black overlay */}
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto w-full">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-hero-title drop-shadow-2xl tracking-tight">
            {t("home.heroTitle")}
          </h1>
          <p className="text-lg md:text-xl text-white/95 mb-10 font-body animate-hero-description animate-infinite-glow max-w-2xl mx-auto leading-relaxed drop-shadow-lg italic">
            {t("home.heroSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 animate-hero-buttons">
            <Link to="/activities">
              <Button 
                size="default"
                className="group relative px-6 py-2.5 h-auto bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
              >
                <Activity className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-sm font-medium">{t("home.exploreActivities")}</span>
                <ArrowRight className="h-3.5 w-3.5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>
            </Link>
            <Link to="/destinations">
              <Button 
                size="default"
                variant="outline"
                className="group relative px-6 py-2.5 h-auto bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
              >
                <MapPin className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-sm font-medium">{t("home.viewDestinations")}</span>
                <ArrowRight className="h-3.5 w-3.5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>
            </Link>
          </div>
          <div className="animate-hero-search relative z-50 mb-16 md:mb-20 lg:mb-24">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Morocco Tours */}
      <ParallaxSection speed={0.18} zIndex={2}>
        <section className="py-20 bg-beige-gradient-muted relative shadow-xl w-full overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            <FadeInSection>
              <div className="text-center mb-10">
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Explore Morocco</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Morocco Tours</h2>
              </div>
            </FadeInSection>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Link to="/destinations">
                <Button 
                  variant={selectedCity === null ? "default" : "outline"} 
                  className={`w-full h-auto py-6 transition-colors ${
                    selectedCity === null 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                  onClick={() => setSelectedCity(null)}
                >
                  <div className="text-center">
                    <MapPin className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Destinations</span>
                  </div>
                </Button>
              </Link>
              <Button 
                variant={selectedCity === "Marrakech" ? "default" : "outline"} 
                className={`w-full h-auto py-6 transition-colors ${
                  selectedCity === "Marrakech" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-primary hover:text-primary-foreground"
                }`}
                onClick={() => setSelectedCity(selectedCity === "Marrakech" ? null : "Marrakech")}
              >
                <div className="text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Tours from Marrakech</span>
                </div>
              </Button>
              <Button 
                variant={selectedCity === "Fes" ? "default" : "outline"} 
                className={`w-full h-auto py-6 transition-colors ${
                  selectedCity === "Fes" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-primary hover:text-primary-foreground"
                }`}
                onClick={() => setSelectedCity(selectedCity === "Fes" ? null : "Fes")}
              >
                <div className="text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Tours from Fes</span>
                </div>
              </Button>
              <Button 
                variant={selectedCity === "Tangier" ? "default" : "outline"} 
                className={`w-full h-auto py-6 transition-colors ${
                  selectedCity === "Tangier" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-primary hover:text-primary-foreground"
                }`}
                onClick={() => setSelectedCity(selectedCity === "Tangier" ? null : "Tangier")}
              >
                <div className="text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Tours from Tangier</span>
                </div>
              </Button>
              <Button 
                variant={selectedCity === "Casablanca" ? "default" : "outline"} 
                className={`w-full h-auto py-6 transition-colors ${
                  selectedCity === "Casablanca" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-primary hover:text-primary-foreground"
                }`}
                onClick={() => setSelectedCity(selectedCity === "Casablanca" ? null : "Casablanca")}
              >
                <div className="text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Tours from Casablanca</span>
                </div>
              </Button>
            </div>
            

            {/* Show filtered tours based on selected city */}
            {selectedCity && filteredToursByCity && filteredToursByCity.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-bold text-foreground">Tours from {selectedCity}</h3>
                  <Link to={`/activities?city=${selectedCity}`} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredToursByCity.map((a, i) => (
                    <FadeInSection key={a.id} delay={i * 0.1}>
                      <ActivityCard activity={a} />
                    </FadeInSection>
                  ))}
                </div>
              </div>
            )}
            {/* Show all activities if no city is selected */}
            {!selectedCity && filteredAllActivities.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-bold text-foreground">All Tours</h3>
                  <Link to="/activities" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredAllActivities.map((a, i) => (
                    <FadeInSection key={a.id} delay={i * 0.1}>
                      <ActivityCard activity={a} />
                    </FadeInSection>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </ParallaxSection>

      {/* Sahara Desert, Private Tours, Shared Tours */}
      <ParallaxSection speed={0.22} zIndex={3}>
        <section className="py-20 bg-beige-gradient-light relative shadow-lg w-full overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Sahara Desert */}
            {saharaDesertTours.length > 0 && (
              <div className="mb-12">
                <FadeInSection>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Desert Adventures</p>
                      <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Sahara Desert</h2>
                    </div>
                    <Link to="/activities?destination=Sahara Desert" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </FadeInSection>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {saharaDesertTours.map((a, i) => (
                    <FadeInSection key={a.id} delay={i * 0.1}>
                      <ActivityCard activity={a} />
                    </FadeInSection>
                  ))}
                </div>
              </div>
            )}

            {/* All Tours */}
            {filteredAllActivities.length > 0 && (
              <div>
                <FadeInSection>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Explore Morocco</p>
                      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">All Tours</h2>
                    </div>
                    <Link to="/activities" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </FadeInSection>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredAllActivities.slice(0, 8).map((a, i) => (
                    <FadeInSection key={a.id} delay={i * 0.1}>
                      <ActivityCard activity={a} />
                    </FadeInSection>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </ParallaxSection>

      {/* Day Trips From Marrakech */}
      {dayTripsFromMarrakech.length > 0 && (
        <ParallaxSection speed={0.16} zIndex={2}>
          <section className="py-20 bg-beige-gradient-muted relative shadow-xl w-full overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
              <FadeInSection>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Quick Getaways</p>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Day Trips From Marrakech</h2>
                  </div>
                  <Link to="/activities?city=Marrakech&type=day-trip" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    View All <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeInSection>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {dayTripsFromMarrakech.map((a, i) => (
                  <FadeInSection key={a.id} delay={i * 0.1}>
                    <ActivityCard activity={a} />
                  </FadeInSection>
                ))}
              </div>
            </div>
          </section>
        </ParallaxSection>
      )}

      {/* Destinations */}
      <ParallaxSection speed={0.25} zIndex={3}>
        <section className="py-20 bg-beige-gradient-muted relative shadow-xl w-full overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
          <FadeInSection>
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{t("home.whereToGo")}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">{t("home.popularDestinations")}</h2>
            </div>
          </FadeInSection>
          {destinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {destinations.map((d, i) => (
                <FadeInSection key={d.id} delay={i * 0.1}>
                  <DestinationCard destination={d} />
                </FadeInSection>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("destinations.loading")}</p>
            </div>
          )}
        </div>
        </section>
      </ParallaxSection>

      {/* Categories */}
      <ParallaxSection speed={0.14} zIndex={2}>
        <section className="py-20 bg-beige-gradient-light relative shadow-lg w-full overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
          <FadeInSection>
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{t("home.findYourStyle")}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">{t("home.exploreByCategory")}</h2>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((c, i) => (
              <FadeInSection key={c} delay={i * 0.05}>
                <Link
                  to="/activities"
                  className="block p-6 rounded-xl bg-card border border-border text-center hover-lift group"
                >
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">{c}</h3>
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
        </section>
      </ParallaxSection>

      {/* Why Choose Us */}
      <ParallaxSection speed={0.35} zIndex={4}>
        <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground relative shadow-2xl w-full overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold">{t("home.whyChooseUs")}</h2>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyUs.map((item, i) => (
              <FadeInSection key={item.title} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary-foreground/15 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm opacity-80">{item.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
        </section>
      </ParallaxSection>

      {/* Traveler reviews: real approved reviews when available, else static testimonials */}
      <section className="relative z-[5] py-14 md:py-16 bg-beige-gradient-light border-y border-border/40 shadow-sm w-full overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <FadeInSection>
            <div className="text-center mb-10 md:mb-12">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                {t("home.whatTravelersSay")}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                {t("home.lovedByExplorers")}
              </h2>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {(recentReviewsData?.content?.length ?? 0) > 0
              ? (recentReviewsData?.content ?? []).map((rev: ActivityReview, i: number) => {
                  const fn = rev.user?.firstName?.trim() ?? "";
                  const ln = rev.user?.lastName?.trim() ?? "";
                  const displayName = `${fn} ${ln}`.trim() || t("home.reviewAnonymous");
                  const subtitle = rev.activity?.title
                    ? t("home.reviewForActivity", { activity: rev.activity.title })
                    : "";
                  const r = Math.min(5, Math.max(1, Math.round(Number(rev.rating) || 0)));
                  const quote =
                    rev.comment?.trim() ||
                    t("home.reviewRatedOnly", { rating: r });
                  const actId = rev.activity?.id;
                  return (
                    <FadeInSection key={rev.id} delay={i * 0.08}>
                      <article className="h-full p-6 rounded-2xl bg-card border border-border/60 shadow-card hover:border-primary/25 transition-colors">
                        <div className="flex gap-0.5 mb-3" aria-hidden>
                          {Array.from({ length: r }).map((_, j) => (
                            <Star key={j} className="h-4 w-4 fill-secondary text-secondary shrink-0" />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mb-5 leading-relaxed italic">
                          &ldquo;{quote}&rdquo;
                        </p>
                        <footer>
                          <p className="font-semibold text-sm text-foreground">{displayName}</p>
                          {subtitle ? (
                            actId != null ? (
                              <Link
                                to={`/activities/${actId}`}
                                className="text-xs text-primary hover:underline mt-0.5 inline-block"
                              >
                                {subtitle}
                              </Link>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                            )
                          ) : null}
                        </footer>
                      </article>
                    </FadeInSection>
                  );
                })
              : staticTravelerReviews.map((item, i) => (
                  <FadeInSection key={item.name} delay={i * 0.08}>
                    <article className="h-full p-6 rounded-2xl bg-card border border-border/60 shadow-card hover:border-primary/25 transition-colors">
                      <div className="flex gap-0.5 mb-3" aria-hidden>
                        {Array.from({ length: item.rating }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-secondary text-secondary shrink-0" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mb-5 leading-relaxed italic">
                        &ldquo;{item.text}&rdquo;
                      </p>
                      <footer>
                        <p className="font-semibold text-sm text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.location}</p>
                      </footer>
                    </article>
                  </FadeInSection>
                ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <ParallaxSection speed={0.2} zIndex={3}>
        <section className="py-20 bg-beige-gradient-muted relative shadow-xl w-full overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
          <FadeInSection>
            <div className="max-w-xl mx-auto text-center">
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">{t("home.stayInspired")}</h2>
              <p className="text-muted-foreground mb-6">{t("home.newsletterDescription")}</p>
              <div className="flex gap-2">
                <Input placeholder={t("home.enterYourEmail")} className="flex-1" />
                <Button>{t("home.subscribe")}</Button>
              </div>
            </div>
          </FadeInSection>
        </div>
        </section>
      </ParallaxSection>
    </div>
  );
}
