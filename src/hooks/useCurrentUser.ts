"use client";

import { useState, useEffect } from "react";
import { authService } from "@/services/authService";

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const updateUser = () => {
    const currentUser = authService.getCurrentUser();
    const authenticated = authService.isAuthenticated();
    
    setUser(currentUser);
    setIsAuthenticated(authenticated);
    setLoading(false);
  };

  useEffect(() => {
    // Initial load
    updateUser();

    // Listen for user updates
    const handleUserUpdate = () => {
      updateUser();
    };

    window.addEventListener("currentUser:updated", handleUserUpdate);
    
    // Clean up
    return () => {
      window.removeEventListener("currentUser:updated", handleUserUpdate);
    };
  }, []);

  const refreshUser = () => {
    updateUser();
  };

  return {
    user,
    loading,
    isAuthenticated,
    role: authService.getUserRole(),
    refreshUser,
  };
}