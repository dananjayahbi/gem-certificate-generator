'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-[#CBD0DD] p-6 flex max-w-7xl w-full max-h-[720px]" style={{ gap: '72px' }}>
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
                <p className="text-[16px] font-semibold leading-[1.5] text-[#525B75] font-nunito w-[309px]" style={{ letterSpacing: '-0.01em' }}>
                  Login to Certificate Generator Admin Panel to create and manage digital certificates for your organization.
                </p>
              </div>
            </div>
            
            {/* Spacer to push content to top */}
            <div></div>
          </div>
        </div>

        {/* Right Side - Lock Screen */}
        <div className="w-[740px] flex flex-col items-center justify-center bg-white" style={{ padding: '48px 0', gap: '48px' }}>
          {/* User Avatar and Info */}
          <div className="flex flex-col items-center" style={{ gap: '24px' }}>
            {/* Avatar */}
            <div className="relative w-24 h-24">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src="/images/auth/user_icon_temporary.png"
                  alt="John Smith Avatar"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
              {/* Active status indicator */}
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            
            {/* User Info */}
            <div className="text-center space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-[25px] font-normal leading-[1.2] text-[#222834] font-nunito">Hello</span>
                <span className="text-[25px] font-extrabold leading-[1.2] text-[#222834] font-nunito">John Smith</span>
              </div>
              <p className="text-[16px] font-normal leading-[1.5] text-[#525B75] font-nunito">
                Enter your password to access the admin
              </p>
            </div>
          </div>

          {/* Input and Button */}
          <div className="flex flex-col gap-4 w-[302px]">
            {/* Password Input */}
            <div className="relative">
              <div className="flex items-center bg-white border border-[#CBD0DD] rounded-md px-4 py-[11px] gap-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 text-[12.8px] font-semibold leading-[1.2] text-[#8A94AD] placeholder-[#8A94AD] font-nunito bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex-shrink-0"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-5 text-[#525B75]" />
                  ) : (
                    <Eye className="w-4 h-5 text-[#525B75]" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-[#5C4099] text-white rounded-md py-[11px] px-6 text-[12.8px] font-bold leading-[1.2] font-nunito hover:bg-[#4a3380] transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
