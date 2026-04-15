import { getApiBaseUrl, getBackendPublicOrigin } from "./apiBase";
import { normalizePublicSiteSettings, type PublicSiteSettings } from "./siteSettings";

const API_BASE_URL = getApiBaseUrl();

// Helper function to get current language
function getCurrentLanguage(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('i18nextLng') || 'en';
  }
  return 'en';
}

/**
 * Normalizes how upload paths are stored after DB imports / server changes:
 * - Absolute `http(s)://any-host/uploads/...` → `/uploads/...` so the current API origin serves files.
 * - `uploads/foo.jpg` or bare `uuid.jpg` (stored filename only) → `/uploads/...`
 * - Windows-style backslashes → slashes
 * External URLs (e.g. Unsplash) are left unchanged.
 */
function normalizeUploadReference(url: string): string {
  let s = url.trim().replace(/\\/g, "/");
  if (!s) return s;

  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      if (u.pathname.startsWith("/uploads")) {
        return `${u.pathname}${u.search}`;
      }
      return s;
    } catch {
      return s;
    }
  }

  if (s.startsWith("uploads/")) {
    return `/${s}`;
  }

  if (!s.startsWith("/") && !s.includes("..") && !s.includes("/")) {
    if (/^[a-zA-Z0-9_.-]+\.(jpe?g|png|gif|webp)$/i.test(s)) {
      return `/uploads/${s}`;
    }
  }

  return s;
}

// Helper function to get image URL
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return "/placeholder.svg";
  const resolved = normalizeUploadReference(url.trim());
  if (resolved.startsWith("http://") || resolved.startsWith("https://")) return resolved;
  const origin = getBackendPublicOrigin();
  const path = resolved.startsWith("/") ? resolved : `/${resolved}`;
  return origin ? `${origin}${path}` : path;
}

// Types from API
export interface Activity {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  price: number;
  premiumPrice?: number;
  budgetPrice?: number;
  duration?: string;
  location?: string;
  category?: string;
  difficultyLevel?: string;
  tourType?: 'PRIVATE' | 'SHARED';
  ratingAverage?: number;
  reviewCount?: number;
  featured?: boolean;
  /** Lower = earlier in listings (default 1000 from API). */
  displayOrder?: number;
  active?: boolean;
  imageUrl?: string;
  galleryImages?: string[];
  departureLocation?: string;
  returnLocation?: string;
  meetingTime?: string;
  availability?: string;
  whatToExpect?: string;
  complementaries?: string[];
  mapUrl?: string;
  destination?: Destination;
}

export interface DestinationPageCard {
  id?: number;
  sortOrder?: number;
  imageUrl?: string | null;
  title?: string;
  body?: string;
}

