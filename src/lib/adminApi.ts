import { getApiBaseUrl } from "./apiBase";

const API_BASE_URL = getApiBaseUrl();

// Helper function to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// Helper function to make authenticated requests
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (!token) {
    console.error('No authentication token found. Please log in again.');
    // Clear any stale user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Authentication required. Please log in again.');
  }
  
  headers.set('Authorization', `Bearer ${token}`);

  const userStr = localStorage.getItem("user");
  const user = userStr ? (JSON.parse(userStr) as { role?: string }) : null;

  const method = (options.method || "GET").toUpperCase();
  if (import.meta.env.DEV) {
    console.log(`[adminApi] ${method}`, url);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (import.meta.env.DEV && !response.ok) {
    console.warn(`[adminApi] ${method} ${url} →`, response.status, response.statusText);
  }
  
  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - clear auth and redirect to login
      console.error('401 Unauthorized - token may be expired or invalid');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    if (response.status === 403) {
      // Forbidden - could be due to invalid token or missing permissions
      let errorMessage = 'Access denied. You do not have permission to perform this action.';
      let errorDetails = null;
      try {
        errorDetails = await response.json();
        if (errorDetails.message) {
          errorMessage = errorDetails.message;
        }
        console.error('403 Forbidden - Error details:', errorDetails);
        console.error('Current user role:', user?.role);
        console.error('Required role: ROLE_ADMIN');
        
        // If the user has ROLE_ADMIN in localStorage but gets 403, 
        // it's likely the token is invalid/expired
        if (user?.role === 'ROLE_ADMIN') {
          console.warn('User has ROLE_ADMIN but got 403 - token may be invalid or expired');
          console.warn('Clearing token and redirecting to login...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Your session has expired. Please log in again.');
        }
      } catch (e) {
        // If we already redirected, re-throw the error
        if (e instanceof Error && e.message.includes('session has expired')) {
          throw e;
        }
        // Use default message
        console.error('403 Forbidden - Could not parse error response');
      }
      throw new Error(errorMessage);
    }
    
    let errorMessage = 'Request failed';
    try {
      const error = await response.json();
      if (error.message) {
        errorMessage = error.message;
      } else if (error.validationErrors && typeof error.validationErrors === 'object') {
        errorMessage = Object.entries(error.validationErrors as Record<string, string>)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('; ');
      }
    } catch {
      errorMessage = response.statusText || 'Request failed';
    }
    throw new Error(errorMessage);
  }
  
  return response;
}

// Types
export interface DashboardStats {
  totalUsers: number;
  totalActivities: number;
  totalDestinations: number;
  totalBookings: number;
  totalReviews: number;
  totalRevenue: number;
  bookingsByStatus: Record<string, number>;
  activitiesCountByCategory: Record<string, number>;
}

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
  active?: boolean;
  maxGroupSize?: number;
  availableSlots?: number;
  imageUrl?: string;
  galleryImages?: string[];
  includedItems?: string[];
  excludedItems?: string[];
  itinerary?: string[];
  availableDates?: string[];
  departureLocation?: string;
  returnLocation?: string;
  meetingTime?: string;
  availability?: string;
  whatToExpect?: string;
  complementaries?: string[];
  mapUrl?: string;
  /** Present when the activity has a destination FK even if nested destination is omitted. */
  destinationId?: number | null;
  destination?: Destination;
  createdAt?: string;
  updatedAt?: string;
}

export interface DestinationPageCardTranslation {
  languageCode: string;
  title?: string;
  body?: string;
}

export interface DestinationPageCard {
  id?: number;
  sortOrder?: number;
  imageUrl?: string | null;
  title?: string;
  body?: string;
  translations?: DestinationPageCardTranslation[] | null;
}

