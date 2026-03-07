import destination1 from "@/assets/destination-1.jpg";
import destination2 from "@/assets/destination-2.jpg";
import destination3 from "@/assets/destination-3.jpg";
import destination4 from "@/assets/destination-4.jpg";
import activity1 from "@/assets/activity-1.jpg";
import activity2 from "@/assets/activity-2.jpg";
import activity3 from "@/assets/activity-3.jpg";
import activity4 from "@/assets/activity-4.jpg";
import activity5 from "@/assets/activity-5.jpg";
import activity6 from "@/assets/activity-6.jpg";

export interface Activity {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  destination: string;
  destinationId: string;
  price: number;
  duration: string;
  rating: number;
  reviewCount: number;
  difficulty: "Easy" | "Moderate" | "Challenging" | "Expert";
  image: string;
  images: string[];
  featured: boolean;
  included: string[];
  excluded: string[];
  itinerary: { time: string; activity: string }[];
  availableDates: string[];
  status: "active" | "inactive";
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  activityCount: number;
  country: string;
}

export interface Review {
  id: string;
  activityId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  status: "approved" | "pending" | "rejected";
  avatar: string;
}

export interface Booking {
  id: string;
  activityId: string;
  activityTitle: string;
  userName: string;
  userEmail: string;
  date: string;
  guests: number;
  totalPrice: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "moderator";
  status: "active" | "suspended";
  joinedAt: string;
  bookingsCount: number;
  avatar: string;
}

export const destinations: Destination[] = [
  { id: "d1", name: "Santorini, Greece", description: "Iconic white-washed villages perched on cliffs above the deep blue Aegean Sea.", image: destination1, activityCount: 12, country: "Greece" },
  { id: "d2", name: "Bali, Indonesia", description: "Lush rice terraces, ancient temples, and vibrant culture in a tropical paradise.", image: destination2, activityCount: 18, country: "Indonesia" },
  { id: "d3", name: "Swiss Alps", description: "Majestic mountain peaks, crystal-clear lakes, and world-class adventure.", image: destination3, activityCount: 15, country: "Switzerland" },
  { id: "d4", name: "Dubai, UAE", description: "A dazzling city of luxury, innovation, and unforgettable desert experiences.", image: destination4, activityCount: 22, country: "UAE" },
];

