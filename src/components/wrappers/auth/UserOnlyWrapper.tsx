"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FallbackLoading from "./FallbackLoading";

/**
 * UserOnlyWrapper - Protects routes that should only be accessible by regular USER role
 * Can be used for user-specific pages if needed
 */
const UserOnlyWrapper = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const checkUserRole = () => {
      try {
        // Get user role from localStorage
        const userRole = localStorage.getItem("role");
        
        if (userRole === "USER") {
          setIsUser(true);
        } else {
          // Not a regular user, redirect to dashboard
          console.warn("Access denied: User role required");
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [router]);

  if (loading) {
    return <FallbackLoading />;
  }

  if (!isUser) {
    return <FallbackLoading />;
  }

  return <>{children}</>;
};

export default UserOnlyWrapper;
