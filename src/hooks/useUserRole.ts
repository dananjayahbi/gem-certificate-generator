"use client";

import { useState, useEffect } from "react";

/**
 * useUserRole - Hook to get current user's role and check permissions
 * 
 * @returns {object} - Object containing role info and permission checking functions
 */
export function useUserRole() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = () => {
      try {
        const userRole = localStorage.getItem("role");
        setRole(userRole);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();

    // Listen for role updates
    const handleStorageChange = () => {
      fetchRole();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("currentUser:updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("currentUser:updated", handleStorageChange);
    };
  }, []);

  const isAdmin = () => role === "ADMIN";
  const isUser = () => role === "USER";
  const hasRole = (requiredRole) => role === requiredRole;
  const hasAnyRole = (requiredRoles) => requiredRoles.includes(role);

  return {
    role,
    loading,
    isAdmin,
    isUser,
    hasRole,
    hasAnyRole,
  };
}
