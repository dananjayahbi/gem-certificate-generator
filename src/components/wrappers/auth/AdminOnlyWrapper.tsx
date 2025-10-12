"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FallbackLoading from "./FallbackLoading";

/**
 * AdminOnlyWrapper - Protects routes that should only be accessible by ADMIN users
 * Redirects non-admin users to the dashboard
 */
const AdminOnlyWrapper = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = () => {
      try {
        // Get user role from localStorage
        const userRole = localStorage.getItem("role");
        
        if (userRole === "ADMIN") {
          setIsAdmin(true);
        } else {
          // Not an admin, redirect to dashboard
          console.warn("Access denied: Admin role required");
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [router]);

  if (loading) {
    return <FallbackLoading />;
  }

  if (!isAdmin) {
    return <FallbackLoading />;
  }

  return <>{children}</>;
};

export default AdminOnlyWrapper;
