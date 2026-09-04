import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, BookOpen, CalendarDays, Clock, MapPin } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { absoluteUrlWithLang, normalizeLang } from "@/lib/siteUrl";
import hero from "@/assets/blog-morocco-atlas.webp";
import sahara from "@/assets/about-hero-dunes.png";
import agafay from "@/assets/about-desert-camp.png";
import atlas from "@/assets/about-mountains-group.png";
import marrakech from "@/assets/destination-1.jpg";
import aitBenHaddou from "@/assets/about-canyon-group.png";

const copy = {
  en: { label: "Morocco travel blog", title: "Plan a better journey through Morocco", intro: "Practical Morocco travel guides written to help you choose the right desert tour, Marrakech day trip and multi-day itinerary.", featured: "Featured Morocco travel guides", featuredIntro: "Start with the questions travellers ask most before booking a Morocco tour.", read: "Read the guide", minutes: "min read", planning: "Planning your Morocco itinerary", planningText: "The best Morocco itinerary balances imperial cities, the High Atlas and enough time in the Sahara. For a first trip, allow at least 7 days; 10 to 12 days makes Marrakech, Fes, Chefchaouen and Merzouga much more comfortable.", cta: "Find your Morocco tour", faq: "Morocco travel questions", home: "Home", blog: "Blog" },
  fr: { label: "Blog voyage Maroc", title: "Préparez un meilleur voyage au Maroc", intro: "Des guides pratiques pour choisir votre circuit dans le désert, votre excursion depuis Marrakech et votre itinéraire au Maroc.", featured: "Guides de voyage au Maroc", featuredIntro: "Commencez par les questions que les voyageurs posent avant de réserver un circuit au Maroc.", read: "Lire le guide", minutes: "min de lecture", planning: "Préparer votre itinéraire au Maroc", planningText: "Un bon itinéraire combine villes impériales, Haut Atlas et suffisamment de temps dans le Sahara. Prévoyez au moins 7 jours, ou 10 à 12 jours pour Marrakech, Fès, Chefchaouen et Merzouga.", cta: "Trouver votre circuit", faq: "Questions sur le voyage au Maroc", home: "Accueil", blog: "Blog" },
  es: { label: "Blog de viajes a Marruecos", title: "Planifica un mejor viaje por Marruecos", intro: "Guías prácticas para elegir un tour por el desierto, una excursión desde Marrakech y un itinerario por Marruecos.", featured: "Guías de viaje de Marruecos", featuredIntro: "Respuestas útiles antes de reservar un circuito por Marruecos.", read: "Leer la guía", minutes: "min de lectura", planning: "Planificar tu itinerario por Marruecos", planningText: "Un buen itinerario combina ciudades imperiales, el Alto Atlas y tiempo suficiente en el Sáhara. Reserva al menos 7 días; 10 a 12 días ofrecen un ritmo más cómodo.", cta: "Encontrar un tour", faq: "Preguntas sobre Marruecos", home: "Inicio", blog: "Blog" },
  de: { label: "Marokko Reiseblog", title: "Planen Sie Ihre beste Marokko-Reise", intro: "Praktische Reiseführer für Wüstentouren, Tagesausflüge ab Marrakesch und Rundreisen durch Marokko.", featured: "Marokko-Reiseführer", featuredIntro: "Hilfreiche Antworten vor der Buchung einer Marokko-Rundreise.", read: "Guide lesen", minutes: "Min. Lesezeit", planning: "Ihre Marokko-Reiseroute planen", planningText: "Eine gute Route verbindet Königsstädte, Hohen Atlas und genügend Zeit in der Sahara. Planen Sie mindestens 7 Tage, besser 10 bis 12 Tage.", cta: "Marokko-Tour finden", faq: "Fragen zur Marokko-Reise", home: "Startseite", blog: "Blog" },
} as const;

