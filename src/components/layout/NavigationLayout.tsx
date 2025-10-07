'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Header from './Header'

export default function NavigationLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Check if current page is an auth page
  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/signout') || 
                     pathname.startsWith('/reset-password')

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // If it's an auth page, render children without navigation
  if (isAuthPage) {
    return children
  }

  // For all other pages, render with navigation
  return (
    <div className="h-screen bg-[#F5F7FA] overflow-hidden relative">
      {/* Header - positioned absolutely to span full width */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <Header onMobileMenuToggle={toggleMobileMenu} sidebarCollapsed={sidebarCollapsed} />
      </div>

      {/* Sidebar and Main Content */}
      <div className="flex h-full pt-16">
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          mobileOpen={mobileMenuOpen}
          onMobileToggle={toggleMobileMenu}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
