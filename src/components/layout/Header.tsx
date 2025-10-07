"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Search, Bell, Sun, Moon, Grid3x3, User, LogOut, Menu } from "lucide-react";
import useLogout from "@/app/(auth)/signout/hooks/useLogout";

export default function Header({ onMobileMenuToggle, sidebarCollapsed }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef(null);
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

        {/* Rest of header */}
        <div className="flex-1 flex items-center justify-end px-6 gap-4">
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F7FA] transition-colors">
              <Search className="w-4 h-4 text-[#525B75]" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F7FA] transition-colors">
              <Bell className="w-4 h-4 text-[#525B75]" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F7FA] transition-colors">
              {isDarkMode ? (
                <Moon className="w-4 h-4 text-[#525B75]" />
              ) : (
                <Sun className="w-4 h-4 text-[#525B75]" />
              )}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-6 md:w-8 h-6 md:h-8 mt-2 rounded-full flex items-center justify-center bg-[#F5F7FA] hover:ring-2 hover:ring-[#3874FF] hover:ring-opacity-30 transition-all"
              >
                <User className="w-4 h-4 text-[#525B75]" />
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
          alt="D&O Admin Panel"
          width={80}
          height={24}
          className="object-contain md:w-[100px] md:h-[28px]"
        />
      </div>

      {/* Center - Search Bar (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 justify-center px-6">
        <div className="relative w-full max-w-md">
          <div className="flex items-center bg-[#F5F7FA] rounded-xl px-4 py-2.5 gap-3 w-full">
            <Search className="w-4 h-4 text-[#8A94AD]" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm text-[#525B75] placeholder-[#8A94AD] flex-1"
            />
          </div>
        </div>
      </div>

      {/* Right side - Icons */}
      <div className="flex items-center gap-1 md:gap-2 lg:gap-3 pr-3 md:pr-4 lg:pr-6">
        {/* Search button for mobile */}
        <button className="lg:hidden w-6 md:w-8 h-6 md:h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F7FA] transition-colors">
          <Search className="w-4 h-4 text-[#525B75]" />
        </button>

        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-6 md:w-8 h-6 md:h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F7FA] transition-colors"
        >
          {isDarkMode ? (
            <Moon className="w-4 h-4 text-[#525B75]" />
          ) : (
            <Sun className="w-4 h-4 text-[#525B75]" />
          )}
        </button>

        <button className="w-6 md:w-8 h-6 md:h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F7FA] transition-colors">
          <Bell className="w-4 h-4 text-[#525B75]" />
        </button>

        <button className="hidden sm:flex w-6 md:w-8 h-6 md:h-8 items-center justify-center rounded-lg hover:bg-[#F5F7FA] transition-colors">
          <Grid3x3 className="w-4 h-4 text-[#525B75]" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center bg-[#F5F7FA] hover:ring-2 hover:ring-[#3874FF] hover:ring-opacity-30 transition-all"
          >
            <User className="w-4 h-4 text-[#525B75]" />
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
