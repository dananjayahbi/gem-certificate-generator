"use client";

import { useState } from "react";
import { User, Lock, Mail, Shield, Calendar } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { updateProfile, UpdateProfileData } from "@/services/profileService";
import PageLoader from "@/components/ui/PageLoader";

export default function UserProfilePage() {
  const { profile, loading, refetch } = useProfile();
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [infoForm, setInfoForm] = useState({
    name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleEditInfo = () => {
    if (profile) {
      setInfoForm({
        name: profile.name || "",
        email: profile.email,
      });
      setIsEditingInfo(true);
    }
  };

  const handleCancelEditInfo = () => {
    setIsEditingInfo(false);
    setInfoForm({ name: "", email: "" });
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setUpdating(true);

    try {
      const updateData: UpdateProfileData = {
        name: infoForm.name,
        email: infoForm.email,
      };

      await updateProfile(updateData);
      setMessage({ type: "success", text: "Profile updated successfully" });
      setIsEditingInfo(false);
      refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setUpdating(true);

    try {
      await updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage({ type: "success", text: "Password changed successfully" });
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to change password";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader text="Loading profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#EF4444]">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#141824] mb-2">
            User Profile
          </h1>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Profile Header with Gold Accent */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 md:p-8 border-b border-amber-100">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#141824]">
                  {profile.name || "User"}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      profile.role === "ADMIN"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {profile.role}
                  </span>
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      profile.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {profile.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#141824] flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Personal Information
              </h3>
              {!isEditingInfo && (
                <button
                  onClick={handleEditInfo}
                  className="px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingInfo ? (
              <form onSubmit={handleUpdateInfo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#525B75] mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={infoForm.name}
                    onChange={(e) =>
                      setInfoForm({ ...infoForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#525B75] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={infoForm.email}
                    onChange={(e) =>
                      setInfoForm({ ...infoForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updating ? "Updating..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditInfo}
                    className="px-4 py-2 text-sm font-medium text-[#525B75] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-[#8A94AD]">Name</p>
                    <p className="text-sm font-medium text-[#141824]">
                      {profile.name || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-[#8A94AD]">Email</p>
                    <p className="text-sm font-medium text-[#141824]">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-[#8A94AD]">Member Since</p>
                    <p className="text-sm font-medium text-[#141824]">
                      {formatDate(profile.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security Section */}
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#141824] flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" />
                Security
              </h3>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
                >
                  Change Password
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#525B75] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#525B75] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#525B75] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updating ? "Updating..." : "Change Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-[#525B75] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-[#525B75]">
                  Keep your account secure by using a strong password and changing
                  it regularly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
