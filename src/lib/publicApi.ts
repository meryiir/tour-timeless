const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper function to get image URL
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '/placeholder.svg';
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
  return `${baseUrl}${url}`;
}

// Types from API
export interface Activity {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  price: number;
  duration?: string;
  location?: string;
  category?: string;
  difficultyLevel?: string;
  ratingAverage?: number;
  reviewCount?: number;
  featured?: boolean;
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
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Public API functions (no authentication required)
export const publicApi = {
  async getActivities(page = 0, size = 100): Promise<PageResponse<Activity>> {
    const response = await fetch(`${API_BASE_URL}/activities?page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  async getFeaturedActivities(page = 0, size = 10): Promise<PageResponse<Activity>> {
    const response = await fetch(`${API_BASE_URL}/activities/featured?page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Failed to fetch featured activities');
    return response.json();
  },

  async getDestinations(page = 0, size = 100): Promise<PageResponse<Destination>> {
    const response = await fetch(`${API_BASE_URL}/destinations?page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Failed to fetch destinations');
    return response.json();
  },

  async getCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/activities/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async getActivityById(id: number): Promise<Activity> {
    const response = await fetch(`${API_BASE_URL}/activities/${id}`);
    if (!response.ok) throw new Error('Failed to fetch activity');
    return response.json();
  },

  async getDestinationById(id: number): Promise<Destination> {
    const response = await fetch(`${API_BASE_URL}/destinations/${id}`);
    if (!response.ok) throw new Error('Failed to fetch destination');
    return response.json();
  },

  async searchActivities(keyword: string, page = 0, size = 10): Promise<PageResponse<Activity>> {
    const response = await fetch(`${API_BASE_URL}/activities/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Failed to search activities');
    return response.json();
  },
};
