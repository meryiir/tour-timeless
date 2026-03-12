import { Shield, Heart, Globe, Award } from "lucide-react";
import FadeInSection from "@/components/FadeInSection";
import heroBg from "@/assets/hero-bg.jpg";

const values = [
  { icon: Heart, title: "Passion for Travel", desc: "Every experience we offer is crafted by people who live and breathe travel." },
  { icon: Shield, title: "Safety First", desc: "All our partners meet the highest safety and quality standards." },
  { icon: Globe, title: "Sustainable Tourism", desc: "We're committed to responsible travel that benefits local communities." },
  { icon: Award, title: "Excellence", desc: "Award-winning service recognized by travel industry leaders worldwide." },
];

export default function AboutPage() {
  return (
    <div className="py-12">
      <section className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">About Wanderlust</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Your trusted partner in creating extraordinary travel experiences since 2018.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <img src={heroBg} alt="About us" className="rounded-xl aspect-[4/3] object-cover" />
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Our Story</p>
              <h2 className="font-display text-3xl font-bold mb-4">Born from a Love of Adventure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Wanderlust was founded by a group of passionate travelers who believed that extraordinary experiences should be accessible to everyone. What started as a small collection of curated adventures has grown into a global platform connecting travelers with the world's most remarkable experiences.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we partner with over 500 local experts across 50+ countries to bring you authentic, unforgettable experiences that go beyond typical tourism.
              </p>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection>
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold">Our Values</h2>
          </div>
        </FadeInSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {values.map((v, i) => (
            <FadeInSection key={v.title} delay={i * 0.1}>
              <div className="text-center p-6 rounded-xl bg-card shadow-card">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>

        <FadeInSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: "50+", label: "Countries" },
              { num: "500+", label: "Local Partners" },
              { num: "25K+", label: "Happy Travelers" },
              { num: "4.9", label: "Average Rating" },
            ].map((s) => (
              <div key={s.label} className="p-6 rounded-xl bg-beige-gradient-muted">
                <p className="font-display text-3xl font-bold text-primary">{s.num}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}
