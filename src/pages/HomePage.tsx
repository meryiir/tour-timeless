import { Link } from "react-router-dom";
import { useState, useMemo, type FormEvent } from "react";
import {
  Star,
  Shield,
  Headphones,
  Globe,
  ChevronRight,
  Activity,
  MapPin,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ActivityCard from "@/components/ActivityCard";
import DestinationCard from "@/components/DestinationCard";
import FadeInSection from "@/components/FadeInSection";
import ParallaxSection from "@/components/ParallaxSection";
import HeroSearch from "@/components/HeroSearch";
import { publicApi, type Activity as ApiActivity } from "@/lib/publicApi";
import ViatorMark from "@/components/ViatorMark";

/** Featured tour on Viator — same experience as our Morocco desert offering. */
const VIATOR_TOUR_REVIEWS_URL =
  "https://www.viator.com/tours/Marrakech/Morocco-desert-tour-from-Marrakech-3-days-including-camel-trek/d5408-64126P9";

const VIATOR_HOME_REVIEWS = [
  {
    id: "v1",
    rating: 5,
    title: "Just amazing !!!",
    author: "Vicky_w",
    date: "Mar 2025",
    text: "After doing many trips across Morocco this one topped them all ! Everything was amazing from start to finish , the group we were in , the guides, the places we visited on route . The Sahara itself was mind blowin",
  },
  {
    id: "v2",
    rating: 4,
    title: "Fantastic experience thank you",
    author: "Lee_P",
    date: "Nov 2024",
    text: "I did this tour with my 25 year old Son and we both had a fantastic time, he particularly enjoyed the quad biking & sand bording and the music in the camp in the evening. Our guide Iddir was really kind and couldn't",
  },
  {
    id: "v3",
    rating: 5,
    title: "Sahara is to do",
    author: "omar_l",
    date: "Aug 2024",
    text: "The Sahara trip was amazing and was a nice experience, next time it'll be to stay 2 days in the Sahara camp to make the most of it.",
  },
  {
    id: "v4",
    rating: 4,
    title: "Good experience, some things we wish to know before...",
    author: "Rodrigo_U",
    date: "Apr 2024",
    text: "Overall experience was really good, we did a good exploration of Morocco and some interesting sightseeing. We learned from the local guides a lot about some places and the culture, and the desert expe",
  },
] as const;

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  // Removed tourType filter - all activities can be private or shared

  const emailLooksValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  async function onNewsletterSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = newsletterEmail.trim();
    if (!emailLooksValid(trimmed)) {
      toast({
        title: t("home.newsletterInvalidTitle"),
        description: t("home.newsletterInvalidDescription"),
        variant: "destructive",
      });
      return;
    }
    setNewsletterLoading(true);
    try {
      const res = await publicApi.subscribeNewsletter(trimmed);
      setNewsletterDone(true);
      setNewsletterEmail("");
      toast({
        title: res.alreadySubscribed
          ? t("home.newsletterAlreadyTitle")
          : t("home.newsletterSuccessTitle"),
        description: res.alreadySubscribed
          ? t("home.newsletterAlreadyDescription")
          : t("home.newsletterSuccessDescription"),
      });
    } catch (err) {
      toast({
        title: t("home.newsletterErrorTitle"),
        description: err instanceof Error ? err.message : t("home.newsletterErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setNewsletterLoading(false);
    }
  }

  const scrollToHomeDestinations = () => {
    const el = document.getElementById("home-destinations");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const whyUs = [
    { icon: Shield, title: t("home.trustedSecure"), desc: t("home.trustedSecureDesc") },
    { icon: Star, title: t("home.curatedExperiences"), desc: t("home.curatedExperiencesDesc") },
    { icon: Headphones, title: t("home.support24"), desc: t("home.support24Desc") },
    { icon: Globe, title: t("home.globalNetwork"), desc: t("home.globalNetworkDesc") },
  ];

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

  // Get all activities for filtering
  const { data: allActivitiesData } = useQuery({
    queryKey: ['allActivities', i18n.language],
    queryFn: () => publicApi.getActivities(0, 100, i18n.language),
  });

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
      .filter((a) => {
        const departureLocation = a.departureLocation?.toLowerCase() || "";
        return variations.some((variation) => departureLocation.includes(variation));
      })
      .slice(0, 8);
  };

  // Filter activities by destination name
  const getActivitiesByDestination = (destinationName: string) => {
    const destination = allDestinations.find(d => d.name === destinationName || d.city === destinationName);
    if (!destination) return [];
    return allActivities.filter((a) => a.destination?.id === destination.id).slice(0, 4);
  };

  // Removed getActivitiesByTourType - all activities can be private or shared

  // Day trips from Marrakech (activities with departure location or destination city Marrakech)
  const getDayTripsFromMarrakech = () => {
    const marrakechDestination = allDestinations.find(d => d.city === 'Marrakech');
    return allActivities
      .filter(
        (a) =>
          a.departureLocation?.toLowerCase().includes("marrakech") ||
          a.destination?.city === "Marrakech" ||
          (marrakechDestination && a.destination?.id === marrakechDestination.id),
      )
      .slice(0, 4);
  };

  const saharaDesertTours = getActivitiesByDestination("Sahara Desert");
  // Removed separate private/shared tours - all activities shown together
  const dayTripsFromMarrakech = getDayTripsFromMarrakech();

  const allTransformedActivities = useMemo(
    () => allActivities.filter((a) => a.active !== false),
    [allActivities],
  );

  const filteredToursByCity = useMemo(() => {
    if (!selectedCity) return null;
    return getActivitiesByCity(selectedCity);
  }, [selectedCity, allActivities]);

  const filteredAllActivities = allTransformedActivities;

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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
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
                  <span className="text-sm font-medium">All</span>
                </div>
              </Button>
              <Button 
                  variant={selectedCity === null ? "default" : "outline"} 
                  className={`w-full h-auto py-6 transition-colors ${
                    selectedCity === null 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                  onClick={() => {
                    setSelectedCity(null);
                    scrollToHomeDestinations();
                  }}
                >
                  <div className="text-center">
                    <MapPin className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Destinations</span>
                  </div>
                </Button>
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
              {/* Removed Tangier & Casablanca buttons */}
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
                <div className="card-grid">
                  {filteredToursByCity.map((a, i) => (
                    <FadeInSection key={a.id} delay={i * 0.1} className="h-full">
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
                <div className="card-grid">
                  {filteredAllActivities.map((a, i) => (
                    <FadeInSection key={a.id} delay={i * 0.1} className="h-full">
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
                <div className="card-grid">
                  {saharaDesertTours.map((a, i) => (
                    <FadeInSection key={a.id} delay={i * 0.1} className="h-full">
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
                <div className="card-grid">
                  {filteredAllActivities.slice(0, 8).map((a, i) => (
                    <FadeInSection key={a.id} delay={i * 0.1} className="h-full">
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
              <div className="card-grid">
                {dayTripsFromMarrakech.map((a, i) => (
                  <FadeInSection key={a.id} delay={i * 0.1} className="h-full">
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
        <section
          id="home-destinations"
          className="scroll-mt-24 py-20 bg-beige-gradient-muted relative shadow-xl w-full overflow-hidden"
        >
          <div className="container mx-auto px-4 max-w-7xl">
          <FadeInSection>
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{t("home.whereToGo")}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">{t("home.popularDestinations")}</h2>
            </div>
          </FadeInSection>
          {destinations.length > 0 ? (
            <div className="card-grid">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-8 items-stretch">
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
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold px-2">{t("home.whyChooseUs")}</h2>
            </div>
          </FadeInSection>
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-8">
            {whyUs.map((item, i) => (
              <FadeInSection key={item.title} delay={i * 0.1} className="min-w-0">
                <div className="flex h-full flex-col items-center gap-2 rounded-xl border border-primary-foreground/15 bg-primary-foreground/[0.07] p-3 text-center shadow-sm backdrop-blur-sm sm:gap-3 sm:p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 sm:h-14 sm:w-14 sm:rounded-xl">
                    <item.icon className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden />
                  </div>
                  <h3 className="font-display text-[13px] font-semibold leading-tight text-primary-foreground sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="text-[11px] leading-snug text-primary-foreground/85 sm:text-sm sm:leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
        </section>
      </ParallaxSection>

      {/* Traveler reviews from API */}
      <section className="relative z-[5] py-14 md:py-16 bg-beige-gradient-light border-y border-border/40 shadow-sm w-full overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <FadeInSection>
            <div className="text-center mb-8 md:mb-10">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                {t("home.whatTravelersSay")}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                {t("home.lovedByExplorers")}
              </h2>
              <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
                  <ViatorMark className="h-8 w-8 shrink-0" />
                  <span className="font-medium text-foreground">{t("home.viatorReviewsBadge")}</span>
                </div>
                <a
                  href={VIATOR_TOUR_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t("home.viatorSeeTourOnViator")}
                  <ExternalLink className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                </a>
              </div>
            </div>
          </FadeInSection>
          <div className="card-grid-reviews">
            {VIATOR_HOME_REVIEWS.map((rev, i) => {
              const r = Math.min(5, Math.max(1, Math.round(rev.rating)));
              return (
                <FadeInSection key={rev.id} delay={i * 0.08}>
                  <article className="flex h-full flex-col p-6 rounded-2xl bg-card border border-border/60 shadow-card hover:border-primary/25 transition-colors">
                    <div className="mb-2 flex gap-0.5" aria-hidden>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={cn(
                            "h-4 w-4 shrink-0",
                            j < r
                              ? "fill-emerald-600 text-emerald-600"
                              : "fill-transparent text-emerald-600/35",
                          )}
                        />
                      ))}
                    </div>
                    <h3 className="font-display font-semibold text-foreground leading-snug mb-2">{rev.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {rev.author}, {rev.date}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">
                      &ldquo;{rev.text}&rdquo;
                    </p>
                    <p className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-1.5">
                      <ViatorMark className="h-4 w-4 shrink-0" />
                      <span>{t("home.viatorReviewSource")}</span>
                    </p>
                  </article>
                </FadeInSection>
              );
            })}
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
              <form
                onSubmit={onNewsletterSubmit}
                className="text-left"
                noValidate
                aria-label={t("home.newsletterFormAria")}
              >
                <div
                  className={cn(
                    "flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-2",
                    "rounded-2xl border border-border/60 bg-background/80 p-2 shadow-sm backdrop-blur-sm",
                  )}
                >
                  <Input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={t("home.enterYourEmail")}
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterDone) setNewsletterDone(false);
                    }}
                    disabled={newsletterLoading}
                    className="flex-1 min-h-11 border-0 bg-transparent shadow-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-invalid={newsletterEmail.length > 0 && !emailLooksValid(newsletterEmail)}
                  />
                  <Button
                    type="submit"
                    disabled={newsletterLoading}
                    className="shrink-0 min-h-11 px-6 sm:min-w-[9rem]"
                  >
                    {newsletterLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        {t("home.subscribing")}
                      </>
                    ) : newsletterDone ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />
                        {t("home.subscribed")}
                      </>
                    ) : (
                      t("home.subscribe")
                    )}
                  </Button>
                </div>
                <p
                  className="mt-3 text-center text-sm text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  {t("home.newsletterPrivacyHint")}
                </p>
              </form>
            </div>
          </FadeInSection>
        </div>
        </section>
      </ParallaxSection>
    </div>
  );
}
