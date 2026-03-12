import { Link } from "react-router-dom";
import { Star, Shield, Headphones, Globe, ChevronRight, Activity, MapPin, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ActivityCard from "@/components/ActivityCard";
import DestinationCard from "@/components/DestinationCard";
import FadeInSection from "@/components/FadeInSection";
import ParallaxSection from "@/components/ParallaxSection";
import HeroSearch from "@/components/HeroSearch";
import { publicApi, getImageUrl, type Activity as ApiActivity } from "@/lib/publicApi";
const testimonials = [
  { name: "Sarah M.", text: "An absolutely magical experience. Wanderlust made our honeymoon truly unforgettable!", rating: 5, location: "New York, USA" },
  { name: "James R.", text: "Professional, well-organized, and the activities were beyond expectations. Highly recommend!", rating: 5, location: "London, UK" },
  { name: "Emily C.", text: "From booking to the actual experience, everything was seamless. Can't wait for our next trip!", rating: 5, location: "Toronto, Canada" },
];

const whyUs = [
  { icon: Shield, title: "Trusted & Secure", desc: "Verified experiences with secure booking and full travel protection." },
  { icon: Star, title: "Curated Experiences", desc: "Hand-picked activities chosen by travel experts for quality." },
  { icon: Headphones, title: "24/7 Support", desc: "Round-the-clock assistance wherever your adventure takes you." },
  { icon: Globe, title: "Global Network", desc: "Access to exclusive experiences across 50+ countries." },
];

export default function HomePage() {
  const { data: featuredActivitiesData } = useQuery({
    queryKey: ['featuredActivities'],
    queryFn: () => publicApi.getFeaturedActivities(0, 8),
  });

  const { data: destinationsData } = useQuery({
    queryKey: ['publicDestinations'],
    queryFn: () => publicApi.getDestinations(0, 8),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['publicCategories'],
    queryFn: () => publicApi.getCategories(),
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
    id: d.id.toString(),
    name: d.name,
    image: getImageUrl(d.imageUrl),
    country: d.country || '',
    activityCount: 0,
  }));

  const categories = categoriesData || [];

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
            Discover Your <span className="text-accent font-extrabold text-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Next</span> Adventure
          </h1>
          <p className="text-lg md:text-xl text-white/95 mb-10 font-body animate-hero-description animate-infinite-glow max-w-2xl mx-auto leading-relaxed drop-shadow-lg italic">
            Curated travel experiences that turn moments into memories. Explore extraordinary destinations worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 animate-hero-buttons">
            <Link to="/activities">
              <Button 
                size="default"
                className="group relative px-6 py-2.5 h-auto bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
              >
                <Activity className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-sm font-medium">Explore Activities</span>
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
                <span className="text-sm font-medium">View Destinations</span>
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

      {/* Featured Activities */}
      <ParallaxSection speed={0.12} zIndex={2}>
        <section className="py-20 bg-beige-gradient-light relative shadow-lg w-full overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
          <FadeInSection>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Handpicked for you</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Featured Activities</h2>
              </div>
              <Link to="/activities" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredActivities.map((a, i) => (
              <FadeInSection key={a.id} delay={i * 0.1}>
                <ActivityCard activity={a} />
              </FadeInSection>
            ))}
          </div>
        </div>
        </section>
      </ParallaxSection>

      {/* Destinations */}
      <ParallaxSection speed={0.25} zIndex={3}>
        <section className="py-20 bg-beige-gradient-muted relative shadow-xl w-full overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
          <FadeInSection>
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Where to go</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Popular Destinations</h2>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((d, i) => (
              <FadeInSection key={d.id} delay={i * 0.1}>
                <DestinationCard destination={d} />
              </FadeInSection>
            ))}
          </div>
        </div>
        </section>
      </ParallaxSection>

      {/* Categories */}
      <ParallaxSection speed={0.14} zIndex={2}>
        <section className="py-20 bg-beige-gradient-light relative shadow-lg w-full overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
          <FadeInSection>
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Find your style</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Explore by Category</h2>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <h2 className="font-display text-3xl md:text-4xl font-bold">Why Choose Wanderlust</h2>
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

      {/* Testimonials */}
      <ParallaxSection speed={0.13} zIndex={2}>
        <section className="py-20 bg-beige-gradient-light relative shadow-lg w-full overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
          <FadeInSection>
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What travelers say</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Loved by Explorers</h2>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeInSection key={t.name} delay={i * 0.1}>
                <div className="p-6 rounded-xl bg-card shadow-card">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
        </section>
      </ParallaxSection>

      {/* Newsletter */}
      <ParallaxSection speed={0.2} zIndex={3}>
        <section className="py-20 bg-beige-gradient-muted relative shadow-xl w-full overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
          <FadeInSection>
            <div className="max-w-xl mx-auto text-center">
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">Stay Inspired</h2>
              <p className="text-muted-foreground mb-6">Get travel tips, exclusive deals, and destination highlights delivered to your inbox.</p>
              <div className="flex gap-2">
                <Input placeholder="Enter your email" className="flex-1" />
                <Button>Subscribe</Button>
              </div>
            </div>
          </FadeInSection>
        </div>
        </section>
      </ParallaxSection>
    </div>
  );
}
