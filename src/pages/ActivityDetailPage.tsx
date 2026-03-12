import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Clock, Activity, Check, X, Calendar, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActivityCard from "@/components/ActivityCard";
import FadeInSection from "@/components/FadeInSection";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getImageUrl, type Activity as ApiActivity } from "@/lib/publicApi";

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: activity, isLoading, error } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => publicApi.getActivityById(Number(id)),
    enabled: !!id,
  });

  const { data: relatedActivitiesData } = useQuery({
    queryKey: ['relatedActivities', activity?.category],
    queryFn: () => publicApi.getActivities(0, 10),
    enabled: !!activity,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading activity...</p>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Activity Not Found</h1>
        <Link to="/activities"><Button>Back to Activities</Button></Link>
      </div>
    );
  }

  const relatedActivities = relatedActivitiesData?.content?.filter(
    (a) => a.id !== activity.id && a.category === activity.category
  ).slice(0, 3) || [];

  const allImages = activity.imageUrl 
    ? [activity.imageUrl, ...(activity.galleryImages || [])]
    : activity.galleryImages || [];
  const [mainImage, ...otherImages] = allImages;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <FadeInSection>
          <Link to="/activities" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ChevronLeft className="h-4 w-4" />Back to Activities
          </Link>
        </FadeInSection>

        {/* Image Gallery */}
        {mainImage && (
          <FadeInSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10 rounded-xl overflow-hidden">
              <div className="md:col-span-2 aspect-[16/10] overflow-hidden">
                <img src={getImageUrl(mainImage)} alt={activity.title} className="w-full h-full object-cover img-zoom" />
              </div>
              {otherImages.length > 0 && (
                <div className="grid grid-rows-2 gap-3">
                  {otherImages.slice(0, 2).map((img, i) => (
                    <div key={i} className="overflow-hidden aspect-[16/10]">
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover img-zoom" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeInSection>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <FadeInSection>
              <div>
                {activity.category && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">{activity.category}</span>
                )}
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-3">{activity.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {activity.destination?.name && (
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{activity.destination.name}</span>
                  )}
                  {activity.duration && (
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{activity.duration}</span>
                  )}
                  {activity.difficultyLevel && (
                    <span className="flex items-center gap-1"><Activity className="h-4 w-4" />{activity.difficultyLevel}</span>
                  )}
                  {activity.ratingAverage && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                      {activity.ratingAverage.toFixed(1)} ({activity.reviewCount || 0} reviews)
                    </span>
                  )}
                </div>
              </div>
            </FadeInSection>

            {activity.fullDescription && (
              <FadeInSection>
                <div>
                  <h2 className="font-display text-xl font-semibold mb-3">About This Activity</h2>
                  <p className="text-muted-foreground leading-relaxed">{activity.fullDescription}</p>
                </div>
              </FadeInSection>
            )}

            {activity.whatToExpect && (
              <FadeInSection>
                <div>
                  <h2 className="font-display text-xl font-semibold mb-3">What to Expect</h2>
                  <p className="text-muted-foreground leading-relaxed">{activity.whatToExpect}</p>
                </div>
              </FadeInSection>
            )}

            {(activity.complementaries && activity.complementaries.length > 0) && (
              <FadeInSection>
                <div>
                  <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />What's Included
                  </h3>
                  <ul className="space-y-2">
                    {activity.complementaries.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeInSection>
            )}

            {activity.itinerary && activity.itinerary.length > 0 && (
              <FadeInSection>
                <div>
                  <h2 className="font-display text-xl font-semibold mb-4">Itinerary</h2>
                  <div className="space-y-4">
                    {activity.itinerary.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          {i < activity.itinerary!.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                        </div>
                        <p className="text-sm text-muted-foreground pt-2.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>
            )}

            {/* Map Placeholder */}
            <FadeInSection>
              <div>
                <h2 className="font-display text-xl font-semibold mb-4">Location</h2>
                <div className="aspect-[16/9] rounded-xl bg-muted flex items-center justify-center border border-border">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Map will be displayed here</p>
                    {activity.location && <p className="text-xs">{activity.location}</p>}
                    {activity.destination?.name && <p className="text-xs">{activity.destination.name}</p>}
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <FadeInSection>
              <div className="sticky top-24 p-6 rounded-xl bg-card shadow-elevated border border-border">
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-primary">${activity.price}</span>
                  <span className="text-sm text-muted-foreground"> / person</span>
                </div>

                <div className="space-y-3 mb-6">
                  {activity.duration && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{activity.duration}</span>
                    </div>
                  )}
                  {activity.difficultyLevel && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty</span>
                      <span className="font-medium">{activity.difficultyLevel}</span>
                    </div>
                  )}
                  {activity.ratingAverage && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-medium flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                        {activity.ratingAverage.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {activity.departureLocation && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Departure</span>
                      <span className="font-medium">{activity.departureLocation}</span>
                    </div>
                  )}
                  {activity.meetingTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Meeting Time</span>
                      <span className="font-medium">{activity.meetingTime}</span>
                    </div>
                  )}
                  {activity.availability && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Availability</span>
                      <span className="font-medium">{activity.availability}</span>
                    </div>
                  )}
                </div>

                {activity.availableDates && activity.availableDates.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Available Dates</p>
                    <div className="flex flex-wrap gap-2">
                      {activity.availableDates.slice(0, 4).map((date, index) => (
                        <span key={index} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full" size="lg">Reserve Now</Button>
                <p className="text-xs text-center text-muted-foreground mt-3">No payment required to reserve</p>
              </div>
            </FadeInSection>
          </div>
        </div>

        {/* Related Activities */}
        {relatedActivities.length > 0 && (
          <FadeInSection className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedActivities.map((a) => <ActivityCard key={a.id} activity={a} />)}
            </div>
          </FadeInSection>
        )}
      </div>
    </div>
  );
}
