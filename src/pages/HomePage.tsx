import { Link } from "react-router-dom";
import { Search, Star, Shield, Headphones, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ActivityCard from "@/components/ActivityCard";
import DestinationCard from "@/components/DestinationCard";
import FadeInSection from "@/components/FadeInSection";
import { activities, destinations, categories } from "@/data/mockData";
import heroBg from "@/assets/hero-bg.jpg";

const featuredActivities = activities.filter((a) => a.featured);
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
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Travel destination" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/40" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-fade-in-up">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-4 leading-tight">
            Discover Your Next Adventure
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/85 mb-8 font-body">
            Curated travel experiences that turn moments into memories. Explore extraordinary destinations worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link to="/activities"><Button size="lg" className="text-base px-8">Explore Activities</Button></Link>
            <Link to="/destinations"><Button size="lg" variant="outline" className="text-base px-8 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">View Destinations</Button></Link>
          </div>
          <div className="flex items-center bg-card/90 backdrop-blur-sm rounded-xl p-2 max-w-xl mx-auto shadow-elevated">
            <Search className="h-5 w-5 text-muted-foreground ml-3" />
            <Input placeholder="Search activities, destinations..." className="border-0 bg-transparent focus-visible:ring-0 shadow-none" />
            <Button size="sm" className="shrink-0">Search</Button>
          </div>
        </div>
      </section>

      {/* Featured Activities */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
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

      {/* Destinations */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
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

      {/* Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
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

      {/* Why Choose Us */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
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

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
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

      {/* Newsletter */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
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
    </div>
  );
}
