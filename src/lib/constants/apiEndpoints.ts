export const API_ENDPOINTS = {
  // Authentication Endpoints
  AUTH: {
    LOGIN: '/api/token/',
    REFRESH_TOKEN: '/api/token/refresh/',
    LOGOUT: '/api/token/logout/',
  },

  // User Endpoints
  USER: {
    // PROFILE: '/api/users/profile/',
    // STATS: (userId) => `/api/users/${userId}/stats/`,
    // PERMISSIONS: '/api/users/permissions/',
    // UPDATE_PROFILE: '/api/users/profile/',
  },

  // Add more endpoint groups as needed
};

/**
 * Build full API URL by combining base URL with endpoint
 * @param {string} endpoint - The endpoint path from API_ENDPOINTS
 * @param {string} baseURL - Optional custom base URL (defaults to env variable)
 * @returns {string} Complete API URL
 * 
 * @example
 * // Simple endpoint
 * buildApiUrl(API_ENDPOINTS.AUTH.LOGIN)
 * // Returns: "http://localhost:8000/api/token/"
 */
export const buildApiUrl = (endpoint, baseURL) => {
  const base = baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
  // Remove trailing slash from base URL if present
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalizedBase}${endpoint}`;
};

/**
 * Standard API Error Messages
 */
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Your session has expired. Please login again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  LOGOUT_FAILED: 'Logout failed. Please try again.',
  REFRESH_FAILED: 'Token refresh failed. Please login again.',
};

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};
