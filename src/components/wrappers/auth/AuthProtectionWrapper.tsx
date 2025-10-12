"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/constants/apiEndpoints";
import FallbackLoading from "./FallbackLoading";

// Function to decode JWT token and extract expiration time and user info
const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsedPayload = JSON.parse(decodedPayload);
    
    return {
      expiresAt: new Date(parsedPayload.exp * 1000),
      userId: parsedPayload.user_id || parsedPayload.userId,
      role: parsedPayload.role || parsedPayload.user_role || 'USER', // Extract role from token
      email: parsedPayload.email,
      name: parsedPayload.name
    };
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

const AuthProtectionWrapper = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  const getTokenExpiry = useCallback((tokenKey) => {
    // First try to get expiry from JWT itself
    const token = Cookies.get(tokenKey);
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded && decoded.expiresAt) {
        return decoded.expiresAt;
      }
    }
    
    // Fallback to cookie expiry if JWT decoding fails
    const expiry = Cookies.get(`${tokenKey}_expires_at`);
    const d = expiry ? new Date(expiry) : null;
    return isNaN(d?.getTime?.()) ? null : d;
  }, []);

  const isTokenExpired = useCallback((tokenKey) => {
    const expiry = getTokenExpiry(tokenKey);
    return !expiry || expiry <= new Date();
  }, [getTokenExpiry]);

  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = Cookies.get("refresh_token");
      if (!refreshToken || isTokenExpired("refresh_token")) {
        throw new Error("No valid refresh token");
      }

      const response = await axios.post(
        buildApiUrl(API_ENDPOINTS.AUTH.REFRESH_TOKEN),
        { refresh: refreshToken },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      const { access } = response.data;
      if (!access) {
        throw new Error("No access token in response");
      }

      // Set the new access token
      Cookies.set("access_token", access, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/",
      });

      return access;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  }, [isTokenExpired]);

  const clearAuthAndRedirect = useCallback(() => {
    // Clear all auth data
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("access_token_expires_at");
    Cookies.remove("refresh_token_expires_at");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("role");
    localStorage.removeItem("permissions");

    // Dispatch event for other components
    window.dispatchEvent(new Event("currentUser:updated"));

    // Only redirect to login if we're not already on an auth page
    if (!pathname.startsWith('/login') && !pathname.startsWith('/signout')) {
      router.push("/login");
    }
  }, [router, pathname]);

  const validateTokens = useCallback(async () => {
    try {
      const accessToken = Cookies.get("access_token");
      const refreshToken = Cookies.get("refresh_token");

      // No tokens, redirect to login
      if (!accessToken && !refreshToken) {
        clearAuthAndRedirect();
        return false;
      }

      // Check if refresh token is expired
      if (isTokenExpired("refresh_token")) {
        clearAuthAndRedirect();
        return false;
      }

      // If access token is expired, try to refresh
      if (isTokenExpired("access_token")) {
        try {
          await refreshAccessToken();
        } catch (error) {
          clearAuthAndRedirect();
          return false;
        }
      }

      // Decode access token to get user info and role
      const decoded = decodeJWT(accessToken);
      if (decoded) {
        // Set role in localStorage from token
        const userRole = decoded.role || "USER";
        localStorage.setItem("role", userRole);
        setRole(userRole);
        
        // Optionally store other user info
        if (decoded.userId) {
          localStorage.setItem("userId", decoded.userId);
        }
        if (decoded.email) {
          localStorage.setItem("userEmail", decoded.email);
        }
        if (decoded.name) {
          localStorage.setItem("userName", decoded.name);
        }
      } else {
        // Fallback to existing role or default to USER
        const userRole = localStorage.getItem("role") || "USER";
        setRole(userRole);
      }

      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      clearAuthAndRedirect();
      return false;
    }
  }, [isTokenExpired, refreshAccessToken, clearAuthAndRedirect]);

  useEffect(() => {
    const checkAuthentication = async () => {
      setLoading(true);

      // Allow access to auth pages without token validation
      if (pathname.startsWith('/login') || pathname.startsWith('/signout')) {
        setLoading(false);
        return;
      }

      // For protected routes, validate tokens
      const isValid = await validateTokens();
      if (!isValid) {
        return; // clearAuthAndRedirect will handle the redirect
      }

      setLoading(false);
    };

    checkAuthentication();
  }, [pathname, validateTokens]);

  // Show loading spinner while checking authentication
  if (loading) {
    return <FallbackLoading />;
  }

  // For auth pages (login, signout), render directly
  if (pathname.startsWith('/login') || pathname.startsWith('/signout')) {
    return (
      <Suspense fallback={<FallbackLoading />}>
        {children}
      </Suspense>
    );
  }

  // For protected routes, ensure we have valid tokens
  const hasValidTokens = Cookies.get("access_token") && Cookies.get("refresh_token");
  if (!hasValidTokens) {
    return <FallbackLoading />;
  }

  return (
    <Suspense fallback={<FallbackLoading />}>
      {children}
    </Suspense>
  );
};

export default AuthProtectionWrapper;