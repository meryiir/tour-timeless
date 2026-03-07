import DestinationCard from "@/components/DestinationCard";
import FadeInSection from "@/components/FadeInSection";
import { destinations } from "@/data/mockData";

export default function DestinationsPage() {
  return (
    <div className="py-12">
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Destinations</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Explore our curated collection of the world's most breathtaking destinations.</p>
        </div>
      </section>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((d, i) => (
            <FadeInSection key={d.id} delay={i * 0.1}>
              <DestinationCard destination={d} />
            </FadeInSection>
          ))}
        </div>
        {destinations.map((d) => (
          <FadeInSection key={d.id} className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <img src={d.image} alt={d.name} className="rounded-xl w-full aspect-[4/3] object-cover" />
              <div>
                <h2 className="font-display text-2xl font-bold mb-3">{d.name}</h2>
                <p className="text-muted-foreground mb-4">{d.description}</p>
                <p className="text-sm font-medium text-primary">{d.activityCount} activities available</p>
              </div>
            </div>
          </FadeInSection>
        ))}
      </div>
    </div>
  );
}
