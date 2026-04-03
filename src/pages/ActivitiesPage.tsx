import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ActivityCard from "@/components/ActivityCard";
import FadeInSection from "@/components/FadeInSection";
import { publicApi } from "@/lib/publicApi";

export default function ActivitiesPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search")?.trim() ?? "");
  const [destination, setDestination] = useState("all");

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ["publicActivities", i18n.language],
    queryFn: () => publicApi.getActivities(0, 500, i18n.language),
  });

  const { data: destinationsData, isLoading: destinationsLoading } = useQuery({
    queryKey: ["publicDestinations", i18n.language],
    queryFn: () => publicApi.getDestinations(0, 200, i18n.language),
  });

  /** Sync search text from URL (hero search, shared links, browser back/forward). */
  useEffect(() => {
    setSearch(searchParams.get("search")?.trim() ?? "");
  }, [searchParams]);

  /** Resolve ?destination= (id or destination name) once destinations are loaded; normalize id in URL. */
  useEffect(() => {
    const list = destinationsData?.content;
    if (!list?.length) return;

    const param = searchParams.get("destination");
    if (!param) {
      setDestination("all");
      return;
    }

    if (/^\d+$/.test(param)) {
      const exists = list.some((d) => d.id.toString() === param);
      if (exists) {
        setDestination(param);
      } else {
        setDestination("all");
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.delete("destination");
            return next;
          },
          { replace: true },
        );
      }
      return;
    }

    const needle = param.trim().toLowerCase();
    const found =
      list.find((d) => d.name.toLowerCase() === needle) ||
      list.find((d) => d.name.toLowerCase().includes(needle));

    if (found) {
      setDestination(found.id.toString());
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("destination", found.id.toString());
          return next;
        },
        { replace: true },
      );
    } else {
      setDestination("all");
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("destination");
          return next;
        },
        { replace: true },
      );
    }
  }, [searchParams, destinationsData, setSearchParams]);

  /** Debounce writing search to URL so links stay shareable. */
  useEffect(() => {
    const fromUrl = searchParams.get("search")?.trim() ?? "";
    const trimmed = search.trim();
    if (trimmed === fromUrl) return;

    const timer = window.setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) next.set("search", trimmed);
          else next.delete("search");
          return next;
        },
        { replace: true },
      );
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search, searchParams, setSearchParams]);

  const handleDestinationChange = useCallback(
    (value: string) => {
      setDestination(value);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === "all") next.delete("destination");
          else next.set("destination", value);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const baseActivities = useMemo(() => {
    if (!activitiesData?.content) return [];
    return activitiesData.content.filter((a) => a.active !== false);
  }, [activitiesData]);

  const filtered = useMemo(() => {
    let result = [...baseActivities];

    const cityParam = searchParams.get("city");
    if (cityParam) {
      const cityLower = cityParam.toLowerCase();
      const cityVariations: Record<string, string[]> = {
        fes: ["fes", "fez"],
        marrakech: ["marrakech", "marrakesh"],
        tangier: ["tangier", "tanger"],
        casablanca: ["casablanca", "casa"],
      };
      const variations = cityVariations[cityLower] || [cityLower];
      result = result.filter((a) => {
        const departureLocation = a.departureLocation?.toLowerCase() || "";
        return variations.some((variation) => departureLocation.includes(variation));
      });
    } else if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.destination?.name || "").toLowerCase().includes(q) ||
          (a.location || "").toLowerCase().includes(q) ||
          (a.category || "").toLowerCase().includes(q),
      );
    }

    if (destination !== "all") {
      result = result.filter((a) => a.destination?.id?.toString() === destination);
    }

    result.sort((a, b) => {
      const feat = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (feat !== 0) return feat;
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [baseActivities, search, destination, searchParams]);

  const isLoading = activitiesLoading || destinationsLoading;

  if (isLoading) {
    return (
      <div className="py-12">
        <section className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Explore Activities</h1>
            <p className="text-primary-foreground/80 max-w-xl mx-auto">
              Discover unique experiences curated by travel experts across the globe.
            </p>
          </div>
        </section>
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading activities...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const destinations = destinationsData?.content ?? [];

  return (
    <div className="py-12">
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">{t("activities.exploreActivities")}</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">{t("activities.discoverUnique")}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t("activities.searchActivities")}
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t("activities.searchActivities")}
            />
          </div>
          <Select value={destination} onValueChange={handleDestinationChange}>
            <SelectTrigger className="w-full sm:w-[min(100%,280px)] shrink-0">
              <SelectValue placeholder={t("activities.destination")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("activities.allDestinations")}</SelectItem>
              {destinations.map((d) => (
                <SelectItem key={d.id} value={d.id.toString()}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {filtered.length} {t("activities.activitiesFound")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a, i) => (
            <FadeInSection key={a.id} delay={i * 0.05} className="h-full">
              <ActivityCard activity={a} />
            </FadeInSection>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{t("activities.noActivitiesFound")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
