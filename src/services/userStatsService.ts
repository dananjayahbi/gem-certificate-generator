"use client";

import authApi from "./authService";
import { API_ENDPOINTS } from "@/lib/constants/apiEndpoints";

const userStatsService = {
  // Get user statistics (placeholder - endpoint doesn't exist yet)
  getUserStats: async (userId) => {
    try {
      // TODO: Implement stats endpoint in backend
      console.warn("User stats endpoint not implemented yet");
      return { certificates: 0, templates: 0 };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUserProfile: async () => {
    try {
      const response = await authApi.get(API_ENDPOINTS.USER.PROFILE);
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    try {
      const response = await authApi.put(API_ENDPOINTS.USER.UPDATE_PROFILE, profileData);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  // Get user permissions (placeholder - endpoint doesn't exist yet)
  getUserPermissions: async () => {
    try {
      // TODO: Implement permissions endpoint in backend
      console.warn("User permissions endpoint not implemented yet");
      return [];
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      throw error;
    }
  },
};

export default userStatsService;