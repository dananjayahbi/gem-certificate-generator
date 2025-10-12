"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (
    credentials: { email: string; password: string },
    options: { redirectTo?: string } = {}
  ) => {
    setLoading(true);
    setError(null);
    const redirectTo = options.redirectTo || "/";
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user) {
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userName", data.user.name || "");
        localStorage.setItem("userId", data.user.id);
      }

      router.push(redirectTo);
      router.refresh();

      return { ok: true, data };
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred during login";
      setError(errorMessage);
      return { ok: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
