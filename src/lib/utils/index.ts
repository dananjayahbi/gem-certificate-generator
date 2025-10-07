import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Auth utility functions
export const authUtils = {
  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  isValidPassword: (password) => {
    return password && password.length >= 8;
  },

  // Format user display name
  formatUserName: (user) => {
    if (!user) return "";
    return user.full_name || user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "User";
  },

  // Get user initials for avatar
  getUserInitials: (user) => {
    if (!user) return "U";
    
    const name = authUtils.formatUserName(user);
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  },

  // Check if user has specific role
  hasRole: (userRole, requiredRole) => {
    if (!userRole || !requiredRole) return false;
    return userRole.toLowerCase() === requiredRole.toLowerCase();
  },

  // Check if user has any of the required roles
  hasAnyRole: (userRole, requiredRoles = []) => {
    if (!userRole || !Array.isArray(requiredRoles)) return false;
    return requiredRoles.some(role => authUtils.hasRole(userRole, role));
  },

  // Generate random string for nonce/state
  generateRandomString: (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Format error messages
  formatErrorMessage: (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.detail) return error.response.data.detail;
    return 'An unexpected error occurred';
  },

  // Debounce function for search/input
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Safe JSON parse
  safeJsonParse: (jsonString, fallback = null) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('JSON parse failed:', error);
      return fallback;
    }
  },

  // Safe local storage operations
  storage: {
    get: (key, fallback = null) => {
      try {
        if (typeof window === 'undefined') return fallback;
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (error) {
        console.warn(`Failed to get ${key} from localStorage:`, error);
        return fallback;
      }
    },

    set: (key, value) => {
      try {
        if (typeof window === 'undefined') return false;
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.warn(`Failed to set ${key} in localStorage:`, error);
        return false;
      }
    },

    remove: (key) => {
      try {
        if (typeof window === 'undefined') return false;
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.warn(`Failed to remove ${key} from localStorage:`, error);
        return false;
      }
    }
  }
};

// Form validation utilities
export const validation = {
  required: (value) => !!value || "This field is required",
  email: (value) => authUtils.isValidEmail(value) || "Please enter a valid email address",
  password: (value) => authUtils.isValidPassword(value) || "Password must be at least 8 characters long",
  minLength: (min) => (value) => (value && value.length >= min) || `Must be at least ${min} characters`,
  maxLength: (max) => (value) => (!value || value.length <= max) || `Must be no more than ${max} characters`,
};

// Date/time utilities
export const dateUtils = {
  formatDate: (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      return "";
    }
  },

  formatDateTime: (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleString();
    } catch (error) {
      return "";
    }
  },

  isExpired: (date) => {
    if (!date) return true;
    try {
      return new Date(date) <= new Date();
    } catch (error) {
      return true;
    }
  }
};