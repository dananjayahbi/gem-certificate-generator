"use client";

import { X } from "lucide-react";
import { User } from "@/services/userService";

interface ViewUserModalProps {
  user: User;
  onClose: () => void;
}

export default function ViewUserModal({ user, onClose }: ViewUserModalProps) {

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E9F0]">
          <h2 className="text-xl font-bold text-[#141824]">User Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F5F7FA] rounded transition-colors"
          >
            <X className="w-5 h-5 text-[#525B75]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-[#8A94AD] uppercase tracking-wider mb-1">
              Name
            </label>
            <p className="text-sm text-[#141824] font-medium">{user.name}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#8A94AD] uppercase tracking-wider mb-1">
              Email
            </label>
            <p className="text-sm text-[#525B75]">{user.email}</p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-[#8A94AD] uppercase tracking-wider mb-1">
              Role
            </label>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.role === "ADMIN"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {user.role}
            </span>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-[#8A94AD] uppercase tracking-wider mb-1">
              Status
            </label>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-[#E5E9F0]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-[#5C4099] hover:bg-[#4a3277] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