export interface Destination {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  imageUrl?: string;
  country?: string;
  city?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  pageCards?: DestinationPageCard[] | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/** Approved reviews returned for an activity (public GET). */
export interface ActivityReview {
  id: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: {
    id?: number;
    firstName?: string;
    lastName?: string;
  };
  /** Present on list endpoints that include activity context (e.g. recent reviews). */
  activity?: {
    id: number;
    title?: string;
    slug?: string;
  } | null;
}

/** Response after submitting the public contact form. */
export interface ContactMessageSubmitResponse {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  readByAdmin: boolean;
  createdAt: string;
}

export interface CustomTripRequestCreateRequest {
  name: string;
  email: string;
  phone?: string | null;
  startCity: string;
  destinationCity: string;
  preferredDate?: string | null; // yyyy-mm-dd
  numberOfPeople?: number | null;
  message?: string | null;
}

export interface CustomTripRequestResponse {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  startCity: string;
  destinationCity: string;
  preferredDate?: string | null;
  numberOfPeople?: number | null;
  message?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Backend follows short links and may return an `output=embed` URL plus the resolved Maps URL. */
export interface MapEmbedResolveResponse {
  embedUrl: string | null;
  resolvedUrl: string | null;
}

// Public API functions (no authentication required)
export const publicApi = {
  /** Site-wide settings (contact, about CMS, etc.) — language-aware for translated fields. */
  async getPublicSettings(lang?: string): Promise<PublicSiteSettings> {
    const language = lang || getCurrentLanguage();
    const response = await fetch(`${API_BASE_URL}/settings?lang=${encodeURIComponent(language)}`);
    if (!response.ok) throw new Error("Failed to fetch site settings");
    const raw: unknown = await response.json();
    return normalizePublicSiteSettings(raw);
  },

  async getActivities(page = 0, size = 100, lang?: string): Promise<PageResponse<Activity>> {
    const language = lang || getCurrentLanguage();
    const response = await fetch(`${API_BASE_URL}/activities?page=${page}&size=${size}&lang=${language}`);
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  async getFeaturedActivities(page = 0, size = 10, lang?: string): Promise<PageResponse<Activity>> {
    const language = lang || getCurrentLanguage();
    const response = await fetch(`${API_BASE_URL}/activities/featured?page=${page}&size=${size}&lang=${language}`);
    if (!response.ok) throw new Error('Failed to fetch featured activities');
    return response.json();
  },

  async createCustomTripRequest(body: CustomTripRequestCreateRequest): Promise<CustomTripRequestResponse> {
    const response = await fetch(`${API_BASE_URL}/custom-trip-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      let msg = "Failed to submit request";
      try {
        const err = await response.json();
        msg = err?.message || msg;
      } catch {
        msg = response.statusText || msg;
      }
      throw new Error(msg);
    }
    return response.json();
  },

  async getDestinations(page = 0, size = 100, lang?: string): Promise<PageResponse<Destination>> {
    const language = lang || getCurrentLanguage();
    const response = await fetch(`${API_BASE_URL}/destinations?page=${page}&size=${size}&lang=${language}`);
    if (!response.ok) throw new Error('Failed to fetch destinations');
    return response.json();
  },

  async getCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/activities/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async getActivityById(id: number, lang?: string): Promise<Activity> {
    const language = lang || getCurrentLanguage();
    const response = await fetch(`${API_BASE_URL}/activities/${id}?lang=${language}`);
    if (!response.ok) throw new Error('Failed to fetch activity');
    return response.json();
  },

  async getActivityBySlug(slug: string, lang?: string): Promise<Activity> {
    const language = lang || getCurrentLanguage();
    const response = await fetch(
      `${API_BASE_URL}/activities/slug/${encodeURIComponent(slug)}?lang=${language}`,
    );
    if (!response.ok) throw new Error('Failed to fetch activity');
    return response.json();
  },

  async getDestinationById(id: number, lang?: string): Promise<Destination> {
    const language = lang || getCurrentLanguage();
    const response = await fetch(`${API_BASE_URL}/destinations/${id}?lang=${language}`);
    if (!response.ok) throw new Error('Failed to fetch destination');
    return response.json();
  },

  async getDestinationBySlug(slug: string, lang?: string): Promise<Destination> {
    const language = lang || getCurrentLanguage();
    const response = await fetch(`${API_BASE_URL}/destinations/slug/${slug}?lang=${language}`);
    if (!response.ok) throw new Error('Failed to fetch destination');
    return response.json();
  },

  async searchActivities(keyword: string, page = 0, size = 10, lang?: string): Promise<PageResponse<Activity>> {
    const language = lang || getCurrentLanguage();
    const response = await fetch(`${API_BASE_URL}/activities/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}&lang=${language}`);
    if (!response.ok) throw new Error('Failed to search activities');
    return response.json();
  },

  async filterActivities(
    params: {
      destinationId?: number;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      minRating?: number;
      difficulty?: string;
      featured?: boolean;
      page?: number;
      size?: number;
      lang?: string;
    }
  ): Promise<PageResponse<Activity>> {
    const language = params.lang || getCurrentLanguage();
    const page = params.page || 0;
    const size = params.size || 20;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      lang: language,
    });
    
    if (params.destinationId) queryParams.append('destinationId', params.destinationId.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.minRating !== undefined) queryParams.append('minRating', params.minRating.toString());
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());
    
    const response = await fetch(`${API_BASE_URL}/activities/filter?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Failed to filter activities');
    return response.json();
  },

  async getActivityReviews(
    activityId: number,
    page = 0,
    size = 20,
  ): Promise<PageResponse<ActivityReview>> {
    const response = await fetch(
      `${API_BASE_URL}/reviews/activity/${activityId}?page=${page}&size=${size}`,
    );
    if (!response.ok) throw new Error("Failed to fetch reviews");
    return response.json();
  },

  /** Latest approved reviews (e.g. home page). */
  async getRecentReviews(page = 0, size = 9, lang?: string): Promise<PageResponse<ActivityReview>> {
    const language = lang || getCurrentLanguage();
    const response = await fetch(
      `${API_BASE_URL}/reviews/recent?page=${page}&size=${size}&lang=${encodeURIComponent(language)}`,
    );
    if (!response.ok) throw new Error("Failed to fetch recent reviews");
    return response.json();
  },

  /** Public contact form → stored for admin inbox. Sends JWT when present so the thread links to the account (bell + inbox). */
  async submitContactMessage(payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<ContactMessageSubmitResponse> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/contact/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      let msg = "Failed to send message";
      try {
        const err = (await response.json()) as {
          message?: string;
          validationErrors?: Record<string, string>;
        };
        if (err.validationErrors) {
          const vals = Object.values(err.validationErrors);
          if (vals.length > 0 && typeof vals[0] === "string") msg = vals[0];
        } else if (err.message) msg = err.message;
      } catch {
        /* ignore */
      }
      throw new Error(msg);
    }
    return response.json();
  },

  /** Home page newsletter — persists email server-side. */
  async subscribeNewsletter(email: string): Promise<{
    email: string;
    alreadySubscribed: boolean;
    subscribedAt: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!response.ok) {
      let msg = "Failed to subscribe";
      try {
        const err = (await response.json()) as {
          message?: string;
          validationErrors?: Record<string, string>;
        };
        if (err.validationErrors) {
          const vals = Object.values(err.validationErrors);
          if (vals.length > 0 && typeof vals[0] === "string") msg = vals[0];
        } else if (err.message) msg = err.message;
      } catch {
        /* ignore */
      }
      throw new Error(msg);
    }
    return response.json();
  },

  /** Resolve maps.app.goo.gl / Google Maps links into an iframe embed URL when coordinates are found. */
  async getMapEmbedUrl(url: string): Promise<MapEmbedResolveResponse> {
    const response = await fetch(
      `${API_BASE_URL}/map/embed-url?url=${encodeURIComponent(url)}`,
    );
    if (!response.ok) throw new Error("Failed to resolve map URL");
    return response.json();
  },
};
