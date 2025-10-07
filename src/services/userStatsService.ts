"use client";

import authApi from "./authService";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/constants/apiEndpoints";

const userStatsService = {
  // Get user statistics
  getUserStats: async (userId) => {
    try {
      const response = await authApi.get(buildApiUrl(API_ENDPOINTS.USER.STATS(userId)));
      return response.data;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUserProfile: async () => {
    try {
      const response = await authApi.get(buildApiUrl(API_ENDPOINTS.USER.PROFILE));
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    try {
      const response = await authApi.put(buildApiUrl(API_ENDPOINTS.USER.UPDATE_PROFILE), profileData);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  // Get user permissions
  getUserPermissions: async () => {
    try {
      const response = await authApi.get(buildApiUrl(API_ENDPOINTS.USER.PERMISSIONS));
      return response.data;
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      throw error;
    }
  },
};

export default userStatsService;