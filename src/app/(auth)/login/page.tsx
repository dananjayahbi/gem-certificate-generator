"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import useLogin from "./hooks/useLogin";
import { useToast } from "@/hooks/useToast";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { loading, error, login } = useLogin();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "error",
      });
      return;
    }

    const result = await login({ email, password });

    if (result.ok) {
      toast({
        title: "Welcome!",
        description: "Login successful",
        variant: "success",
      });
    } else {
      toast({
        title: "Login Failed",
        description: result.message || "Please check your credentials",
        variant: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
      <div
        className="bg-white rounded-2xl border border-[#CBD0DD] p-6 flex max-w-7xl w-full max-h-[720px]"
        style={{ gap: "72px" }}
      >
        {/* Left Side - Illustration */}
        <div className="w-[395px] h-[670px] relative bg-[#EFF2F6] rounded-lg overflow-hidden">
          {/* Full Background Illustration */}
          <Image
            src="/images/auth/Authentication- Card- Illusration.png"
            alt="Authentication Illustration"
            fill
            className="object-cover"
          />

          {/* Overlay Content */}
          <div className="absolute inset-0 p-12 pb-12 flex flex-col justify-between">
            {/* Logo and Title */}
            <div className="space-y-4 relative z-10">
              <div className="space-y-4">
                <h1 className="text-[25px] font-extrabold leading-[1.2] text-[#141824] font-nunito">
                  Certificate Generator
                </h1>
                <p
                  className="text-[16px] font-semibold leading-[1.5] text-[#525B75] font-nunito w-[309px]"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  Login to Certificate Generator Admin Panel to create and manage digital certificates for your organization.
                </p>
              </div>
            </div>

            {/* Spacer to push content to top */}
            <div></div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="w-[740px] flex items-center justify-center">
          <div className="w-full max-w-[400px] px-8">
            <div className="space-y-12">
              {/* Header with Logo and Title */}
              <div className="text-center space-y-6">
                {/* Phoenix Logo */}
                <div className="w-[50px] h-[50px] mx-auto relative">
                  <Image
                    src="/images/auth/auth_logo.svg"
                    alt="Phoenix Logo"
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Title */}
                <div className="space-y-0">
                  <h2 className="text-[25px] font-extrabold leading-[1.2] text-[#222834] font-nunito text-center">
                    Sign In
                  </h2>
                  <p className="text-[16px] font-normal leading-[1.5] text-[#525B75] font-nunito">
                    Get access to your account
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="block text-[10.24px] font-bold leading-[1.2] text-[#525B75] uppercase tracking-[0.02em] font-nunito pl-4">
                      EMAIL
                    </label>
                    <div className="relative">
                      <div className="flex items-center bg-white border border-[#CBD0DD] rounded-md px-4 py-[11px] gap-2">
                        <div className="w-3 h-3 relative flex-shrink-0">
                          <Image
                            src="/images/auth/email_icon.svg"
                            alt="Email Icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <input
                          type="email"
                          placeholder="Enter email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 text-[12.8px] font-semibold leading-[1.2] text-[#8A94AD] placeholder-[#8A94AD] font-nunito bg-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="block text-[10.24px] font-bold leading-[1.2] text-[#525B75] uppercase tracking-[0.02em] font-nunito pl-4">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <div className="flex items-center bg-white border-2 border-[#3874FF] rounded-md px-4 py-[11px] gap-2 shadow-[0px_0px_0px_4px_rgba(56,116,255,0.2)]">
                        <div className="w-3 h-3 relative flex-shrink-0">
                          <Image
                            src="/images/auth/password_icon.svg"
                            alt="Password Icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 flex items-center gap-1">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex-1 text-[12.8px] font-semibold leading-[1.2] text-[#31374A] font-nunito bg-transparent outline-none"
                          />
                          <div className="w-0.5 h-5 bg-[#3874FF] rounded-lg"></div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="flex-shrink-0"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-[#525B75]" />
                          ) : (
                            <Eye className="w-4 h-4 text-[#525B75]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end items-center">
                  <a href="#" className="text-[12.8px] font-semibold leading-[1.2] text-[#3874FF] font-nunito">
                    Forgot Password?
                  </a>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5C4099] text-white rounded-md py-[11px] px-6 text-[12.8px] font-bold leading-[1.2] font-nunito hover:bg-[#4a3380] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