export interface DestinationTranslationSnippet {
  languageCode: string;
  name?: string;
  shortDescription?: string;
  fullDescription?: string;
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
  /** Localized for public; admin detail includes translation rows per card */
  pageCards?: DestinationPageCard[] | null;
  /** Admin-only: non-English destination fields */
  destinationTranslations?: DestinationTranslationSnippet[] | null;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: number;
  bookingReference: string;
  user: User;
  activity: Activity;
  bookingDate: string;
  travelDate: string;
  numberOfPeople: number;
  totalPrice: number;
  status: string;
  specialRequest?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: number;
  user: User;
  activity: Activity;
  rating: number;
  comment?: string;
  approved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  readByAdmin: boolean;
  adminReply?: string | null;
  repliedAt?: string | null;
  /** Present only on POST …/reply response */
  replyEmailDelivered?: boolean | null;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface BackupImportResult {
  destinations: number;
  destinationTranslations: number;
  activities: number;
  activityTranslations: number;
  users: number;
  bookings: number;
  reviews: number;
  favorites: number;
  settingsRows: number;
  settingsTranslations: number;
  message: string;
}

export const adminApi = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/dashboard/stats`);
    return response.json();
  },

  /** Downloads a JSON snapshot of destinations, activities, users (passwords redacted), bookings, reviews, favorites, settings. */
  async downloadBackup(): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    const response = await fetch(`${API_BASE_URL}/admin/backup/export`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    if (!response.ok) {
      let message = 'Backup failed';
      try {
        const err = await response.json();
        if (err.message) message = err.message;
      } catch {
        message = response.statusText || message;
      }
      throw new Error(message);
    }
    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition');
    let filename = `tourisme-backup-${new Date().toISOString().slice(0, 10)}.json`;
    if (disposition) {
      const match = /filename="([^"]+)"/.exec(disposition);
      if (match) filename = match[1];
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  /**
   * Data-only PostgreSQL SQL via pg_dump (runs on the server). Requires pg_dump installed where Spring Boot runs.
   * @param useInserts true = INSERT statements; false = COPY (default, smaller file)
   */
  async downloadPostgresDataBackup(useInserts = false): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    const q = useInserts ? '?useInserts=true' : '';
    const response = await fetch(`${API_BASE_URL}/admin/backup/postgres-data${q}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    if (!response.ok) {
      let message = 'PostgreSQL backup failed';
      try {
        const err = await response.json();
        if (err.message) message = err.message;
      } catch {
        message = response.statusText || message;
      }
      throw new Error(message);
    }
    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition');
    let filename = `tourisme-data-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.sql`;
    if (disposition) {
      const match = /filename="([^"]+)"/.exec(disposition);
      if (match) filename = match[1];
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  /** Full replace: wipes DB content then restores from export JSON. All imported users get the same temporary password. */
  async importBackup(file: File, defaultPassword: string): Promise<BackupImportResult> {
    const token = getAuthToken();
    if (!token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('replaceExisting', 'true');
    formData.append('defaultPassword', defaultPassword);
    const response = await fetch(`${API_BASE_URL}/admin/backup/import`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    if (!response.ok) {
      let message = 'Import failed';
      try {
        const err = await response.json();
        if (err.message) message = err.message;
      } catch {
        message = response.statusText || message;
      }
      throw new Error(message);
    }
    return response.json();
  },

  // Users
  async getUsers(page = 0, size = 20): Promise<PageResponse<User>> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/users?page=${page}&size=${size}`);
    return response.json();
  },

  async getUserById(id: number): Promise<User> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/users/${id}`);
    return response.json();
  },

  async updateUser(id: number, data: { firstName?: string; lastName?: string; phone?: string }): Promise<User> {
    const params = new URLSearchParams();
    if (data.firstName) params.append('firstName', data.firstName);
    if (data.lastName) params.append('lastName', data.lastName);
    if (data.phone) params.append('phone', data.phone);
    
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/users/${id}?${params.toString()}`, {
      method: 'PUT',
    });
    return response.json();
  },

  async updateUserStatus(id: number, active: boolean): Promise<User> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/users/${id}/status?active=${active}`, {
      method: 'PATCH',
    });
    return response.json();
  },

  async deleteUser(id: number): Promise<void> {
    await authenticatedFetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  async getUserBookings(userId: number, page = 0, size = 20): Promise<PageResponse<Booking>> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/users/${userId}/bookings?page=${page}&size=${size}`);
    return response.json();
  },

  // Activities - Use public endpoint for listing, admin endpoints for CRUD
  async getActivities(page = 0, size = 20): Promise<PageResponse<Activity>> {
    // Public endpoint doesn't require auth
    const response = await fetch(`${API_BASE_URL}/activities?page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  async getActivityById(id: number): Promise<Activity> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/activities/${id}`);
    return response.json();
  },

  async getCategories(): Promise<string[]> {
    // Public endpoint doesn't require auth
    const response = await fetch(`${API_BASE_URL}/activities/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async createActivity(data: any): Promise<Activity> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateActivity(id: number, data: any): Promise<Activity> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateActivityStatus(id: number, active: boolean): Promise<Activity> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/activities/${id}/status?active=${active}`, {
      method: 'PATCH',
    });
    return response.json();
  },

  async deleteActivity(id: number): Promise<void> {
    await authenticatedFetch(`${API_BASE_URL}/admin/activities/${id}`, {
      method: 'DELETE',
    });
  },

  // Destinations - Use public endpoint for listing, admin endpoints for CRUD
  async getDestinations(page = 0, size = 20): Promise<PageResponse<Destination>> {
    // Public endpoint doesn't require auth
    const response = await fetch(`${API_BASE_URL}/destinations?page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Failed to fetch destinations');
    return response.json();
  },

  async getDestinationById(id: number, lang?: string): Promise<Destination> {
    const url = lang
      ? `${API_BASE_URL}/destinations/${id}?lang=${lang}`
      : `${API_BASE_URL}/destinations/${id}`;
    const response = await authenticatedFetch(url);
    return response.json();
  },

  /** Full destination for admin edit: English base fields, destinationTranslations, pageCards with per-card translations */
  async getDestinationForAdmin(id: number): Promise<Destination> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/destinations/${id}`);
    return response.json();
  },

  async createDestination(data: any): Promise<Destination> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/destinations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateDestination(id: number, data: any): Promise<Destination> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/destinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteDestination(id: number): Promise<void> {
    await authenticatedFetch(`${API_BASE_URL}/admin/destinations/${id}`, {
      method: 'DELETE',
    });
  },

  // Bookings
  async getBookings(page = 0, size = 20): Promise<PageResponse<Booking>> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/bookings?page=${page}&size=${size}`);
    return response.json();
  },

  async getBookingById(id: number): Promise<Booking> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/bookings/${id}`);
    return response.json();
  },

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/bookings/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
    return response.json();
  },

  async deleteBooking(id: number): Promise<void> {
    await authenticatedFetch(`${API_BASE_URL}/admin/bookings/${id}`, {
      method: 'DELETE',
    });
  },

  // Reviews
  async getReviews(page = 0, size = 20): Promise<PageResponse<Review>> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/reviews?page=${page}&size=${size}`);
    return response.json();
  },

  async approveReview(id: number): Promise<Review> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/reviews/${id}/approve`, {
      method: 'PATCH',
    });
    return response.json();
  },

  async rejectReview(id: number): Promise<Review> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/reviews/${id}/reject`, {
      method: 'PATCH',
    });
    return response.json();
  },

  async deleteReview(id: number): Promise<void> {
    await authenticatedFetch(`${API_BASE_URL}/admin/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  async getContactMessages(page = 0, size = 20): Promise<PageResponse<ContactMessage>> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/admin/contact-messages?page=${page}&size=${size}`,
    );
    return response.json();
  },

  async markContactMessageRead(id: number): Promise<ContactMessage> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/contact-messages/${id}/read`, {
      method: 'PATCH',
    });
    return response.json();
  },

  async deleteContactMessage(id: number): Promise<void> {
    await authenticatedFetch(`${API_BASE_URL}/admin/contact-messages/${id}`, {
      method: 'DELETE',
    });
  },

  async replyToContactMessage(id: number, reply: string): Promise<ContactMessage> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/contact-messages/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    });
    return response.json();
  },

  // File Upload
  async uploadFile(file: File): Promise<{ filename: string; url: string }> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    // Validate file
    if (!file || file.size === 0) {
      throw new Error('Please select a valid file to upload');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadUrl = `${API_BASE_URL}/admin/upload`;
      console.log('Uploading file to:', uploadUrl);
      console.log('File name:', file.name, 'Size:', file.size);
      console.log('Token present:', !!token, 'Token length:', token.length);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
        },
        body: formData,
      });

      console.log('Upload response status:', response.status, response.statusText);

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Your session has expired. Please log in again.');
        }
        
        // Handle 403 Forbidden
        if (response.status === 403) {
          let errorMessage = 'Access denied. You do not have permission to upload files.';
          try {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } catch {
            // If response is not JSON, use default message
          }
          throw new Error(errorMessage + ' Please ensure you are logged in as an administrator.');
        }
        
        // Handle other errors
        let errorMessage = 'Upload failed';
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || `Upload failed: ${response.status} ${response.statusText}`;
        } catch {
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      // Construct full URL - use the API base URL but remove /api
      // result.url is already in format "/uploads/filename"
      const baseUrl = API_BASE_URL.replace('/api', '');
      const fullUrl = result.url.startsWith('http') 
        ? result.url 
        : `${baseUrl}${result.url}`;
      return {
        filename: result.filename,
        url: fullUrl,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Could not connect to server');
    }
  },

  async getSettings(): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/settings`);
    return response.json();
  },

  async updateSettings(data: any): Promise<any> {
    // Convert translations array to request params format
    const params = new URLSearchParams();
    if (data.siteName) params.append('siteName', data.siteName);
    if (data.logoUrl) params.append('logoUrl', data.logoUrl);
    if (data.contactEmail) params.append('contactEmail', data.contactEmail);
    if (data.contactPhone) params.append('contactPhone', data.contactPhone);
    if (data.address) params.append('address', data.address);
    if (data.facebookUrl) params.append('facebookUrl', data.facebookUrl);
    if (data.instagramUrl) params.append('instagramUrl', data.instagramUrl);
    if (data.twitterUrl) params.append('twitterUrl', data.twitterUrl);
    if (data.youtubeUrl) params.append('youtubeUrl', data.youtubeUrl);
    if (data.bannerTitle) params.append('bannerTitle', data.bannerTitle);
    if (data.bannerSubtitle) params.append('bannerSubtitle', data.bannerSubtitle);

    const response = await authenticatedFetch(`${API_BASE_URL}/admin/settings?${params.toString()}`, {
      method: 'PUT',
      body: data.translations ? JSON.stringify(data.translations) : undefined,
    });
    return response.json();
  },
};
