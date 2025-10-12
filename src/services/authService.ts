"use client";

import axios from "axios";
import Cookies from "js-cookie";

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

// Response interceptor to handle 401 errors
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem("role");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("userId");
        window.location.href = "/login";
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
};