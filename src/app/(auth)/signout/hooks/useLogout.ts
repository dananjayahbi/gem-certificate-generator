"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/constants/apiEndpoints";

export default function useLogout() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const clearSession = () => {
    try {
      // Remove all auth-related cookies
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      Cookies.remove("access_token_expires_at");
      Cookies.remove("refresh_token_expires_at");
      
      // Clear localStorage
      localStorage.removeItem("currentUser");
      localStorage.removeItem("role");
      localStorage.removeItem("permissions");
      
      // Dispatch event to update components
      window.dispatchEvent(new Event("currentUser:updated"));
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  };

  const logout = async ({ 
    all = false, 
    redirectTo = "/login", 
    showToast = true 
  } = {}) => {
    setLoading(true);
    try {
      const access = Cookies.get("access_token");
      const refresh = Cookies.get("refresh_token");

      // Call backend logout endpoint (best effort)
      if (access && refresh) {
        const url = buildApiUrl(API_ENDPOINTS.AUTH.LOGOUT);
        await axios.post(
          url,
          { refresh: refresh },
          {
            headers: {
              Authorization: `Bearer ${access}`,
              "Content-Type": "application/json",
            },
            timeout: 10000, // 10 second timeout
          }
        );
      }
    } catch (error) {
      // Log error but don't block logout
      console.warn("Backend logout failed:", error?.message);
    } finally {
      // Always clear session regardless of backend response
      clearSession();
      setLoading(false);
      
      // Redirect to login
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  };

  const logoutNow = () => {
    clearSession();
    router.push("/login");
  };

  return { loading, logout, logoutNow, clearSession };
}