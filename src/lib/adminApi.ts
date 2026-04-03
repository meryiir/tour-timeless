import { getApiBaseUrl, getBackendPublicOrigin } from "./apiBase";

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
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    let errorMessage = 'Request failed';
    try {
      const error = await response.json();
      if (error.message) {
        errorMessage = error.message;
      } else if (error.validationErrors) {
        errorMessage = Object.values(error.validationErrors).join(', ');
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
  destination?: Destination;
  createdAt?: string;
  updatedAt?: string;
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

/** Admin inbox: contact form threads (matches backend ContactMessageResponse). */
export interface ContactThreadEntry {
  id: number;
  sender: string;
  body: string;
  createdAt: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  readByAdmin?: boolean;
  adminReply?: string | null;
  repliedAt?: string | null;
  replyEmailDelivered?: boolean | null;
  createdAt?: string;
  thread?: ContactThreadEntry[];
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

export const adminApi = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/dashboard/stats`);
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

  // Activities — public /api/activities only returns active=true; admin must use /api/admin/activities
  async getActivities(page = 0, size = 20, lang = 'en'): Promise<PageResponse<Activity>> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/admin/activities?page=${page}&size=${size}&lang=${encodeURIComponent(lang)}`
    );
    return response.json();
  },

  async getActivityById(id: number, lang = 'en'): Promise<Activity> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/admin/activities/${id}?lang=${encodeURIComponent(lang)}`
    );
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

  // Contact messages (public contact form → admin inbox)
  async getContactMessages(page = 0, size = 50): Promise<PageResponse<ContactMessage>> {
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
      // result.url is typically "/uploads/filename"
      const origin = getBackendPublicOrigin();
      const fullUrl = result.url.startsWith("http")
        ? result.url
        : origin
          ? `${origin}${result.url}`
          : result.url;
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

  /** Full settings + translation rows for the admin editor. */
  async getSettingsBootstrap(): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/settings/bootstrap`);
    return response.json();
  },

  async updateSettings(data: Record<string, unknown>): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/settings`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /** Triggers download of PostgreSQL data-only SQL (pg_dump). */
  async downloadPostgresDataBackup(useInserts: boolean): Promise<void> {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/admin/backup/postgres-data?useInserts=${useInserts}`;
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const response = await fetch(url, { headers });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }
      let errorMessage = "Export failed";
      try {
        const err = await response.json();
        errorMessage = err.message || err.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    const blob = await response.blob();
    let filename = "tourisme-data.sql";
    const cd = response.headers.get("Content-Disposition");
    if (cd) {
      const m = cd.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)/i);
      if (m) filename = decodeURIComponent(m[1].replace(/"/g, "").trim());
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};
