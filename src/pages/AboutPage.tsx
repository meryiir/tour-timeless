import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Heart,
  Globe,
  Award,
  MapPin,
  ArrowRight,
  Compass,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import { parseAboutContentJson } from "@/lib/siteSettings";
import FadeInSection from "@/components/FadeInSection";
import { Button } from "@/components/ui/button";
import aboutHeroDunes from "@/assets/about-hero-dunes.png";
import aboutDesertCamp from "@/assets/about-desert-camp.png";
import aboutOasisGroup from "@/assets/about-oasis-group.png";
import aboutCanyonGroup from "@/assets/about-canyon-group.png";
import aboutMountainsGroup from "@/assets/about-mountains-group.png";

export default function AboutPage() {
  const { t } = useTranslation();
  const { data: siteSettings } = usePublicSiteSettings();
  const overrides = useMemo(
    () => parseAboutContentJson(siteSettings?.aboutContentJson),
    [siteSettings?.aboutContentJson],
  );

  const heroBadge = overrides?.heroBadge ?? t("about.heroBadge");
  const heroTitle = overrides?.heroTitle ?? t("about.aboutWanderlust");
  const trustedPartner = overrides?.trustedPartner ?? t("about.trustedPartner");
  const missionLead = overrides?.missionLead ?? t("about.missionLead");
  const storyKicker = overrides?.storyKicker ?? t("about.ourStory");
  const storyHeading = overrides?.storyHeading ?? t("about.bornFromAdventure");
  const storyText1 = overrides?.storyText1 ?? t("about.storyText1");
  const storyText2 = overrides?.storyText2 ?? t("about.storyText2");
  const experienceSubtitle = overrides?.experienceSubtitle ?? t("about.experienceSubtitle");
  const valuesIntro = overrides?.valuesIntro ?? t("about.valuesIntro");
  const inspireQuote = overrides?.inspireQuote ?? t("about.inspireQuote");
  const inspireAttribution = overrides?.inspireAttribution ?? t("about.inspireAttribution");
  const ctaTitle = overrides?.ctaTitle ?? t("about.ctaTitle");
  const ctaSubtitle = overrides?.ctaSubtitle ?? t("about.ctaSubtitle");

  const values = [
    { icon: Heart, title: overrides?.values?.[0]?.title ?? t("about.passionForTravel"), desc: overrides?.values?.[0]?.desc ?? t("about.passionDesc") },
    { icon: Shield, title: overrides?.values?.[1]?.title ?? t("about.safetyFirst"), desc: overrides?.values?.[1]?.desc ?? t("about.safetyDesc") },
    { icon: Globe, title: overrides?.values?.[2]?.title ?? t("about.sustainableTourism"), desc: overrides?.values?.[2]?.desc ?? t("about.sustainableDesc") },
    { icon: Award, title: overrides?.values?.[3]?.title ?? t("about.excellence"), desc: overrides?.values?.[3]?.desc ?? t("about.excellenceDesc") },
  ];

  const defaultStats = [
    { num: "50+", label: t("about.countries") },
    { num: "500+", label: t("about.localPartners") },
    { num: "25K+", label: t("about.happyTravelers") },
    { num: "4.9", label: t("about.averageRating") },
  ];
  const stats = overrides?.stats?.length === 4 ? overrides.stats : defaultStats;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — strong tourism visual */}
      <section
        className="relative min-h-[min(96vh,960px)] sm:min-h-[min(94vh,920px)] flex flex-col justify-end md:justify-center overflow-hidden"
        aria-labelledby="about-hero-heading"
      >
        <img
          src={aboutHeroDunes}
          alt={t("about.heroImageAlt")}
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/40 to-black/30 md:bg-gradient-to-r md:from-black/65 md:via-black/40 md:to-black/20"
          aria-hidden
        />
        <div className="relative z-10 container mx-auto px-4 pb-28 sm:pb-32 md:pb-14 pt-28 md:py-24 max-w-7xl">
          <div className="max-w-2xl">
            <FadeInSection>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm mb-6">
                <Compass className="h-3.5 w-3.5" aria-hidden />
                {heroBadge}
              </p>
              <h1
                id="about-hero-heading"
                className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.08] mb-5 drop-shadow-sm"
              >
                {heroTitle}
              </h1>
              <p className="text-lg md:text-xl text-white/88 font-body leading-relaxed mb-3 max-w-xl">
                {trustedPartner}
              </p>
              <p className="text-base text-white/75 font-body leading-relaxed mb-10 max-w-lg">
                {missionLead}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 h-12 text-base shadow-lg shadow-black/20"
                >
                  <Link to="/activities" className="gap-2">
                    {t("about.exploreTours")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-12 text-base border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                >
                  <Link to="/contact" className="gap-2">
                    <MapPin className="h-4 w-4" />
                    {t("about.contactTeam")}
                  </Link>
                </Button>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Story + image mosaic */}
      <section className="relative py-16 md:py-24 border-b border-border/50" aria-labelledby="about-story-heading">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <FadeInSection>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  {t("about.ourStory")}
                </p>
                <h2
                  id="about-story-heading"
                  className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6"
                >
                  {storyHeading}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4 text-base md:text-lg">
                  {storyText1}
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8 text-base md:text-lg">
                  {storyText2}
                </p>
                <Button asChild variant="ghost" className="text-primary hover:text-primary px-0 gap-2 group">
                  <Link to="/activities">
                    {t("about.seeExperiences")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </FadeInSection>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <FadeInSection>
                <div className="grid grid-cols-12 gap-3 sm:gap-4 auto-rows-fr">
                  <div className="col-span-12 sm:col-span-8 sm:row-span-2">
                    <div className="relative h-full min-h-[220px] sm:min-h-[340px] rounded-2xl overflow-hidden shadow-elevated ring-1 ring-black/5">
                      <img
                        src={aboutOasisGroup}
                        alt={t("about.collageAltMain")}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    </div>
                  </div>
                  <div className="col-span-6 sm:col-span-4 sm:col-start-9 sm:row-start-1">
                    <div className="relative aspect-[4/5] sm:aspect-auto sm:min-h-[calc(50%-0.375rem)] sm:h-full rounded-2xl overflow-hidden shadow-card ring-1 ring-black/5">
                      <img
                        src={aboutDesertCamp}
                        alt={t("about.collageAltSecondary")}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                      />
                    </div>
                  </div>
                  <div className="col-span-6 sm:col-span-4 sm:col-start-9 sm:row-start-2">
                    <div className="relative aspect-[4/5] sm:aspect-auto sm:min-h-[calc(50%-0.375rem)] sm:h-full rounded-2xl overflow-hidden shadow-card ring-1 ring-black/5">
                      <img
                        src={aboutMountainsGroup}
                        alt={t("about.collageAltTertiary")}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground text-center sm:text-left">
                  {experienceSubtitle}
                </p>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-beige-gradient-muted" aria-labelledby="about-values-heading">
        <div className="container mx-auto px-4 max-w-7xl">
          <FadeInSection>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 id="about-values-heading" className="font-display text-3xl md:text-4xl font-bold mb-4">
                {t("about.ourValues")}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                {valuesIntro}
              </p>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {values.map((v, i) => (
              <FadeInSection key={v.title} delay={i * 0.08}>
                <article className="group h-full p-6 md:p-7 rounded-2xl bg-card border border-border/70 shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                    <v.icon className="h-6 w-6 text-primary" aria-hidden />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </article>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Inspirational band */}
      <section className="relative py-20 md:py-28 overflow-hidden" aria-labelledby="about-quote">
        <img
          src={aboutCanyonGroup}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/92 via-primary/85 to-accent/80" />
        <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center">
          <FadeInSection>
            <blockquote
              id="about-quote"
              className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-primary-foreground leading-snug mb-6"
            >
              &ldquo;{inspireQuote}&rdquo;
            </blockquote>
            <p className="text-primary-foreground/85 text-sm uppercase tracking-widest font-medium">
              — {inspireAttribution}
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-20 bg-background border-y border-border/40" aria-label={t("about.statsAria")}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((s) => (
              <FadeInSection key={s.label}>
                <div className="relative text-center p-6 md:p-8 rounded-2xl bg-beige-gradient-light border border-border/50 overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="relative font-display text-3xl md:text-4xl font-bold text-primary tabular-nums">
                    {s.num}
                  </p>
                  <p className="relative text-sm text-muted-foreground mt-2 font-medium">{s.label}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24" aria-labelledby="about-cta-heading">
        <div className="container mx-auto px-4 max-w-5xl">
          <FadeInSection>
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent opacity-[0.97]" />
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative px-8 py-12 md:px-14 md:py-14 text-center text-primary-foreground">
                <h2 id="about-cta-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                  {ctaTitle}
                </h2>
                <p className="text-primary-foreground/85 max-w-xl mx-auto mb-8 text-base md:text-lg leading-relaxed">
                  {ctaSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  >
                    <Link to="/activities" className="gap-2">
                      {t("about.exploreTours")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  >
                    <Link to="/destinations">{t("about.browseDestinations")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

    </div>
  );
}
