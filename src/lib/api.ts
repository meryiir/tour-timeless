const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
};
