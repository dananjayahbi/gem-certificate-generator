"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { deleteUser, User } from "@/services/userService";

interface DeleteConfirmModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmModal({
  user,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "confirm") {
      setError('Please type "confirm" to proceed');
      return;
    }

    setError("");
    setLoading(true);

    try {
      await deleteUser(user.id);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isConfirmValid = confirmText === "confirm";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E9F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FEF3F2] rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            </div>
            <h2 className="text-xl font-bold text-[#141824]">Delete User</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F5F7FA] rounded transition-colors"
          >
            <X className="w-5 h-5 text-[#525B75]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FEF3F2] border border-[#EF4444] rounded-lg text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          <p className="text-sm text-[#525B75]">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>

          {/* User Info */}
          <div className="p-4 bg-[#F5F7FA] rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-[#8A94AD] uppercase w-16">
                Name:
              </span>
              <span className="text-sm text-[#141824] font-medium">
                {user.name}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-[#8A94AD] uppercase w-16">
                Email:
              </span>
              <span className="text-sm text-[#525B75]">{user.email}</span>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label
              htmlFor="confirmText"
              className="block text-sm font-medium text-[#525B75] mb-1"
            >
              Type <span className="font-bold text-[#EF4444]">confirm</span> to
              delete this user
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E9F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:border-transparent"
              placeholder="Type 'confirm'"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5E9F0]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#525B75] hover:bg-[#F5F7FA] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmValid || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
}
