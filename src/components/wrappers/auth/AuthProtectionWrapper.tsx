"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import FallbackLoading from "./FallbackLoading";

const AuthProtectionWrapper = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      setLoading(true);

      // Allow access to auth pages without validation
      if (pathname.startsWith('/login') || pathname.startsWith('/signout')) {
        setLoading(false);
        return;
      }

      // Check if user is logged in (simple check via localStorage)
      const userEmail = localStorage.getItem("userEmail");
      const role = localStorage.getItem("role");

      if (!userEmail || !role) {
        // Not logged in, redirect to login
        router.push("/login");
        return;
      }

      setLoading(false);
    };

    checkAuthentication();
  }, [pathname, router]);

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

  // For protected routes, ensure user is logged in
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    return <FallbackLoading />;
  }

  return (
    <Suspense fallback={<FallbackLoading />}>
      {children}
    </Suspense>
  );
};

export default AuthProtectionWrapper;
