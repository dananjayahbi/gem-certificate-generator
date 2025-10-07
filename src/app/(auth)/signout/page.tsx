'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SignOutPage() {
  const router = useRouter()

  const handleGoToLogin = () => {
    router.push('/login')
  }

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

        {/* Right Side - Come Back Soon */}
        <div className="w-[740px] flex flex-col items-center justify-center bg-white" style={{ padding: '48px 0', gap: '48px' }}>
          {/* Bird Icon */}
          <div className="w-[122px] h-[94px] flex items-center justify-center">
            <div className="relative w-[122px] h-[94px]">
              <Image
                src="/images/auth/bird-illustration.png"
                alt="Bird Illustration"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Title and Button */}
          <div className="flex flex-col items-center" style={{ gap: '42px' }}>
            {/* Title and Subtitle */}
            <div className="text-center space-y-1">
              <h2 className="text-[20px] font-bold leading-[1.2] text-[#222834] font-nunito" style={{ letterSpacing: '-0.03em' }}>
                Come back soon!
              </h2>
              <p className="text-[16px] font-normal leading-[1.5] text-[#525B75] font-nunito">
                Thanks for using Phoenix. You are now successfully signed out.
              </p>
            </div>

            {/* Go to Login Button */}
            <button
              onClick={handleGoToLogin}
              className="bg-[#5C4099] text-white rounded-md py-[11px] px-6 text-[12.8px] font-bold leading-[1.2] font-nunito hover:bg-[#4a3380] transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-[12.8px] h-[12.8px]" />
              <span>Go to login page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