const posts = [
  { image: sahara, tag: "Sahara Desert", title: "Marrakech to Merzouga: how many days do you really need?", excerpt: "Compare 2, 3 and 4-day Sahara desert tours, driving times, camps and the best route through Aït Ben Haddou.", to: "/activities/3-day-sahara-desert-tour-from-marrakech", time: 8 },
  { image: agafay, tag: "Agafay Desert", title: "Agafay or Sahara? Choose the right Morocco desert experience", excerpt: "Understand the difference between Agafay's rocky landscape and the golden dunes around Merzouga before you book.", to: "/activities", time: 6 },
  { image: marrakech, tag: "Marrakech", title: "Best day trips from Marrakech: Atlas, Ourika and Ouzoud", excerpt: "A practical comparison of travel time, scenery, walking and the type of traveller each Marrakech excursion suits.", to: "/activities?city=Marrakech&type=day-trip", time: 7 },
  { image: atlas, tag: "Morocco itinerary", title: "The ideal 7, 10 or 12-day Morocco itinerary", excerpt: "Build a realistic route through Marrakech, Fes, Chefchaouen, the Atlas Mountains and the Sahara Desert.", to: "/activities/12-days-in-morocco-including-chefchaouen", time: 10 },
  { image: aitBenHaddou, tag: "Travel planning", title: "Morocco tours: private or shared, and what should be included?", excerpt: "A clear checklist for comparing guides, transport, accommodation, meals, cancellation terms and total value.", to: "/activities", time: 7 },
  { image: hero, tag: "Travel FAQ", title: "10 Morocco travel questions answered", excerpt: "Honest answers about safety, clothes, tipping, Marrakech, Agafay, Moroccan mosaics and when to visit.", to: "/blog#morocco-travel-faq", time: 14 },
];

const faqs = [
  ["How many days are enough for Morocco?", "Seven days can cover one city and the desert; 10 to 12 days gives a more balanced Morocco itinerary with Marrakech, Fes, Atlas scenery and Merzouga."],
  ["What is the best desert tour from Marrakech?", "A 3-day Marrakech to Merzouga desert tour is the practical minimum for reaching the Erg Chebbi dunes without turning the entire trip into a same-day drive."],
  ["When is the best time to visit Morocco?", "Spring and autumn usually offer the most comfortable balance for cities, the Atlas Mountains and desert tours. Summer is hot inland, while winter desert nights are cold."],
  ["Is a private Morocco tour worth it?", "A private tour is valuable when you want flexible stops, a custom pace, family-friendly timing or a route that starts and ends in different cities. Shared tours cost less but follow a fixed programme."],
  ["Is Agafay Desert the same as the Sahara?", "No. Agafay is a rocky desert landscape near Marrakech. The Sahara dunes travellers usually picture are around Merzouga and require a multi-day journey from Marrakech."],
  ["What should a Morocco tour include?", "Confirm the vehicle, driver, fuel, accommodation category, meals, local guides, entrance fees, desert camp, camel ride or 4x4 transfer, and cancellation terms in writing."],
  ["How long is the drive from Marrakech to Merzouga?", "The direct distance takes roughly a full driving day, which is why good tours divide the journey across the Atlas, Aït Ben Haddou, Dades Valley and Todra Gorge."],
  ["What are the best day trips from Marrakech?", "Ourika Valley is close and flexible, Ouzoud offers dramatic waterfalls, Essaouira combines coast and medina, while Agafay is best for sunset and a desert-style camp."],
  ["Do I need a guide in Morocco?", "You can explore independently, but a licensed local guide is particularly useful in the medinas of Fes and Marrakech. A driver-guide also makes long cross-country routes easier to understand and manage."],
  ["What should I pack for a Morocco desert tour?", "Bring closed shoes, sun protection, a scarf, reusable water bottle, small overnight bag and warm layers. Desert nights can be cold even after a hot afternoon."],
];

