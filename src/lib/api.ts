import { getApiBaseUrl } from "./apiBase";

const API_BASE_URL = getApiBaseUrl();

/** Set after a successful fetch (including empty string from API). Undefined = not loaded yet. */
let cachedGoogleClientIdFromApi: string | undefined;

async function resolveGoogleClientId(): Promise<string> {
  const env = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  if (env) return env;
  if (cachedGoogleClientIdFromApi !== undefined) return cachedGoogleClientIdFromApi;
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google-client-id`);
    if (!response.ok) {
      return "";
    }
    const data = await response.json();
    cachedGoogleClientIdFromApi =
      typeof data.clientId === "string" ? data.clientId.trim() : "";
    return cachedGoogleClientIdFromApi;
  } catch {
    return "";
  }
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type?: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    active?: boolean;
  };
}

export const api = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Ensure phone is not sent if empty
    const requestData: any = { ...data };
    if (!requestData.phone || requestData.phone.trim() === '') {
      delete requestData.phone;
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      let errorMessage = 'Registration failed';
      try {
        const error = await response.json();
        // Handle validation errors from Spring Boot
        if (error.validationErrors) {
          // Format: { fieldName: "error message", ... }
          errorMessage = Object.values(error.validationErrors).join(', ');
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.errors) {
          // Fallback for other error formats
          errorMessage = Object.values(error.errors).flat().join(', ');
        } else if (Array.isArray(error)) {
          errorMessage = error.map((e: any) => e.message || e).join(', ');
        }
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || 'Registration failed';
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const error = await response.json();
        // Handle validation errors from Spring Boot
        if (error.validationErrors) {
          errorMessage = Object.values(error.validationErrors).join(', ');
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.errors) {
          errorMessage = Object.values(error.errors).flat().join(', ');
        } else if (Array.isArray(error)) {
          errorMessage = error.map((e: any) => e.message || e).join(', ');
        }
      } catch {
        errorMessage = response.statusText || 'Login failed';
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async getGoogleClientId(): Promise<string> {
    return resolveGoogleClientId();
  },

  async googleAuth(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      let errorMessage = 'Google authentication failed';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = response.statusText || 'Google authentication failed';
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async updateProfile(userId: number, data: { firstName?: string; lastName?: string; phone?: string }): Promise<AuthResponse['user']> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const params = new URLSearchParams();
    if (data.firstName) params.append('firstName', data.firstName);
    if (data.lastName) params.append('lastName', data.lastName);
    if (data.phone) params.append('phone', data.phone);

    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}?${params.toString()}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update profile';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = response.statusText || 'Failed to update profile';
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async getMyBookings(page = 0, size = 20): Promise<{
    content: any[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/bookings/my-bookings?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch bookings';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = response.statusText || 'Failed to fetch bookings';
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async createBooking(data: {
    activityId: number;
    travelDate: string;
    numberOfPeople: number;
    specialRequest?: string;
    tourType?: string;
    comfortLevel?: string;
  }): Promise<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        activityId: data.activityId,
        travelDate: data.travelDate,
        numberOfPeople: data.numberOfPeople,
        specialRequest: data.specialRequest,
        tourType: data.tourType,
        comfortLevel: data.comfortLevel,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create booking';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = response.statusText || 'Failed to create booking';
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async getNotifications(page = 0, size = 30): Promise<{
    content: UserNotification[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }
    const response = await fetch(
      `${API_BASE_URL}/notifications?page=${page}&size=${size}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to load notifications");
    }
    return response.json();
  },

  async getUnreadNotificationCount(): Promise<number> {
    const token = localStorage.getItem("token");
    if (!token) return 0;
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return 0;
    const data = await response.json();
    return typeof data.count === "number" ? data.count : 0;
  },

  async markNotificationRead(id: number): Promise<void> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Failed to mark notification read");
    }
  },

  async createReview(data: {
    activityId: number;
    rating: number;
    comment?: string;
  }): Promise<{
    id: number;
    rating: number;
    comment?: string;
    approved?: boolean;
    createdAt?: string;
  }> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        activityId: data.activityId,
        rating: data.rating,
        comment: data.comment?.trim() || undefined,
      }),
    });
    if (!response.ok) {
      let errorMessage = "Failed to submit review";
      try {
        const err = await response.json();
        errorMessage = err.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async markAllNotificationsRead(): Promise<void> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Failed to mark all read");
    }
  },

  async getMyContactMessages(page = 0, size = 20): Promise<{
    content: ClientContactMessage[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    const response = await fetch(
      `${API_BASE_URL}/contact/my-messages?page=${page}&size=${size}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to load contact messages");
    }
    return response.json();
  },
};

export interface UserNotification {
  id: number;
  /** BOOKING_STATUS or CONTACT_REPLY */
  notificationType?: string;
  bookingId?: number | null;
  bookingReference?: string | null;
  activityTitle?: string | null;
  status: string;
  contactMessageId?: number | null;
  read: boolean;
  createdAt: string;
}

export interface ClientContactMessage {
  id: number;
  subject: string;
  message: string;
  adminReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}
