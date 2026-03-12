const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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

  // Activities - Use public endpoint for listing, admin endpoints for CRUD
  async getActivities(page = 0, size = 20): Promise<PageResponse<Activity>> {
    // Public endpoint doesn't require auth
    const response = await fetch(`${API_BASE_URL}/activities?page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  async getActivityById(id: number): Promise<Activity> {
    const response = await authenticatedFetch(`${API_BASE_URL}/activities/${id}`);
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

  async getDestinationById(id: number): Promise<Destination> {
    const response = await authenticatedFetch(`${API_BASE_URL}/destinations/${id}`);
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

  // File Upload
  async uploadFile(file: File): Promise<{ filename: string; url: string }> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        
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
};