const routeComparison = [
  ["3-day Marrakech to Merzouga", "First Sahara visit", "Atlas, Aït Ben Haddou, Dades, Todra, Erg Chebbi", "/activities/3-day-sahara-desert-tour-from-marrakech"],
  ["4-day Marrakech desert tour", "A less rushed pace", "More stops and a gentler return journey", "/activities/4-days-desert-trip-from-marrakesh"],
  ["3-day Fes to Marrakech", "Travelling between two cities", "Middle Atlas, Merzouga and southern kasbahs", "/activities/tour-from-fes-to-marrakech-3-days"],
  ["12-day Morocco circuit", "A complete first trip", "Chefchaouen, Fes, Sahara, Atlas and Marrakech", "/activities/12-days-in-morocco-including-chefchaouen"],
] as const;

export default function BlogPage() {
  const { i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);
  const c = copy[lang];
  const pageUrl = absoluteUrlWithLang("/blog", lang);
  return <div className="min-h-screen bg-background pt-[100px]">
    <Seo title={`${c.label} | Sahara Tours, Marrakech & Morocco Itineraries`} description={c.intro} canonicalPath="/blog" type="website" keywords={["Morocco travel blog", "Morocco tours", "Morocco itinerary", "Sahara desert tour from Marrakech", "Merzouga desert tour", "Marrakech day trips", "Agafay Desert", "private Morocco tours", "Atlas Mountains tour", "best Morocco tour company"]} imageUrl={hero} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Blog", name: c.label, description: c.intro, url: pageUrl, inLanguage: lang, blogPost: posts.map((post) => ({ "@type": "BlogPosting", headline: post.title, url: absoluteUrlWithLang(post.to, lang) })) }} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }} />
    <section className="relative isolate overflow-hidden min-h-[520px] flex items-end">
      <img src={hero} alt="High Atlas mountains and a traditional Moroccan village" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
      <div className="relative container mx-auto max-w-7xl px-4 py-16 md:py-24 text-white">
        <PageBreadcrumb items={[{ label: c.home, to: "/" }, { label: c.blog }]} currentPath="/blog" variant="overlay" overlayTone="dark" />
        <p className="mt-10 text-sm font-bold uppercase tracking-[.2em] text-amber-300">{c.label}</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">{c.title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90">{c.intro}</p>
      </div>
    </section>
    <section className="container mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-wider text-primary">{c.label}</p><h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">{c.featured}</h2><p className="mt-4 text-lg text-muted-foreground">{c.featuredIntro}</p></div>
      <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => {
        const inner = <><div className="overflow-hidden"><img src={post.image} alt={post.title} className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div><div className="p-6"><div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-primary"><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{post.tag}</span><span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{post.time} {c.minutes}</span></div><h3 className="mt-4 font-display text-2xl font-bold leading-snug group-hover:text-primary">{post.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p><span className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">{c.read}<ArrowRight className="h-4 w-4" /></span></div></>;
        const cls = "group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl";
        return <Link key={post.title} to={post.to} className={cls}>{inner}</Link>;
      })}</div>
    </section>
    {lang === "en" && <>
      <section className="container mx-auto max-w-7xl px-4 pb-16 md:pb-24" aria-labelledby="morocco-guide-heading">
        <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">Morocco trip planning hub</p>
            <h2 id="morocco-guide-heading" className="mt-3 font-display text-3xl font-bold md:text-4xl">Everything to decide before booking a Morocco tour</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">Use these guides to compare routes rather than choosing from a list of attractions. Distances, season, start city and travel style matter more than the number of stops advertised.</p>
            <nav className="mt-7 grid gap-2" aria-label="Morocco blog topics">
              <a href="#sahara-guide" className="rounded-lg border border-border bg-card px-4 py-3 font-semibold hover:border-primary hover:text-primary">Sahara and Merzouga tours</a>
              <a href="#marrakech-guide" className="rounded-lg border border-border bg-card px-4 py-3 font-semibold hover:border-primary hover:text-primary">Marrakech and Agafay</a>
              <a href="#itinerary-guide" className="rounded-lg border border-border bg-card px-4 py-3 font-semibold hover:border-primary hover:text-primary">7, 10 and 12-day itineraries</a>
              <a href="#booking-guide" className="rounded-lg border border-border bg-card px-4 py-3 font-semibold hover:border-primary hover:text-primary">How to compare tour companies</a>
            </nav>
          </aside>
          <div className="space-y-14 text-[1.05rem] leading-8">
            <article id="sahara-guide" className="scroll-mt-32">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Sahara desert tours</p>
              <h2 className="mt-2 font-display text-3xl font-bold">Marrakech to Merzouga: why three days is the practical minimum</h2>
              <p className="mt-5 text-muted-foreground">Merzouga is not a short transfer from Marrakech. The route crosses the High Atlas and continues through Morocco's southern valleys before reaching the Erg Chebbi dunes. A well-designed <Link className="font-semibold text-primary hover:underline" to="/activities/3-day-sahara-desert-tour-from-marrakech">3-day Sahara desert tour from Marrakech</Link> turns that distance into part of the experience with stops at Aït Ben Haddou, the Dades Valley and Todra Gorge.</p>
              <p className="mt-4 text-muted-foreground">A two-day desert trip normally reaches a closer area or requires extremely long hours in the vehicle. Four days is the better choice for travellers who want more time for kasbahs, village landscapes and unhurried photography. When comparing camps, ask whether the tent has a private bathroom, how the final dune transfer works, which meals are included and how large the group will be.</p>
              <div className="mt-6 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-6 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100"><strong>Quick recommendation:</strong> choose three days when time is limited, four days for comfort, or a Fes-to-Marrakech route if you want to avoid returning along the same road.</div>
            </article>
            <article id="marrakech-guide" className="scroll-mt-32">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Marrakech day trips</p>
              <h2 className="mt-2 font-display text-3xl font-bold">Agafay, Ourika or Ouzoud: which excursion fits your trip?</h2>
              <p className="mt-5 text-muted-foreground"><strong>Agafay Desert</strong> is the easiest choice for an afternoon, sunset dinner or overnight camp close to Marrakech. Its landscape is dry and rocky, not an extension of the Sahara. Choose it for atmosphere and convenience rather than giant sand dunes.</p>
              <p className="mt-4 text-muted-foreground"><strong>Ourika Valley</strong> suits travellers who want Atlas foothills, villages and a flexible day with relatively little driving. <Link className="font-semibold text-primary hover:underline" to="/activities/marrakech-day-trip-to-ouzoud-waterfalls">Ouzoud Waterfalls</Link> requires a longer road journey but rewards it with one of Morocco's most dramatic cascades. The <Link className="font-semibold text-primary hover:underline" to="/activities/high-atlas-mountains-and-3-valleys-day-trip">High Atlas and Three Valleys tour</Link> offers the broadest variety of mountain scenery.</p>
              <p className="mt-4 text-muted-foreground">For a three-night Marrakech stay, reserve one day trip at most. With five nights, combine one mountain excursion with Agafay at sunset. This leaves enough time for the medina, palaces, gardens and food rather than treating Marrakech only as a departure point.</p>
            </article>
            <article id="itinerary-guide" className="scroll-mt-32">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Morocco itineraries</p>
              <h2 className="mt-2 font-display text-3xl font-bold">How to plan 7, 10 or 12 days in Morocco</h2>
              <p className="mt-5 text-muted-foreground"><strong>Seven days:</strong> focus on Marrakech and southern Morocco. Spend two or three nights in Marrakech, take a three-day desert route, and keep one flexible day for the Atlas or rest. Trying to add Fes and Chefchaouen usually creates too many transfers.</p>
              <p className="mt-4 text-muted-foreground"><strong>Ten days:</strong> travel from Marrakech through Merzouga to Fes rather than making a return loop. This structure adds an imperial city while using the desert tour as transport between regions. Allow at least two complete days for Fes.</p>
              <p className="mt-4 text-muted-foreground"><strong>Twelve days:</strong> add Chefchaouen and slow the pace. Our <Link className="font-semibold text-primary hover:underline" to="/activities/12-days-in-morocco-including-chefchaouen">12-day Morocco itinerary including Chefchaouen</Link> connects the blue city, Fes, Sahara, Atlas and Marrakech without changing accommodation every night.</p>
            </article>
            <article id="booking-guide" className="scroll-mt-32">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Booking advice</p>
              <h2 className="mt-2 font-display text-3xl font-bold">How to choose a Morocco tour company</h2>
              <p className="mt-5 text-muted-foreground">A low headline price reveals little until you know what is included. Ask for the accommodation names or category, room type, meal plan, vehicle, group size, local guide fees, attraction entries and desert activities. Confirm whether the quoted price is per person or for the vehicle and whether it changes with the number of travellers.</p>
              <p className="mt-4 text-muted-foreground">A reliable operator should explain long driving days honestly, answer questions before payment and provide clear cancellation terms. Recent reviews matter, but read the details: comments about punctuality, communication, vehicle comfort and guide knowledge are more useful than the score alone.</p>
              <p className="mt-4 text-muted-foreground">Private Morocco tours cost more but allow flexible stops and timing. Shared tours are useful for budget-conscious solo travellers. Families, photographers and travellers with accessibility or dietary needs generally benefit most from a private itinerary.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/35">
        <div className="container mx-auto max-w-7xl px-4 py-16 md:py-20">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">Compare popular routes</p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Which Morocco tour is right for you?</h2>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[760px] text-left"><thead className="bg-primary text-primary-foreground"><tr><th className="p-4">Tour</th><th className="p-4">Best for</th><th className="p-4">Main highlights</th><th className="p-4">Details</th></tr></thead><tbody>{routeComparison.map(([name,best,highlights,to]) => <tr key={name} className="border-t border-border"><td className="p-4 font-bold">{name}</td><td className="p-4 text-muted-foreground">{best}</td><td className="p-4 text-muted-foreground">{highlights}</td><td className="p-4"><Link to={to} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">View tour<ArrowRight className="h-4 w-4"/></Link></td></tr>)}</tbody></table>
          </div>
        </div>
      </section>
    </>}
    <section className="border-y border-border bg-muted/40"><div className="container mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.2fr_.8fr] md:items-center md:py-20"><div><div className="flex items-center gap-2 text-primary"><CalendarDays className="h-5 w-5"/><span className="font-bold uppercase tracking-wider">Morocco travel tips</span></div><h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">{c.planning}</h2><p className="mt-5 text-lg leading-relaxed text-muted-foreground">{c.planningText}</p></div><div className="rounded-2xl bg-primary p-8 text-primary-foreground"><BookOpen className="h-9 w-9"/><h3 className="mt-5 font-display text-2xl font-bold">{c.cta}</h3><p className="mt-3 text-primary-foreground/80">Compare Morocco desert tours, day trips and complete private itineraries.</p><Button asChild variant="secondary" className="mt-6 rounded-full"><Link to="/activities">{c.cta}<ArrowRight className="ml-2 h-4 w-4"/></Link></Button></div></div></section>
    <section id="morocco-travel-faq" className="scroll-mt-28 container mx-auto max-w-4xl px-4 py-16 md:py-24"><h2 className="text-center font-display text-3xl font-bold md:text-4xl">{c.faq}</h2><div className="mt-10 space-y-4">{faqs.map(([q,a]) => <details key={q} className="rounded-xl border border-border bg-card p-5 open:shadow-md"><summary className="cursor-pointer font-display text-lg font-bold">{q}</summary><p className="mt-4 leading-relaxed text-muted-foreground">{a}</p></details>)}</div></section>
  </div>;
}
