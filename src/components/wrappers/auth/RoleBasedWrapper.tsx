"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FallbackLoading from "./FallbackLoading";

/**
 * RoleBasedWrapper - Flexible role-based access control wrapper
 * 
 * @param {string[]} allowedRoles - Array of roles that can access this route (e.g., ["ADMIN", "USER"])
 * @param {string} redirectTo - Path to redirect unauthorized users (default: "/")
 * @param {ReactNode} children - Child components to render if authorized
 * @param {ReactNode} fallback - Optional custom fallback component for unauthorized access
 */
const RoleBasedWrapper = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = "/",
  fallback = null 
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      try {
        // Get user role from localStorage
        const userRole = localStorage.getItem("role");
        
        if (!userRole) {
          console.warn("No user role found");
          router.push(redirectTo);
          return;
        }

        // Check if user's role is in the allowed roles
        if (allowedRoles.includes(userRole)) {
          setHasAccess(true);
        } else {
          console.warn(`Access denied: Required roles: ${allowedRoles.join(", ")}, User role: ${userRole}`);
          router.push(redirectTo);
        }
      } catch (error) {
        console.error("Error checking role-based access:", error);
        router.push(redirectTo);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router, allowedRoles, redirectTo]);

  if (loading) {
    return <FallbackLoading />;
  }

  if (!hasAccess) {
    return fallback || <FallbackLoading />;
  }

  return <>{children}</>;
};

export default RoleBasedWrapper;
