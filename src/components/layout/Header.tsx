"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { User, LogOut, Menu } from "lucide-react";
import useLogout from "@/app/(auth)/signout/hooks/useLogout";

export default function Header({ onMobileMenuToggle, sidebarCollapsed }: any) {
  const [isMounted, setIsMounted] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout, loading } = useLogout();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    await logout({ redirectTo: "/signout" });
  };

  if (!isMounted) {
    return (
      <header className="h-16 bg-white border-b border-[#E5E9F0] flex items-center">
        {/* Placeholder for mobile menu */}
        <div className="w-16 border-r border-[#E5E9F0]"></div>

        {/* Desktop logo area */}
        <div
          className={`${
            sidebarCollapsed ? "w-24" : "w-[250px]"
          } items-center justify-center border-r border-[#E5E9F0] transition-all duration-300 hidden lg:flex`}
        >
          <Image
            src="/images/component_icons/header/header_logo.png"
            alt="D&O Admin Panel"
            width={120}
            height={32}
            className="object-contain"
          />
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center pl-2 md:pl-4 flex-1">
          <Image
            src="/images/component_icons/header/header_logo.png"
            alt="Certificate Generator"
            width={80}
            height={24}
            className="object-contain"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Profile placeholder */}
        <div className="flex items-center gap-3 pr-3 md:pr-4 lg:pr-6">
          <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-[#F5F7FA]"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 bg-white border-b border-[#E5E9F0] flex items-center">
      {/* Mobile hamburger menu - only visible on mobile */}
      <div className="lg:hidden flex items-center justify-center w-12 md:w-16 border-r border-[#E5E9F0]">
        <button
          onClick={onMobileMenuToggle}
          className="w-6 md:w-8 h-6 md:h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F7FA] transition-colors"
        >
          <Menu className="w-5 h-5 text-[#525B75]" />
        </button>
      </div>

      {/* Left side - Logo container with width synced to sidebar (hidden on mobile) */}
      <div
        className={`hidden lg:flex ${
          sidebarCollapsed ? "w-24" : "w-[250px]"
        } items-center justify-center border-r border-[#E5E9F0] transition-all duration-300`}
      >
        {!sidebarCollapsed ? (
          <Image
            src="/images/component_icons/header/header_logo.png"
            alt="D&O Admin Panel"
            width={120}
            height={32}
            className="object-contain"
          />
        ) : (
          <Image
            src="/images/component_icons/header/logo-collapsed.svg"
            alt="D&O Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        )}
      </div>

      {/* Mobile logo - positioned after hamburger menu */}
      <div className="lg:hidden flex items-center pl-2 md:pl-4 flex-1">
        <Image
          src="/images/component_icons/header/header_logo.png"
          alt="Certificate Generator"
          width={80}
          height={24}
          className="object-contain md:w-[100px] md:h-[28px]"
        />
      </div>

      {/* Spacer - takes remaining space */}
      <div className="flex-1"></div>

      {/* Right side - Profile Icon */}
      <div className="flex items-center gap-3 pr-3 md:pr-4 lg:pr-6">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center bg-[#F5F7FA] hover:ring-2 hover:ring-[#3874FF] hover:ring-opacity-30 transition-all"
          >
            <User className="w-5 h-5 text-[#525B75]" />
          </button>

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E5E9F0] rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full text-left px-4 py-2 text-sm text-[#525B75] hover:bg-[#F5F7FA] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {loading ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