export const activities: Activity[] = [
  {
    id: "a1", title: "Coral Reef Scuba Diving", shortDescription: "Explore vibrant coral reefs teeming with marine life in crystal-clear waters.", fullDescription: "Dive into the breathtaking underwater world of Bali's most pristine coral reefs. Guided by certified PADI instructors, you'll explore colorful coral gardens, encounter tropical fish, sea turtles, and manta rays. Perfect for both beginners and experienced divers, this unforgettable experience includes all equipment, boat transfers, and a gourmet lunch on the beach.",
    category: "Water Sports", destination: "Bali, Indonesia", destinationId: "d2", price: 149, duration: "4 hours", rating: 4.9, reviewCount: 234, difficulty: "Moderate", image: activity1, images: [activity1, activity2, activity3], featured: true, status: "active",
    included: ["Professional PADI guide", "All diving equipment", "Boat transfers", "Beachside lunch", "Underwater photos", "Insurance"],
    excluded: ["Hotel pickup", "Personal expenses", "Tips"],
    itinerary: [
      { time: "07:00", activity: "Hotel pickup and transfer to marina" },
      { time: "08:00", activity: "Safety briefing and equipment fitting" },
      { time: "09:00", activity: "First dive session - Coral Garden" },
      { time: "10:30", activity: "Surface interval and snacks" },
      { time: "11:00", activity: "Second dive session - Manta Point" },
      { time: "12:30", activity: "Beach lunch and free time" },
    ],
    availableDates: ["2026-03-15", "2026-03-18", "2026-03-22", "2026-03-25", "2026-04-01"],
  },
  {
    id: "a2", title: "Cappadocia Hot Air Balloon", shortDescription: "Soar above the fairy chimneys of Cappadocia at sunrise for a magical experience.", fullDescription: "Rise before dawn for the most iconic experience in Turkey. Float gently above the surreal landscape of Cappadocia as the first rays of sunlight paint the fairy chimneys, valleys, and rock formations in golden hues. Includes champagne breakfast upon landing and a personalized flight certificate.",
    category: "Adventure", destination: "Santorini, Greece", destinationId: "d1", price: 279, duration: "3 hours", rating: 4.8, reviewCount: 456, difficulty: "Easy", image: activity2, images: [activity2, activity1, activity4], featured: true, status: "active",
    included: ["Licensed pilot", "Champagne breakfast", "Flight certificate", "Insurance", "Hotel transfers"],
    excluded: ["Personal expenses", "Gratuities", "Souvenirs"],
    itinerary: [
      { time: "04:30", activity: "Hotel pickup" },
      { time: "05:15", activity: "Arrival at launch site and light breakfast" },
      { time: "05:45", activity: "Balloon inflation and safety briefing" },
      { time: "06:00", activity: "Sunrise flight over Cappadocia" },
      { time: "07:15", activity: "Landing and champagne celebration" },
    ],
    availableDates: ["2026-03-14", "2026-03-16", "2026-03-20", "2026-03-28"],
  },
  {
    id: "a3", title: "Alpine Mountain Trek", shortDescription: "Conquer breathtaking alpine trails with panoramic views of the Swiss peaks.", fullDescription: "Embark on an exhilarating guided trek through the most scenic trails of the Swiss Alps. Trek past wildflower meadows, alpine lakes, and dramatic cliff faces while your expert mountain guide shares stories of the region. Suitable for intermediate hikers seeking a challenging but rewarding day in nature.",
    category: "Hiking", destination: "Swiss Alps", destinationId: "d3", price: 189, duration: "8 hours", rating: 4.7, reviewCount: 178, difficulty: "Challenging", image: activity3, images: [activity3, activity5, activity6], featured: true, status: "active",
    included: ["Certified mountain guide", "Packed lunch", "Hiking poles", "First aid kit", "Trail maps"],
    excluded: ["Hiking boots", "Personal gear", "Travel insurance"],
    itinerary: [
      { time: "06:00", activity: "Meet at base camp" },
      { time: "06:30", activity: "Begin ascent - Forest trail" },
      { time: "09:00", activity: "Rest stop at Alpine lake" },
      { time: "10:00", activity: "Summit push" },
      { time: "12:00", activity: "Summit lunch with panoramic views" },
      { time: "13:00", activity: "Descent via alternate route" },
    ],
    availableDates: ["2026-04-01", "2026-04-05", "2026-04-12", "2026-04-19"],
  },
  {
    id: "a4", title: "Luxury Yacht Cruise", shortDescription: "Sail the turquoise Mediterranean aboard a private luxury yacht.", fullDescription: "Experience the ultimate in maritime luxury with a private yacht cruise along the stunning coastline. Enjoy gourmet dining prepared by an onboard chef, swim in secluded coves, and watch the sunset from the deck with champagne in hand. Available for couples, families, or groups.",
    category: "Luxury", destination: "Santorini, Greece", destinationId: "d1", price: 599, duration: "Full Day", rating: 5.0, reviewCount: 89, difficulty: "Easy", image: activity4, images: [activity4, activity1, activity2], featured: true, status: "active",
    included: ["Private yacht", "Captain and crew", "Gourmet meals", "Premium beverages", "Snorkeling gear", "Towels"],
    excluded: ["Marina fees", "Fuel surcharge", "Gratuities"],
    itinerary: [
      { time: "09:00", activity: "Board at marina" },
      { time: "09:30", activity: "Sail to first cove" },
      { time: "11:00", activity: "Swimming and snorkeling" },
      { time: "13:00", activity: "Gourmet lunch on deck" },
      { time: "15:00", activity: "Visit hidden beach" },
      { time: "17:30", activity: "Sunset sailing and return" },
    ],
    availableDates: ["2026-03-20", "2026-03-27", "2026-04-03", "2026-04-10"],
  },
  {
    id: "a5", title: "African Safari Adventure", shortDescription: "Witness the Big Five in their natural habitat on an unforgettable safari.", fullDescription: "Journey deep into the African savanna for a life-changing wildlife experience. Expert rangers will guide you through the vast plains to spot lions, elephants, leopards, buffalo, and rhinos. Includes bush breakfast, sundowner drinks, and an evening by the campfire under the stars.",
    category: "Wildlife", destination: "Dubai, UAE", destinationId: "d4", price: 449, duration: "2 Days", rating: 4.9, reviewCount: 312, difficulty: "Easy", image: activity5, images: [activity5, activity3, activity6], featured: false, status: "active",
    included: ["Expert ranger guide", "4x4 safari vehicle", "All meals", "Bush breakfast", "Sundowner drinks", "Camp accommodation"],
    excluded: ["International flights", "Visa fees", "Travel insurance", "Personal items"],
    itinerary: [
      { time: "05:30", activity: "Dawn game drive" },
      { time: "08:00", activity: "Bush breakfast" },
      { time: "10:00", activity: "Rest at camp" },
      { time: "15:00", activity: "Afternoon game drive" },
      { time: "18:00", activity: "Sundowner drinks" },
      { time: "19:30", activity: "Campfire dinner" },
    ],
    availableDates: ["2026-04-05", "2026-04-15", "2026-04-25", "2026-05-05"],
  },
  {
    id: "a6", title: "Italian Cooking Masterclass", shortDescription: "Learn to make authentic pasta and regional dishes from a local Italian chef.", fullDescription: "Step into a charming rustic kitchen in the Tuscan countryside and learn the art of Italian cooking from a passionate local chef. Make fresh pasta from scratch, prepare traditional sauces, and create a full Italian feast that you'll enjoy with local wines. A feast for all the senses.",
    category: "Cultural", destination: "Bali, Indonesia", destinationId: "d2", price: 129, duration: "5 hours", rating: 4.8, reviewCount: 198, difficulty: "Easy", image: activity6, images: [activity6, activity1, activity4], featured: false, status: "active",
    included: ["All ingredients", "Apron and recipe booklet", "Wine tasting", "Full lunch", "Certificate"],
    excluded: ["Transportation", "Additional wine bottles"],
    itinerary: [
      { time: "09:00", activity: "Welcome and market tour" },
      { time: "10:00", activity: "Introduction to Italian cuisine" },
      { time: "10:30", activity: "Pasta making workshop" },
      { time: "12:00", activity: "Sauce and main course preparation" },
      { time: "13:00", activity: "Enjoy your creations with wine" },
    ],
    availableDates: ["2026-03-12", "2026-03-19", "2026-03-26", "2026-04-02"],
  },
];

