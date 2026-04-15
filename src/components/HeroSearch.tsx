import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Activity, X, Loader2, TrendingUp, Clock, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { publicApi, getImageUrl, type Activity as ApiActivity, type Destination } from "@/lib/publicApi";
import { cn } from "@/lib/utils";

type SearchType = "all" | "activities" | "destinations";

interface HeroSearchProps {
  className?: string;
}

export default function HeroSearch({ className }: HeroSearchProps) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Ensure component is mounted (for SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all destinations for client-side filtering
  const { data: destinationsData } = useQuery({
    queryKey: ['allDestinations', i18n.language],
    queryFn: () => publicApi.getDestinations(0, 100, i18n.language),
  });

  // Search activities
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['searchActivities', searchQuery, i18n.language],
    queryFn: () => publicApi.searchActivities(searchQuery, 0, 6, i18n.language),
    enabled: searchQuery.length >= 2 && (searchType === "all" || searchType === "activities"),
  });

  useEffect(() => {
    if (destinationsData?.content) {
      setAllDestinations(destinationsData.content);
    }
  }, [destinationsData]);

  // Filter destinations client-side
  const filteredDestinations = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return allDestinations
      .filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.city?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 6);
  }, [allDestinations, searchQuery]);

  const activities = activitiesData?.content || [];
  const hasResults = 
    ((searchType === "all" || searchType === "activities") && activities.length > 0) ||
    ((searchType === "all" || searchType === "destinations") && filteredDestinations.length > 0);

  const allSuggestions = useMemo(() => {
    const items: Array<{ type: "activity" | "destination"; navKey: string; data: ApiActivity | Destination }> =
      [];

    if (searchType === "all" || searchType === "activities") {
      activities.forEach((activity) => {
        items.push({ type: "activity", navKey: activity.slug, data: activity });
      });
    }

    if (searchType === "all" || searchType === "destinations") {
      filteredDestinations.forEach((destination) => {
        items.push({ type: "destination", navKey: destination.slug, data: destination });
      });
    }

    return items;
  }, [activities, filteredDestinations, searchType]);

  // Calculate dropdown position
  useEffect(() => {
    const updatePosition = () => {
      if (searchBarRef.current) {
        const rect = searchBarRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    if (showSuggestions && searchQuery.length >= 2) {
      // Update position immediately and on next frame
      updatePosition();
      requestAnimationFrame(updatePosition);
      
      const handleResize = () => updatePosition();

      // Keep dropdown aligned with the search bar when the page or any ancestor scrolls.
      // Do not close on scroll — that breaks scrolling the suggestions list (scroll chaining
      // can fire window scroll) and is worse UX than repositioning.
      const handleScroll = () => updatePosition();

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [showSuggestions, searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
          setShowSuggestions(false);
          setFocusedIndex(-1);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions || allSuggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < allSuggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault();
        const item = allSuggestions[focusedIndex];
        handleSuggestionClick(item.type, item.navKey);
      }
    };

    if (showSuggestions) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [showSuggestions, allSuggestions, focusedIndex]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && suggestionsRef.current) {
      const focusedElement = suggestionsRef.current.querySelector(
        `[data-index="${focusedIndex}"]`
      ) as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [focusedIndex]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    if (searchType === "activities" || searchType === "all") {
      navigate(`/activities?search=${encodeURIComponent(searchQuery)}`);
    } else if (searchType === "destinations") {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery)}`);
    }
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  const handleSuggestionClick = (type: "activity" | "destination", slug: string) => {
    if (type === "activity") {
      navigate(`/activities/${encodeURIComponent(slug)}`);
    } else {
      navigate(`/destinations/${encodeURIComponent(slug)}`);
    }
    setShowSuggestions(false);
    setSearchQuery("");
    setFocusedIndex(-1);
  };

  const searchTypes: Array<{ value: SearchType; label: string; icon: typeof Activity }> = [
    { value: "all", label: "All", icon: Search },
    { value: "activities", label: "Activities", icon: Activity },
    { value: "destinations", label: "Destinations", icon: MapPin },
  ];

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-2xl mx-auto z-50", className)}>
      {/* Search Type Pills */}
      <div className="flex items-center justify-center gap-1.5 mb-3 flex-wrap">
        {searchTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              onClick={() => {
                setSearchType(type.value);
                inputRef.current?.focus();
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                "backdrop-blur-md border",
                searchType === type.value
                  ? "bg-white/20 text-white border-white/40 shadow-md"
                  : "bg-white/10 text-white/80 border-white/20 hover:bg-white/15 hover:border-white/30"
              )}
            >
              <Icon className="h-3 w-3" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Main Search Bar */}
      <div className="relative">
        <div
          ref={searchBarRef}
          className="group flex items-center bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/30 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-white/40 focus-within:ring-2 focus-within:ring-primary/40 focus-within:ring-offset-0 focus-within:border-primary/35"
        >
          <div className="flex items-center px-3">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
          </div>

          <Input
            ref={inputRef}
            value={searchQuery}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length >= 2) {
                setShowSuggestions(true);
              } else {
                setShowSuggestions(false);
              }
              setFocusedIndex(-1);
            }}
            onFocus={() => {
              if (searchQuery.length >= 2) {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && focusedIndex === -1) {
                handleSearch();
              } else if (e.key === "Escape") {
                setShowSuggestions(false);
                setFocusedIndex(-1);
                inputRef.current?.blur();
              }
            }}
            placeholder={
              searchType === "all"
                ? "Search activities, destinations, or places..."
                : searchType === "activities"
                ? "Search for activities..."
                : "Search for destinations..."
            }
            className="min-w-0 border-0 bg-transparent shadow-none rounded-none text-sm flex-1 py-3 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          />
          
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSuggestions(false);
                setFocusedIndex(-1);
                inputRef.current?.focus();
              }}
              className="mr-1 p-1.5 text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-zinc-200/80 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            className={cn(
              "group relative m-1.5 p-2.5 rounded-lg transition-all duration-300 overflow-hidden",
              "bg-primary text-primary-foreground shadow-md",
              "hover:shadow-lg hover:scale-105",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label="Search"
          >
            <Search className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
        </div>

        {/* Enhanced Suggestions Dropdown - Rendered via Portal */}
        {mounted && showSuggestions && searchQuery.length >= 2 && createPortal(
          <div
            ref={suggestionsRef}
            style={{
              position: "fixed",
              top: dropdownPosition.top > 0 ? `${dropdownPosition.top}px` : undefined,
              left: dropdownPosition.left > 0 ? `${dropdownPosition.left}px` : undefined,
              width: dropdownPosition.width > 0 ? `${dropdownPosition.width}px` : searchBarRef.current?.offsetWidth || "100%",
              maxWidth: "600px",
            }}
            className="bg-white/98 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 max-h-[450px] overflow-y-auto overscroll-contain z-[9999] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
          >
            {activitiesLoading && (searchType === "all" || searchType === "activities") && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="ml-2 text-xs text-muted-foreground">Searching...</span>
              </div>
            )}

            {!activitiesLoading && hasResults && (
              <>
                {/* Activities Section */}
                {(searchType === "all" || searchType === "activities") && activities.length > 0 && (
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-foreground/70 uppercase tracking-wider flex items-center gap-1.5 bg-muted/30 rounded-md mb-1.5">
                      <Activity className="h-3 w-3" />
                      Activities ({activities.length})
                    </div>
                    <div className="space-y-0.5">
                      {activities.map((activity, idx) => {
                        const globalIndex = idx;
                        const isFocused = focusedIndex === globalIndex;
                        return (
                          <button
                            key={activity.id}
                            data-index={globalIndex}
                            onClick={() => handleSuggestionClick("activity", activity.slug)}
                            className={cn(
                              "w-full px-3 py-2.5 text-left rounded-lg transition-all duration-150 flex items-start gap-3 group",
                              "hover:bg-primary/5 hover:shadow-sm border border-transparent",
                              isFocused && "bg-primary/10 border-primary/20 shadow-sm"
                            )}
                          >
                            {activity.imageUrl && (
                              <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                <img
                                  src={getImageUrl(activity.imageUrl)}
                                  alt={activity.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-0.5">
                                {activity.title}
                              </div>
                              {activity.shortDescription && (
                                <div className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                                  {activity.shortDescription}
                                </div>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                {activity.destination?.name && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-2.5 w-2.5" />
                                    <span className="line-clamp-1">{activity.destination.name}</span>
                                  </div>
                                )}
                                {activity.duration && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    {activity.duration}
                                  </div>
                                )}
                                {activity.ratingAverage && activity.ratingAverage > 0 && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Star className="h-2.5 w-2.5 fill-secondary text-secondary" />
                                    {activity.ratingAverage.toFixed(1)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Destinations Section */}
                {(searchType === "all" || searchType === "destinations") && filteredDestinations.length > 0 && (
                  <div className={cn("p-2", (searchType === "all" || searchType === "activities") && activities.length > 0 && "border-t border-border/50 pt-2")}>
                    <div className="px-3 py-2 text-xs font-semibold text-foreground/70 uppercase tracking-wider flex items-center gap-1.5 bg-muted/30 rounded-md mb-1.5">
                      <MapPin className="h-3 w-3" />
                      Destinations ({filteredDestinations.length})
                    </div>
                    <div className="space-y-0.5">
                      {filteredDestinations.map((destination, idx) => {
                        const globalIndex = searchType === "destinations"
                          ? idx
                          : (searchType === "all" ? activities.length + idx : idx);
                        const isFocused = focusedIndex === globalIndex;
                        return (
                          <button
                            key={destination.id}
                            data-index={globalIndex}
                            onClick={() => handleSuggestionClick("destination", destination.slug)}
                            className={cn(
                              "w-full px-3 py-2.5 text-left rounded-lg transition-all duration-150 flex items-start gap-3 group",
                              "hover:bg-primary/5 hover:shadow-sm border border-transparent",
                              isFocused && "bg-primary/10 border-primary/20 shadow-sm"
                            )}
                          >
                            {destination.imageUrl && (
                              <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                <img
                                  src={getImageUrl(destination.imageUrl)}
                                  alt={destination.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors mb-0.5">
                                {destination.name}
                              </div>
                              {destination.country && (
                                <div className="text-xs text-muted-foreground mb-1">
                                  {destination.country}
                                  {destination.city && ` • ${destination.city}`}
                                </div>
                              )}
                              {destination.shortDescription && (
                                <div className="text-xs text-muted-foreground line-clamp-2">
                                  {destination.shortDescription}
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0 flex items-center text-muted-foreground">
                              <TrendingUp className="h-3.5 w-3.5" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!activitiesLoading && !hasResults && searchQuery.length >= 2 && (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No results found</p>
                <p className="text-xs text-muted-foreground">
                  Try searching for "{searchQuery}" with different keywords
                </p>
              </div>
            )}

            {/* Helper Text */}
            {searchQuery.length >= 2 && hasResults && (
              <div className="px-3 py-2 border-t border-border/50 bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
                <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
                <span className="font-medium">{allSuggestions.length} result{allSuggestions.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
