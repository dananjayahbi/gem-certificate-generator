"use client";

import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/constants/apiEndpoints";

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const login = async (
    { email, password },
    {
      redirect = true,
      redirectTo,
      rememberDays = 7,
    } = {}
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const payload = { email, password };

      const response = await axios.post(
        buildApiUrl(API_ENDPOINTS.AUTH.LOGIN),
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const data = response?.data ?? {};
      const {
        access,
        refresh,
      } = data;

      if (!access || !refresh) {
        throw new Error("Authentication tokens not received");
      }

      // Set cookies with security options
      const cookieOptions = {
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/",
      };

      // Set access token (short-lived)
      Cookies.set("access_token", access, cookieOptions);
      
      // Set refresh token (longer-lived)
      Cookies.set("refresh_token", refresh, {
        ...cookieOptions,
        expires: rememberDays,
      });

      // Store token expiry times (calculate from JWT if needed)
      const refreshExpiry = new Date(Date.now() + rememberDays * 24 * 60 * 60 * 1000);
      Cookies.set("refresh_token_expires_at", refreshExpiry.toISOString(), cookieOptions);

      // Store basic user information in localStorage
      const basicUser = { email, role: "USER" };
      localStorage.setItem("currentUser", JSON.stringify(basicUser));
      localStorage.setItem("role", "USER");

      // Handle redirection
      if (redirect) {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          // Default redirect to dashboard
          router.push("/");
        }
      }

      return { ok: true, message: "Login successful", data };
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed";
      
      setError(msg);
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, login };
}