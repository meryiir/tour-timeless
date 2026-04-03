import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, MapPin, Clock, Activity, Check, Calendar, ChevronLeft, Users, Shield, AlertCircle, Sparkles, X, ZoomIn, UserCheck, Crown, Home, Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ActivityCard from "@/components/ActivityCard";
import FadeInSection from "@/components/FadeInSection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { publicApi, getImageUrl, type Activity as ApiActivity, type ActivityReview } from "@/lib/publicApi";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { normalizeGoogleMapsEmbedUrl, isGoogleMapsEmbedUrl, shouldTryResolveMapUrl } from "@/lib/maps";
import { format, startOfDay } from "date-fns";
import { enUS, fr, es, de } from "date-fns/locale";
import Autoplay from "embla-carousel-autoplay";

const VIATOR_BOOKING_URL =
  "https://www.viator.com/tours/Marrakech/Morocco-desert-tour-from-Marrakech-3-days-including-camel-trek/d5408-64126P9";

export default function ActivityDetailPage() {
  const { t, i18n } = useTranslation();
  const { slug: slugParam } = useParams<{ slug: string }>();
  const isNumericActivityRoute = slugParam != null && /^\d+$/.test(slugParam);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get date-fns locale based on current language
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'fr': return fr;
      case 'es': return es;
      case 'de': return de;
      default: return enUS;
    }
  };
  
  // Translate difficulty level
  const translateDifficulty = (level: string | undefined) => {
    if (!level) return '';
    const levelUpper = level.toUpperCase();
    switch (levelUpper) {
      case 'EASY': return t('activities.detail.difficultyEasy');
      case 'MODERATE': return t('activities.detail.difficultyModerate');
      case 'HARD': return t('activities.detail.difficultyHard');
      case 'EXTREME': return t('activities.detail.difficultyExtreme');
      default: return level;
    }
  };
  
  const [travelDate, setTravelDate] = useState<Date | undefined>(undefined);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [specialRequest, setSpecialRequest] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedTourType, setSelectedTourType] = useState<'private' | 'shared'>('shared');
  const [comfortLevel, setComfortLevel] = useState<'standard' | 'luxury'>('standard');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  
  // Autoplay plugin for carousel
  const autoplayPlugin = useCallback(
    () =>
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    []
  );

  const { data: activity, isLoading, error } = useQuery({
    queryKey: ['activity', slugParam, i18n.language],
    queryFn: () =>
      isNumericActivityRoute
        ? publicApi.getActivityById(Number(slugParam), i18n.language)
        : publicApi.getActivityBySlug(slugParam!, i18n.language),
    enabled: !!slugParam,
  });

  const mapEmbedUrl = useMemo(
    () => (activity?.mapUrl ? normalizeGoogleMapsEmbedUrl(activity.mapUrl) : ""),
    [activity?.mapUrl]
  );

  const needsEmbedResolve = Boolean(
    activity?.mapUrl &&
      !isGoogleMapsEmbedUrl(activity.mapUrl) &&
      shouldTryResolveMapUrl(activity.mapUrl),
  );

  const { data: mapResolve, isLoading: mapResolveLoading } = useQuery({
    queryKey: ["map-embed-resolve", activity?.mapUrl],
    queryFn: () => publicApi.getMapEmbedUrl(activity!.mapUrl!),
    enabled:
      !!activity?.mapUrl &&
      !isGoogleMapsEmbedUrl(activity.mapUrl) &&
      shouldTryResolveMapUrl(activity.mapUrl),
    staleTime: 60 * 60 * 1000,
  });

  const iframeMapSrc = useMemo(() => {
    if (!activity?.mapUrl) return "";
    if (mapEmbedUrl && isGoogleMapsEmbedUrl(activity.mapUrl)) return mapEmbedUrl;
    return mapResolve?.embedUrl || "";
  }, [activity?.mapUrl, mapEmbedUrl, mapResolve?.embedUrl]);

  const openMapPageHref = useMemo(() => {
    if (!activity?.mapUrl) return "";
    if (mapEmbedUrl && isGoogleMapsEmbedUrl(activity.mapUrl)) {
      return mapEmbedUrl.replace("/maps/embed", "/maps");
    }
    if (mapResolve?.resolvedUrl) return mapResolve.resolvedUrl;
    return normalizeGoogleMapsEmbedUrl(activity.mapUrl) || activity.mapUrl;
  }, [activity?.mapUrl, mapEmbedUrl, mapResolve?.resolvedUrl]);

  const { data: reviewsPage, isLoading: reviewsLoading } = useQuery({
    queryKey: ['activity-reviews', activity?.id],
    queryFn: () => publicApi.getActivityReviews(activity!.id, 0, 50),
    enabled: !!activity?.id,
  });

  const reviewMutation = useMutation({
    mutationFn: () => {
      if (!activity) throw new Error("No activity");
      return api.createReview({
        activityId: activity.id,
        rating: reviewRating,
        comment: reviewComment,
      });
    },
    onSuccess: () => {
      toast({
        title: t("activities.detail.reviewSubmittedTitle"),
        description: t("activities.detail.reviewSubmittedDesc"),
      });
      setReviewComment("");
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ["activity-reviews", activity?.id] });
      queryClient.invalidateQueries({ queryKey: ["activity", slugParam, i18n.language] });
      queryClient.invalidateQueries({ queryKey: ["homeRecentReviews"] });
    },
    onError: (e: Error) => {
      toast({
        title: t("activities.detail.reviewFailed"),
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const reviewerDisplayName = (u: ActivityReview["user"]) => {
    const fn = u?.firstName?.trim() ?? "";
    const ln = u?.lastName?.trim() ?? "";
    const name = [fn, ln].filter(Boolean).join(" ");
    return name || t("activities.detail.reviewAnonymous");
  };


  const bookingMutation = useMutation({
    mutationFn: async (data: {
      activityId: number;
      travelDate: string;
      numberOfPeople: number;
      specialRequest?: string;
      tourType?: string;
      comfortLevel?: string;
    }) => {
      return api.createBooking(data);
    },
    onSuccess: () => {
      toast({
        title: t('activities.detail.bookingSuccessful'),
        description: t('activities.detail.bookingConfirmed'),
      });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
      setTravelDate(undefined);
      setSpecialRequest("");
    },
    onError: (error: Error) => {
      toast({
        title: t('activities.detail.bookingFailed'),
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsBooking(false);
    },
  });

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(`/activities/${slugParam}`));
      return;
    }

    if (!travelDate) {
      toast({
        title: t('activities.detail.dateRequired'),
        description: t('activities.detail.pleaseSelectDate'),
        variant: "destructive",
      });
      return;
    }

    if (!activity) return;

    if (activity.maxGroupSize && numberOfPeople > activity.maxGroupSize) {
      toast({
        title: t('activities.detail.groupSizeExceeded'),
        description: t('activities.detail.maximumGroupSize', { max: activity.maxGroupSize }),
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    bookingMutation.mutate({
      activityId: activity.id,
      travelDate: format(travelDate, 'yyyy-MM-dd'),
      numberOfPeople,
      specialRequest: specialRequest || undefined,
      tourType: selectedTourType,
      comfortLevel,
    });
  };

  // Get the current price based on both tour type and comfort level
  // This calculation is reactive and will update when selectedTourType or comfortLevel changes
  const basePrice = activity ? Number(activity.price) : 0;
  const premiumPrice = activity?.premiumPrice ? Number(activity.premiumPrice) : basePrice * 1.6;
  const budgetPrice = activity?.budgetPrice ? Number(activity.budgetPrice) : basePrice;
  
  // Calculate price based on tour type and comfort level
  // Private tours add 30% to the base price
  // Luxury adds additional premium on top of that
  let currentPrice: number;
  
  if (selectedTourType === 'private') {
    // Private tours: base price + 30% private premium
    if (comfortLevel === 'luxury') {
      // Private + Luxury: premium price with 30% private multiplier
      // This ensures Private + Luxury is more expensive than Private + Standard
      currentPrice = premiumPrice * 1.3;
    } else {
      // Private + Standard: budget price with 30% private multiplier
      currentPrice = budgetPrice * 1.3;
    }
  } else {
    // Shared tours: no private multiplier
    if (comfortLevel === 'luxury') {
      // Shared + Luxury: premium price (no private multiplier)
      currentPrice = premiumPrice;
    } else {
      // Shared + Standard: budget price (no private multiplier)
      currentPrice = budgetPrice;
    }
  }
  
  const totalPrice = currentPrice * numberOfPeople;
  
  const allImages = useMemo(() => {
    if (!activity) return [];
    const raw = [
      ...(activity.imageUrl ? [activity.imageUrl] : []),
      ...(activity.galleryImages || []),
    ];
    const seen = new Set<string>();
    return raw.filter((u) => {
      if (!u || seen.has(u)) return false;
      seen.add(u);
      return true;
    });
  }, [activity]);

  useEffect(() => {
    if (!carouselApi) return;
    setCurrent(carouselApi.selectedScrollSnap());
    const onSelect = () => setCurrent(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (carouselApi && allImages.length > 0) {
      const t = window.setTimeout(() => carouselApi.reInit(), 100);
      return () => window.clearTimeout(t);
    }
  }, [carouselApi, allImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen || allImages.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = lightboxIndex > 0 ? lightboxIndex - 1 : allImages.length - 1;
        setLightboxIndex(prevIndex);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = lightboxIndex < allImages.length - 1 ? lightboxIndex + 1 : 0;
        setLightboxIndex(nextIndex);
      } else if (e.key === "Escape") {
        setLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, lightboxIndex, allImages.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{t('activities.detail.loading')}</p>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">{t('activities.detail.notFound')}</h1>
        <p className="text-muted-foreground mb-4">{t('activities.detail.error')}: {error ? String(error) : t('activities.detail.activityNotFound')}</p>
        <Link to="/activities"><Button>{t('activities.detail.backToActivities')}</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Image Carousel */}
      <div className="relative w-full">
        {/* Breadcrumb Overlay */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/70 via-black/40 to-transparent pt-5 pb-12">
          <div className="container mx-auto px-4">
            <Link to="/activities" className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors backdrop-blur-sm bg-black/20 px-4 py-2 rounded-lg">
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm font-medium">{t('activities.detail.backToActivities')}</span>
            </Link>
          </div>
        </div>

        {/* Image Carousel - Modern Style with Autoplay */}
        {allImages.length > 0 ? (
          <div className="relative mx-auto mt-14 w-full max-w-none px-2 sm:px-4 lg:px-6 sm:mt-16">
            <div className="group overflow-hidden rounded-2xl border border-border/50 bg-neutral-950 shadow-md">
              <div className="relative h-[280px] w-full sm:h-[340px] md:h-[400px] lg:h-[460px]">
                <Carousel
                  setApi={setCarouselApi}
                  opts={{
                    align: "start",
                    loop: true,
                    duration: 35,
                  }}
                  plugins={[autoplayPlugin()]}
                  className="absolute inset-0 h-full w-full"
                >
                  <CarouselContent className="h-full min-h-0 -ml-0">
                    {allImages.map((img, index) => {
                      const imageUrl = getImageUrl(img);
                      return (
                        <CarouselItem
                          key={`carousel-item-${index}`}
                          className="flex h-full min-h-0 min-w-0 basis-full pl-0"
                        >
                          <div
                            className="relative flex h-full min-h-0 w-full min-w-0 cursor-pointer items-center justify-center overflow-hidden bg-neutral-950"
                            onClick={() => openLightbox(index)}
                          >
                            <img
                              src={imageUrl}
                              alt=""
                              aria-hidden
                              className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-125 object-cover opacity-[0.65] blur-2xl saturate-110 sm:blur-3xl"
                              loading={index === 0 ? "eager" : "lazy"}
                            />
                            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-transparent to-black/45" />

                            <img
                              src={imageUrl}
                              alt={`${activity.title} - ${t('activities.detail.image')} ${index + 1}`}
                              className="relative z-10 max-h-full max-w-full object-contain object-center drop-shadow-md"
                              loading={index === 0 ? "eager" : "lazy"}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (img && (img.startsWith("http://") || img.startsWith("https://"))) {
                                  if (target.src !== img) {
                                    target.src = img;
                                    return;
                                  }
                                }
                                if (!target.src.includes("placeholder.svg") && !target.src.includes("data:")) {
                                  target.src = "/placeholder.svg";
                                }
                              }}
                            />
                            <div className="pointer-events-none absolute inset-0 z-[11] bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

                            <div className="absolute right-3 top-3 z-20 flex items-center gap-2 sm:right-4 sm:top-4">
                              {allImages.length > 1 && (
                                <div className="rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                  <span>{current + 1}</span>
                                  <span className="mx-1 text-white/55">/</span>
                                  <span className="text-white/90">{allImages.length}</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openLightbox(index);
                                }}
                                className="rounded-full border border-white/25 bg-black/45 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
                                aria-label={t("activities.detail.viewFullscreen")}
                              >
                                <ZoomIn className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>

                  {allImages.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2 h-9 w-9 border-0 bg-black/45 text-white shadow-md backdrop-blur-sm transition-opacity hover:bg-black/60 hover:text-white sm:left-3 sm:h-10 sm:w-10 md:opacity-0 md:group-hover:opacity-100 !top-1/2 !-translate-y-1/2" />
                      <CarouselNext className="right-2 h-9 w-9 border-0 bg-black/45 text-white shadow-md backdrop-blur-sm transition-opacity hover:bg-black/60 hover:text-white sm:right-3 sm:h-10 sm:w-10 md:opacity-0 md:group-hover:opacity-100 !top-1/2 !-translate-y-1/2" />
                    </>
                  )}
                </Carousel>
              </div>
            </div>

            {allImages.length > 1 && (
              <div
                className="mt-3 flex justify-center gap-1.5"
                role="tablist"
                aria-label={t("activities.detail.image")}
              >
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={current === i}
                    className={cn(
                      "h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      current === i
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-muted-foreground/35 hover:bg-muted-foreground/55",
                    )}
                    onClick={() => carouselApi?.scrollTo(i)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative mx-auto mt-14 flex w-full max-w-none items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-16 sm:mt-16">
            <p className="text-center text-muted-foreground">{t("activities.detail.noImagesAvailable")}</p>
          </div>
        )}
      </div>

      {/* Enhanced Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[95vw] w-full h-[95vh] p-0 bg-black/98 border-0 [&>button]:hidden overflow-hidden"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">
            {t("activities.detail.lightboxTitle", { title: activity.title })}
          </DialogTitle>
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-neutral-950">
            {/* Ambient fill behind letterboxed image */}
            <img
              src={getImageUrl(allImages[lightboxIndex])}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-125 object-cover opacity-[0.55] blur-2xl saturate-110 sm:blur-3xl"
            />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/25 to-black/55" />

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 z-50 text-white hover:bg-white/20 h-12 w-12 rounded-full backdrop-blur-md bg-black/40 border border-white/20 transition-all hover:scale-110"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-14 w-14 rounded-full backdrop-blur-md bg-black/40 border border-white/20 transition-all hover:scale-110 shadow-xl"
                  onClick={() => {
                    const prevIndex = lightboxIndex > 0 ? lightboxIndex - 1 : allImages.length - 1;
                    setLightboxIndex(prevIndex);
                  }}
                >
                  <ChevronLeft className="h-7 w-7" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-14 w-14 rounded-full backdrop-blur-md bg-black/40 border border-white/20 transition-all hover:scale-110 shadow-xl"
                  onClick={() => {
                    const nextIndex = lightboxIndex < allImages.length - 1 ? lightboxIndex + 1 : 0;
                    setLightboxIndex(nextIndex);
                  }}
                >
                  <ChevronLeft className="h-7 w-7 rotate-180" />
                </Button>
              </>
            )}

            {/* Main Image */}
            <div className="relative z-10 flex h-full w-full items-center justify-center p-6 sm:p-8">
              <img 
                src={getImageUrl(allImages[lightboxIndex])} 
                alt={`${activity.title} - ${t('activities.detail.image')} ${lightboxIndex + 1}`} 
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
              />
            </div>

            {/* Image Counter & Thumbnails */}
            {allImages.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 via-black/70 to-transparent pb-8 pt-16">
                <div className="container mx-auto px-4">
                  {/* Counter */}
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20">
                      <span className="font-semibold">{lightboxIndex + 1}</span>
                      <span className="text-white/60">/</span>
                      <span className="text-white/80">{allImages.length}</span>
                    </div>
                  </div>
                  
                  {/* Thumbnail Strip */}
                  <div className="flex gap-3 overflow-x-auto max-w-full pb-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] justify-center">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setLightboxIndex(index)}
                        className={`relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-black transition-all duration-300 hover:scale-110 ${
                          lightboxIndex === index
                            ? "border-white shadow-2xl scale-110 ring-4 ring-white/30"
                            : "border-white/40 hover:border-white/70 opacity-60 hover:opacity-100"
                        }`}
                        style={{
                          width: lightboxIndex === index ? '72px' : '56px',
                          height: lightboxIndex === index ? '72px' : '56px',
                        }}
                      >
                        <img 
                          src={getImageUrl(img)} 
                          alt={`${t('activities.detail.thumbnail')} ${index + 1}`} 
                          className="max-h-full max-w-full object-contain"
                        />
                        {lightboxIndex === index && (
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header Section */}
            <FadeInSection>
              <div className="space-y-5">
                <div className="flex items-center gap-3 flex-wrap">
                  {activity.category && (
                    <span className="px-4 py-2 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
                      {activity.category}
                    </span>
                  )}
                  {activity.featured && (
                    <span className="px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary border border-secondary/30 flex items-center gap-2 backdrop-blur-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      {t('activities.featured')}
                    </span>
                  )}
                </div>
                
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
                  {activity.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  {activity.destination?.name && (
                    <span className="flex items-center gap-2 text-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      {activity.destination.slug ? (
                        <Link
                          to={`/destinations/${activity.destination.slug}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {activity.destination.name}
                        </Link>
                      ) : (
                        <span className="font-medium">{activity.destination.name}</span>
                      )}
                      {activity.destination.country && (
                        <span className="text-muted-foreground">, {activity.destination.country}</span>
                      )}
                    </span>
                  )}
                  {activity.duration && (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{activity.duration}</span>
                    </span>
                  )}
                  {activity.difficultyLevel && (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-4 w-4 text-primary" />
                      <span>{translateDifficulty(activity.difficultyLevel)}</span>
                    </span>
                  )}
                  {activity.ratingAverage && (
                    <span className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                      <span className="font-semibold">{activity.ratingAverage.toFixed(1)}</span>
                      <span className="text-muted-foreground">({activity.reviewCount || 0} {t('activities.reviews')})</span>
                    </span>
                  )}
                </div>
              </div>
            </FadeInSection>

            {/* Quick Info Cards - Enhanced */}
            <FadeInSection>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {activity.duration && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">{t('activities.duration')}</p>
                    <p className="font-bold text-base">{activity.duration}</p>
                  </div>
                )}
                {activity.difficultyLevel && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">{t('activities.detail.difficulty')}</p>
                    <p className="font-bold text-base">{translateDifficulty(activity.difficultyLevel)}</p>
                  </div>
                )}
                {activity.maxGroupSize && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">{t('activities.detail.maxGroup')}</p>
                    <p className="font-bold text-base">{activity.maxGroupSize} {t('activities.detail.people')}</p>
                  </div>
                )}
                {activity.ratingAverage && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Star className="h-6 w-6 text-primary fill-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">{t('activities.rating')}</p>
                    <p className="font-bold text-base">{activity.ratingAverage.toFixed(1)} / 5.0</p>
                  </div>
                )}
              </div>
            </FadeInSection>

            {/* Description */}
            {activity.fullDescription && (
              <FadeInSection>
                <div className="space-y-4">
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold">{t('activities.detail.aboutActivity')}</h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                      {activity.fullDescription}
                    </p>
                  </div>
                </div>
              </FadeInSection>
            )}

            {/* What to Expect */}
            {activity.whatToExpect && (
              <FadeInSection>
                <div className="space-y-4">
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold">{t('activities.detail.whatToExpect')}</h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                      {activity.whatToExpect}
                    </p>
                  </div>
                </div>
              </FadeInSection>
            )}

            {/* What's Included - Enhanced */}
            {(activity.complementaries && activity.complementaries.length > 0) && (
              <FadeInSection>
                <div className="space-y-5">
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Check className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    {t('activities.detail.whatsIncluded')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {activity.complementaries.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all group"
                      >
                        <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm text-foreground leading-relaxed pt-0.5">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>
            )}

            {/* Itinerary - Enhanced */}
            {activity.itinerary && activity.itinerary.length > 0 && (
              <FadeInSection>
                <div className="space-y-6">
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold">{t('activities.detail.itinerary')}</h2>
                  <div className="space-y-6">
                    {activity.itinerary.map((step, i) => (
                      <div key={i} className="flex gap-5">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center text-base font-bold border-2 border-primary/30 shadow-sm">
                            {i + 1}
                          </div>
                          {i < activity.itinerary!.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gradient-to-b from-border to-transparent mt-3" />
                          )}
                        </div>
                        <div className="flex-1 pb-6 pt-1">
                          <p className="text-base text-foreground leading-relaxed">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>
            )}

            {/* Traveler reviews */}
            <FadeInSection>
              <div className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold flex items-center gap-2">
                      <Star className="h-7 w-7 text-secondary fill-secondary shrink-0" />
                      {t("activities.detail.reviewsTitle")}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{t("activities.detail.reviewsSubtitle")}</p>
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-5 sm:p-6 space-y-4">
                    <h3 className="font-semibold text-foreground">{t("activities.detail.writeReview")}</h3>
                    <p className="text-xs text-muted-foreground">{t("activities.detail.reviewModerationHint")}</p>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t("activities.detail.yourRating")}</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={t("activities.detail.rateStars", { count: star })}
                          >
                            <Star
                              className={cn(
                                "h-9 w-9 sm:h-8 sm:w-8",
                                star <= reviewRating
                                  ? "fill-secondary text-secondary"
                                  : "text-muted-foreground/35",
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review-comment" className="text-sm font-medium">
                        {t("activities.detail.yourComment")}
                      </Label>
                      <Textarea
                        id="review-comment"
                        rows={4}
                        maxLength={2000}
                        placeholder={t("activities.detail.reviewCommentPlaceholder")}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="resize-none border-border/50"
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full sm:w-auto"
                      disabled={reviewMutation.isPending}
                      onClick={() => reviewMutation.mutate()}
                    >
                      {reviewMutation.isPending
                        ? t("activities.detail.reviewSubmitting")
                        : t("activities.detail.submitReview")}
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-5 py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">{t("activities.detail.signInToReview")}</p>
                    <Button asChild variant="default" size="sm">
                      <Link to={`/login?redirect=${encodeURIComponent(`/activities/${slugParam}`)}`}>
                        {t("header.signIn")}
                      </Link>
                    </Button>
                  </div>
                )}

                <div className="space-y-4">
                  {reviewsLoading ? (
                    <p className="text-sm text-muted-foreground py-6">{t("activities.detail.reviewsLoading")}</p>
                  ) : (reviewsPage?.content?.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 border border-dashed border-border/50 rounded-xl px-4 text-center">
                      {t("activities.detail.reviewsEmpty")}
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {reviewsPage!.content.map((rev: ActivityReview) => (
                        <li
                          key={rev.id}
                          className="rounded-2xl border border-border/50 bg-card/80 p-4 sm:p-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="font-semibold text-foreground">{reviewerDisplayName(rev.user)}</span>
                            <div className="flex items-center gap-0.5" aria-hidden>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-4 w-4",
                                    i < rev.rating ? "fill-secondary text-secondary" : "text-muted-foreground/25",
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          {rev.comment ? (
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                              {rev.comment}
                            </p>
                          ) : null}
                          <p className="text-xs text-muted-foreground mt-3">
                            {rev.createdAt
                              ? format(new Date(rev.createdAt), "PP", { locale: getDateLocale() })
                              : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </FadeInSection>

            {/* Location - Enhanced */}
            <FadeInSection>
              <div className="space-y-5">
                <h2 className="font-display text-2xl sm:text-3xl font-semibold">{t('activities.detail.location')}</h2>
                <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border border-border/50 relative overflow-hidden shadow-inner">
                  {activity.mapUrl ? (
                    <div className="relative w-full h-full">
                      {needsEmbedResolve &&
                      mapResolveLoading &&
                      !(mapEmbedUrl && isGoogleMapsEmbedUrl(activity.mapUrl)) ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-muted/80">
                          <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
                          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                        </div>
                      ) : iframeMapSrc ? (
                        <>
                          <iframe
                            src={iframeMapSrc}
                            className="absolute inset-0 w-full h-full rounded-2xl"
                            allowFullScreen
                            loading="lazy"
                            title={t('activities.detail.mapView')}
                            style={{ border: 'none' }}
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                          {/* Overlay button to open in new window */}
                          <div className="absolute bottom-4 right-4">
                            <Button
                              onClick={() => {
                                window.open(openMapPageHref, '_blank', 'noopener,noreferrer');
                              }}
                              size="sm"
                              variant="secondary"
                              className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              {t('activities.detail.openMap')}
                            </Button>
                          </div>
                        </>
                      ) : (
                        /* Fallback for short URLs or non-embed URLs - show card with button */
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5">
                          <div className="bg-card/95 backdrop-blur-sm rounded-xl p-8 shadow-xl text-center max-w-lg w-full border border-border/50">
                            <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
                            <p className="font-display text-xl font-semibold mb-2 text-foreground">
                              {t('activities.detail.mapView')}
                            </p>
                            {activity.location && (
                              <p className="text-base text-muted-foreground mb-2">{activity.location}</p>
                            )}
                            {activity.destination?.name && (
                              <p className="text-sm text-muted-foreground mb-6">
                                {activity.destination.slug ? (
                                  <Link
                                    to={`/destinations/${activity.destination.slug}`}
                                    className="hover:text-primary hover:underline"
                                  >
                                    {activity.destination.name}
                                  </Link>
                                ) : (
                                  activity.destination.name
                                )}
                              </p>
                            )}
                            <Button
                              onClick={() =>
                                window.open(openMapPageHref || activity.mapUrl, '_blank', 'noopener,noreferrer')
                              }
                              className="w-full sm:w-auto"
                              size="lg"
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              {t('activities.detail.openMapInNewWindow')}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-3">
                              {t('activities.detail.mapClickHint')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-16 w-16 mx-auto mb-4 opacity-40" />
                      <p className="text-base font-medium">{t('activities.detail.mapView')}</p>
                      {activity.location && <p className="text-sm mt-2">{activity.location}</p>}
                      {activity.destination?.name && (
                        <p className="text-sm">
                          {activity.destination.slug ? (
                            <Link
                              to={`/destinations/${activity.destination.slug}`}
                              className="hover:text-primary hover:underline"
                            >
                              {activity.destination.name}
                            </Link>
                          ) : (
                            activity.destination.name
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {(activity.departureLocation || activity.meetingTime) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {activity.departureLocation && (
                      <div className="p-5 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">{t('activities.detail.departureLocation')}</p>
                        <p className="font-semibold text-base">{activity.departureLocation}</p>
                      </div>
                    )}
                    {activity.meetingTime && (
                      <div className="p-5 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">{t('activities.detail.meetingTime')}</p>
                        <p className="font-semibold text-base">{activity.meetingTime}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </FadeInSection>
          </div>

          {/* Sticky Booking Card - Fixed */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
              <FadeInSection>
                <div className="rounded-2xl bg-card border border-border/50 overflow-hidden shadow-xl flex flex-col" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
                  <div className="p-4 border-b border-border/50 shrink-0">
                    <a
                      href={VIATOR_BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#592D84] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4a2470] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#592D84]"
                    >
                      <Ticket className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
                      <span>{t("activities.detail.bookOnViator")}</span>
                    </a>
                  </div>
                  {/* Price Header */}
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
                    <div className="text-center">
                      {/* Tour Type Selector */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Button
                          variant={selectedTourType === 'shared' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTourType('shared')}
                          className={`rounded-full px-4 py-2 transition-all duration-200 ${
                            selectedTourType === 'shared'
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <Users className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs font-medium">Shared</span>
                        </Button>
                        <Button
                          variant={selectedTourType === 'private' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTourType('private')}
                          className={`rounded-full px-4 py-2 transition-all duration-200 ${
                            selectedTourType === 'private'
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md hover:from-amber-600 hover:to-yellow-600'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs font-medium">Private</span>
                        </Button>
                      </div>
                      
                      {/* Comfort Level Selector */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Button
                          variant={comfortLevel === 'standard' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setComfortLevel('standard')}
                          className={`rounded-full px-4 py-2 transition-all duration-200 ${
                            comfortLevel === 'standard'
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <Home className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs font-medium">Standard Comfort</span>
                        </Button>
                        <Button
                          variant={comfortLevel === 'luxury' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setComfortLevel('luxury')}
                          className={`rounded-full px-4 py-2 transition-all duration-200 ${
                            comfortLevel === 'luxury'
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md hover:from-amber-600 hover:to-yellow-600'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <Crown className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs font-medium">Luxury Experience</span>
                        </Button>
                      </div>
                      
                      <div className="flex items-baseline justify-center gap-2 mb-3">
                        <span className="text-4xl sm:text-5xl font-bold text-primary">{formatPrice(currentPrice)}</span>
                        <span className="text-sm sm:text-base text-muted-foreground">{t('activities.detail.perPerson')}</span>
                      </div>
                      {comfortLevel === 'standard' && budgetPrice < premiumPrice && (
                        <p className="text-xs text-muted-foreground mb-2 text-center">
                          <span className="text-primary font-semibold">
                            Upgrade to Luxury for {formatPrice(
                              selectedTourType === 'private' 
                                ? (premiumPrice * 1.3) - (budgetPrice * 1.3)
                                : premiumPrice - budgetPrice
                            )} more
                          </span>
                        </p>
                      )}
                      {comfortLevel === 'luxury' && budgetPrice < premiumPrice && (
                        <p className="text-xs text-muted-foreground mb-2 text-center">
                          <span className="line-through text-muted-foreground">
                            {formatPrice(selectedTourType === 'private' ? budgetPrice * 1.3 : budgetPrice)}
                          </span>
                          <span className="ml-2 text-primary font-semibold">Luxury Experience</span>
                        </p>
                      )}
                      {activity.ratingAverage && (
                        <div className="flex items-center justify-center gap-1.5 text-sm">
                          <Star className="h-4 w-4 fill-secondary text-secondary" />
                          <span className="font-semibold">{activity.ratingAverage.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({activity.reviewCount || 0} {t('activities.reviews')})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Form */}
                  <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
                    {/* Travel Date */}
                    <div className="space-y-2.5">
                      <Label htmlFor="date" className="text-sm font-semibold">
                        {t('activities.detail.selectTravelDate')}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-11 border-border/50 hover:border-primary/50"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {travelDate ? (
                              format(travelDate, "PPP", { locale: getDateLocale() })
                            ) : (
                              <span className="text-muted-foreground">{t('activities.detail.pickDate')}</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={travelDate}
                            onSelect={setTravelDate}
                            disabled={(date) => startOfDay(date) < startOfDay(new Date())}
                            initialFocus
                            locale={getDateLocale()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Number of People */}
                    <div className="space-y-2.5">
                      <Label htmlFor="people" className="text-sm font-semibold">
                        {t('activities.detail.numberOfPeople')}
                      </Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 border-border/50 hover:border-primary/50"
                          onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                          disabled={numberOfPeople <= 1}
                        >
                          -
                        </Button>
                        <Input
                          id="people"
                          type="number"
                          min="1"
                          max={activity.maxGroupSize || 10}
                          value={numberOfPeople}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") return;
                            const value = Number.parseInt(raw, 10);
                            if (!Number.isFinite(value)) return;
                            const max = activity.maxGroupSize || 10;
                            setNumberOfPeople(Math.min(Math.max(1, value), max));
                          }}
                          className="text-center font-semibold h-11 border-border/50"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 border-border/50 hover:border-primary/50"
                          onClick={() => {
                            const max = activity.maxGroupSize || 10;
                            setNumberOfPeople(Math.min(max, numberOfPeople + 1));
                          }}
                          disabled={numberOfPeople >= (activity.maxGroupSize || 10)}
                        >
                          +
                        </Button>
                      </div>
                      {activity.maxGroupSize && (
                        <p className="text-xs text-muted-foreground">
                          {t('activities.detail.maximumPeople', { max: activity.maxGroupSize })}
                        </p>
                      )}
                    </div>

                    {/* Special Request */}
                    <div className="space-y-2.5">
                      <Label htmlFor="request" className="text-sm font-semibold">
                        {t('activities.detail.specialRequests')}
                      </Label>
                      <Textarea
                        id="request"
                        placeholder={t('activities.detail.specialRequestPlaceholder')}
                        value={specialRequest}
                        onChange={(e) => setSpecialRequest(e.target.value)}
                        rows={3}
                        className="resize-none border-border/50"
                      />
                    </div>

                    {/* Price Summary */}
                    <div className="space-y-3 pt-4 border-t border-border/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {formatPrice(currentPrice)} × {numberOfPeople} {numberOfPeople === 1 ? t('activities.detail.person') : t('activities.detail.people')}
                          <span className="ml-2 text-xs">
                            ({comfortLevel === 'luxury' ? 'Luxury Experience' : 'Standard Comfort'})
                          </span>
                        </span>
                        <span className="font-semibold">{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-3 border-t border-border/50">
                        <span>{t('activities.detail.total')}</span>
                        <span className="text-primary text-xl">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>

                    {/* Reserve Button */}
                    <Button
                      className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
                      size="lg"
                      onClick={handleBooking}
                      disabled={isBooking || !travelDate}
                    >
                      {isBooking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          {t('activities.detail.processing')}
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          {t('activities.detail.reserveNow')}
                        </>
                      )}
                    </Button>

                    {/* Trust Badges */}
                    <div className="flex items-center justify-center gap-6 pt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5" />
                        <span>{t('activities.detail.secureBooking')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{t('activities.detail.freeCancellation')}</span>
                      </div>
                    </div>

                    <p className="text-xs text-center text-muted-foreground pt-2">
                      {t('activities.detail.noPaymentRequired')}
                    </p>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
