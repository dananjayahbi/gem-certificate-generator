"use client";

import { useState } from "react";
import userStatsService from "@/services/userStatsService";

export default function useUserStats() {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileData = await userStatsService.getCurrentUserProfile();
      setProfile(profileData);
      return profileData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const statsData = await userStatsService.getUserStats(userId);
      setStats(statsData);
      return statsData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const permissionsData = await userStatsService.getUserPermissions();
      setPermissions(permissionsData);
      return permissionsData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await userStatsService.updateUserProfile(profileData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    profile,
    permissions,
    loading,
    error,
    fetchUserProfile,
    fetchUserStats,
    fetchUserPermissions,
    updateProfile,
  };
}