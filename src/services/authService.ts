"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/constants/apiEndpoints";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create axios instance with default config
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token
authApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = Cookies.get("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          buildApiUrl(API_ENDPOINTS.AUTH.REFRESH_TOKEN),
          { refresh: refreshToken }
        );

        const { access } = response.data;
        if (access) {
          // Update the access token
          Cookies.set("access_token", access, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            path: "/",
          });

          // Retry the original request
          original.headers.Authorization = `Bearer ${access}`;
          return authApi(original);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        Cookies.remove("access_token_expires_at");
        Cookies.remove("refresh_token_expires_at");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("role");
        
        // Dispatch event to update components
        window.dispatchEvent(new Event("currentUser:updated"));
        
        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default authApi;

// Helper functions for auth service
export const authService = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = Cookies.get("access_token");
    const user = localStorage.getItem("currentUser");
    return !!(token && user);
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("currentUser");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  // Get user role
  getUserRole: () => {
    return localStorage.getItem("role") || null;
  },

  // Check if token is expired
  isTokenExpired: (tokenKey = "access_token") => {
    const expiry = Cookies.get(`${tokenKey}_expires_at`);
    if (!expiry) return true;
    
    try {
      const expiryDate = new Date(expiry);
      return expiryDate <= new Date();
    } catch (error) {
      return true;
    }
  },

  // Manually refresh token
  refreshToken: async () => {
    try {
      const refreshToken = Cookies.get("refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(
        buildApiUrl(API_ENDPOINTS.AUTH.REFRESH_TOKEN),
        { refresh: refreshToken }
      );

      const { access } = response.data;
      if (access) {
        Cookies.set("access_token", access, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          path: "/",
        });
        return access;
      }
      
      throw new Error("No access token received");
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  },
};