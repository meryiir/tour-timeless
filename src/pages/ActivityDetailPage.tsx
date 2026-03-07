import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Clock, Activity, Check, X, Calendar, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActivityCard from "@/components/ActivityCard";
import FadeInSection from "@/components/FadeInSection";
import { activities, reviews } from "@/data/mockData";

export default function ActivityDetailPage() {
  const { id } = useParams();
  const activity = activities.find((a) => a.id === id);

  if (!activity) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Activity Not Found</h1>
        <Link to="/activities"><Button>Back to Activities</Button></Link>
      </div>
    );
  }

  const activityReviews = reviews.filter((r) => r.activityId === activity.id && r.status === "approved");
  const relatedActivities = activities.filter((a) => a.id !== activity.id && a.category === activity.category).slice(0, 3);
  const [mainImage, ...otherImages] = activity.images;

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
        <FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10 rounded-xl overflow-hidden">
            <div className="md:col-span-2 aspect-[16/10] overflow-hidden">
              <img src={mainImage} alt={activity.title} className="w-full h-full object-cover img-zoom" />
            </div>
            <div className="grid grid-rows-2 gap-3">
              {otherImages.map((img, i) => (
                <div key={i} className="overflow-hidden aspect-[16/10]">
                  <img src={img} alt="" className="w-full h-full object-cover img-zoom" />
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <FadeInSection>
              <div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">{activity.category}</span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-3">{activity.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{activity.destination}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{activity.duration}</span>
                  <span className="flex items-center gap-1"><Activity className="h-4 w-4" />{activity.difficulty}</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-secondary text-secondary" />{activity.rating} ({activity.reviewCount} reviews)</span>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection>
              <div>
                <h2 className="font-display text-xl font-semibold mb-3">About This Activity</h2>
                <p className="text-muted-foreground leading-relaxed">{activity.fullDescription}</p>
              </div>
            </FadeInSection>

            <FadeInSection>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2"><Check className="h-5 w-5 text-primary" />What's Included</h3>
                  <ul className="space-y-2">
                    {activity.included.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2"><X className="h-5 w-5 text-destructive" />Not Included</h3>
                  <ul className="space-y-2">
                    {activity.excluded.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <X className="h-4 w-4 text-destructive shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection>
              <div>
                <h2 className="font-display text-xl font-semibold mb-4">Itinerary</h2>
                <div className="space-y-4">
                  {activity.itinerary.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{step.time}</div>
                        {i < activity.itinerary.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                      </div>
                      <p className="text-sm text-muted-foreground pt-2.5">{step.activity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            {/* Map Placeholder */}
            <FadeInSection>
              <div>
                <h2 className="font-display text-xl font-semibold mb-4">Location</h2>
                <div className="aspect-[16/9] rounded-xl bg-muted flex items-center justify-center border border-border">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Map will be displayed here</p>
                    <p className="text-xs">{activity.destination}</p>
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* Reviews */}
            <FadeInSection>
              <div>
                <h2 className="font-display text-xl font-semibold mb-4">Reviews ({activityReviews.length})</h2>
                <div className="space-y-4">
                  {activityReviews.map((review) => (
                    <div key={review.id} className="p-5 rounded-xl bg-card shadow-card">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{review.avatar}</div>
                        <div>
                          <p className="font-semibold text-sm">{review.userName}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                        <div className="ml-auto flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, j) => (
                            <Star key={j} className="h-3.5 w-3.5 fill-secondary text-secondary" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                  {activityReviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{activity.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty</span>
                    <span className="font-medium">{activity.difficulty}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-medium flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-secondary text-secondary" />{activity.rating}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium mb-2">Available Dates</p>
                  <div className="flex flex-wrap gap-2">
                    {activity.availableDates.slice(0, 4).map((date) => (
                      <span key={date} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        <Calendar className="h-3 w-3" />{new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    ))}
                  </div>
                </div>

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
