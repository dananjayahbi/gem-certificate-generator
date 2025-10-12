"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createUser, CreateUserData } from "@/services/userService";

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserModal({ onClose, onSuccess }: AddUserModalProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    role: "USER",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createUser(formData);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E9F0]">
          <h2 className="text-xl font-bold text-[#141824]">Add New User</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F5F7FA] rounded transition-colors"
          >
            <X className="w-5 h-5 text-[#525B75]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FEF3F2] border border-[#EF4444] rounded-lg text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#525B75] mb-1"
            >
              Name <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#E5E9F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4099] focus:border-transparent"
              placeholder="Enter user's name"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#525B75] mb-1"
            >
              Email <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#E5E9F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4099] focus:border-transparent"
              placeholder="user@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#525B75] mb-1"
            >
              Password <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-[#E5E9F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4099] focus:border-transparent"
              placeholder="Minimum 6 characters"
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-[#525B75] mb-1"
            >
              Role <span className="text-[#EF4444]">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#E5E9F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4099] focus:border-transparent"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Is Active */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-[#5C4099] border-[#E5E9F0] rounded focus:ring-2 focus:ring-[#5C4099]"
            />
            <label
              htmlFor="isActive"
              className="ml-2 text-sm font-medium text-[#525B75]"
            >
              Active User
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#525B75] hover:bg-[#F5F7FA] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#5C4099] hover:bg-[#4a3277] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
