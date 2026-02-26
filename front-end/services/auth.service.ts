import http from "@/lib/http";
import { LoginType, RegisterType } from "@/schema/auth.schema";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  userId?: number;
  email?: string;
  requireVerification?: boolean;
}

export const AUTH_SERVICE = {
  async register(data: RegisterType): Promise<AuthResponse> {
    return http.post<AuthResponse>(`/api/auth/register`, data, { baseURL: BASE });
  },

  async login(data: LoginType): Promise<AuthResponse> {
    return http.post<AuthResponse>(`/api/auth/login`, data, { baseURL: BASE });
  },

  async verifyEmail(email: string, otp: string): Promise<AuthResponse> {
    return http.post<AuthResponse>(`/api/auth/verify-email`, { email, otp }, { baseURL: BASE });
  },

  async resendOTP(email: string): Promise<{ message: string }> {
    return http.post<{ message: string }>(`/api/auth/resend-otp`, { email }, { baseURL: BASE });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return http.post<{ message: string }>(`/api/auth/forgot-password`, { email }, { baseURL: BASE });
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return http.post<{ message: string }>(`/api/auth/reset-password`, { token, password }, { baseURL: BASE });
  },

  async getMe(): Promise<{ user: any }> {
    return http.get<{ user: any }>(`/api/auth/me`, { baseURL: BASE, skipAuth: false });
  },
};
