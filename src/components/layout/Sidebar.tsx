'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Award, 
  FileText, 
  Users, 
  Settings, 
  Palette, 
  FolderOpen,
  UserCircle,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// Navigation configuration with Lucide React icons
const navigationGroups = [
  {
    title: '',
    items: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        href: '/',
        icon: Home
      }
    ]
  },
  {
    title: 'CERTIFICATES',
    items: [
      {
        id: 'all-certificates',
        name: 'All Certificates',
        href: '/certificates',
        icon: Award
      },
      {
        id: 'issue-certificate',
        name: 'Issue Certificate',
        href: '/certificates/create',
        icon: FileText
      },
      {
        id: 'certificate-template',
        name: 'Certificate Template',
        href: '/cert-design',
        icon: Palette
      }
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      {
        id: 'users',
        name: 'Users',
        href: '/users',
        icon: Users
      },
      {
        id: 'user-profile',
        name: 'User Profile',
        href: '/user-profile',
        icon: UserCircle
      }
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      {
        id: 'settings',
        name: 'Settings',
        href: '/settings',
        icon: Settings
      }
    ]
  }
]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileToggle }: any) {
  const pathname = usePathname()

  const isActiveRoute = (href: string) => {
    // Exact match for home/dashboard
    if (href === '/') {
      return pathname === '/';
    }
    // Exact match for all other routes
    return pathname === href;
  }

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-transparent backdrop-blur-xs z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative
        top-0 left-0
        bg-white 
        transition-all duration-300 
        z-50 lg:z-10 
        h-full 
        flex flex-col
        ${collapsed ? 'w-24' : 'w-[200px] md:w-[250px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Header */}
        <div className="lg:hidden border-b border-[#E5E9F0] p-3 md:p-4 flex items-center justify-between">
          <div className="flex items-center justify-center">
            <img
              src="/images/component_icons/header/header_logo.png"
              alt="Certificate Generator"
              className="w-auto md:w-auto h-6 md:h-8"
            />
          </div>
          <button
            onClick={onMobileToggle}
            className="p-1.5 md:p-2 hover:bg-[#F5F7FA] rounded-lg transition-colors"
          >
            <X className="w-5 md:w-6 h-5 md:h-6 text-[#525B75]" />
          </button>
        </div>

        {/* Navigation - Scrollable area */}
        <div className="flex-1 overflow-y-auto border-r border-[#E5E9F0]">
          <nav className="p-3 md:p-4">
            {navigationGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-4 md:mb-6">
                {group.title && !collapsed && (
                  <h3 className="text-xs font-semibold text-[#8A94AD] uppercase tracking-wider mb-2 md:mb-3 px-2">
                    {group.title}
                  </h3>
                )}
                <ul className="space-y-1">
                  {group.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <Link
                        href={item.href}
                        className={`flex items-center rounded-lg text-xs md:text-sm font-medium transition-colors ${
                          collapsed 
                            ? 'justify-center p-2 md:p-3' 
                            : 'gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2'
                        } ${
                          isActiveRoute(item.href)
                            ? 'bg-[#5C4099] text-white'
                            : 'text-[#525B75] hover:bg-[#F5F7FA] hover:text-[#141824]'
                        }`}
                        title={collapsed ? item.name : undefined}
                        onClick={() => {
                          if (mobileOpen) onMobileToggle()
                        }}
                      >
                        <item.icon
                          className={`flex-shrink-0 ${
                            collapsed 
                              ? 'w-5 md:w-6 h-5 md:h-6' 
                              : 'w-4 md:w-5 h-4 md:h-5'
                          }`}
                        />
                        {!collapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Collapse Button - Hidden on mobile */}
        <div className="hidden lg:block border-t border-r border-[#E5E9F0] p-4">
          <button
            onClick={onToggle}
            className={`w-full flex items-center rounded-lg hover:bg-[#F5F7FA] transition-colors text-[#525B75] ${
              collapsed ? 'justify-center p-3' : 'justify-center gap-3 px-3 py-2'
            }`}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
            {!collapsed && (
              <span className="text-sm font-medium">Collapse</span>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
