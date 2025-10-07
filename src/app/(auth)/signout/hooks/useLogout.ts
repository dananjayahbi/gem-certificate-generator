"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function useLogout() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const logout = async (options: { redirectTo?: string } = {}) => {
    setLoading(true);
    const redirectTo = options.redirectTo || "/login";

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      localStorage.clear();
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
}