export const reviews: Review[] = [
  { id: "r1", activityId: "a1", userName: "Sarah Mitchell", rating: 5, comment: "Absolutely incredible experience! The coral reefs were stunning and our guide was phenomenal.", date: "2026-02-15", status: "approved", avatar: "SM" },
  { id: "r2", activityId: "a1", userName: "James Rodriguez", rating: 5, comment: "Best diving experience of my life. Crystal clear waters and amazing marine life.", date: "2026-02-10", status: "approved", avatar: "JR" },
  { id: "r3", activityId: "a2", userName: "Emily Chen", rating: 5, comment: "The sunrise from the balloon was the most magical moment of my trip. Worth every penny!", date: "2026-01-28", status: "approved", avatar: "EC" },
  { id: "r4", activityId: "a3", userName: "Michael Brown", rating: 4, comment: "Challenging but rewarding trek. The views from the summit were breathtaking.", date: "2026-02-05", status: "approved", avatar: "MB" },
  { id: "r5", activityId: "a4", userName: "Lisa Wang", rating: 5, comment: "Pure luxury! The crew was amazing and the food was world-class.", date: "2026-02-20", status: "pending", avatar: "LW" },
  { id: "r6", activityId: "a5", userName: "David Kim", rating: 5, comment: "Saw all Big Five! Our ranger was incredibly knowledgeable.", date: "2026-01-15", status: "approved", avatar: "DK" },
];

export const bookings: Booking[] = [
  { id: "b1", activityId: "a1", activityTitle: "Coral Reef Scuba Diving", userName: "Sarah Mitchell", userEmail: "sarah@email.com", date: "2026-03-15", guests: 2, totalPrice: 298, status: "confirmed", createdAt: "2026-02-28" },
  { id: "b2", activityId: "a2", activityTitle: "Cappadocia Hot Air Balloon", userName: "James Rodriguez", userEmail: "james@email.com", date: "2026-03-20", guests: 4, totalPrice: 1116, status: "pending", createdAt: "2026-03-01" },
  { id: "b3", activityId: "a4", activityTitle: "Luxury Yacht Cruise", userName: "Emily Chen", userEmail: "emily@email.com", date: "2026-03-27", guests: 6, totalPrice: 3594, status: "confirmed", createdAt: "2026-03-02" },
  { id: "b4", activityId: "a3", activityTitle: "Alpine Mountain Trek", userName: "Michael Brown", userEmail: "michael@email.com", date: "2026-04-01", guests: 1, totalPrice: 189, status: "completed", createdAt: "2026-02-15" },
  { id: "b5", activityId: "a5", activityTitle: "African Safari Adventure", userName: "Lisa Wang", userEmail: "lisa@email.com", date: "2026-04-05", guests: 2, totalPrice: 898, status: "cancelled", createdAt: "2026-02-20" },
];

export const users: User[] = [
  { id: "u1", name: "Sarah Mitchell", email: "sarah@email.com", role: "user", status: "active", joinedAt: "2025-06-15", bookingsCount: 3, avatar: "SM" },
  { id: "u2", name: "James Rodriguez", email: "james@email.com", role: "user", status: "active", joinedAt: "2025-08-22", bookingsCount: 5, avatar: "JR" },
  { id: "u3", name: "Emily Chen", email: "emily@email.com", role: "moderator", status: "active", joinedAt: "2025-04-10", bookingsCount: 8, avatar: "EC" },
  { id: "u4", name: "Michael Brown", email: "michael@email.com", role: "user", status: "suspended", joinedAt: "2025-09-01", bookingsCount: 1, avatar: "MB" },
  { id: "u5", name: "Admin User", email: "admin@wanderlust.com", role: "admin", status: "active", joinedAt: "2024-01-01", bookingsCount: 0, avatar: "AU" },
];

export const categories = ["Adventure", "Water Sports", "Hiking", "Luxury", "Cultural", "Wildlife", "Photography", "Food & Wine"];
