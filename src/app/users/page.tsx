"use client";

import { useState, useEffect } from "react";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/services/userService";
import AddUserModal from "./components/AddUserModal";
import EditUserModal from "./components/EditUserModal";
import ViewUserModal from "./components/ViewUserModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

export default function UsersPage() {
  const { users, loading, refetch } = useUsers();
  const [currentUserId, setCurrentUserId] = useState<string>("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // Get current user ID from localStorage
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      setCurrentUserId(userEmail);
    }
  }, []);

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleUserAdded = () => {
    refetch();
    setShowAddModal(false);
  };

  const handleUserUpdated = () => {
    refetch();
    setShowEditModal(false);
  };

  const handleUserDeleted = () => {
    refetch();
    setShowDeleteModal(false);
  };

  const isCurrentUser = (userEmail: string) => {
    return userEmail === currentUserId;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#141824]">
          Users Management
        </h1>
        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 px-4 py-2 bg-[#5C4099] text-white rounded-lg hover:bg-[#4a3277] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-[#8A94AD]">Loading users...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E9F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F7FA] border-b border-[#E5E9F0]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#525B75] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#525B75] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#525B75] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#525B75] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#525B75] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9F0]">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-[#8A94AD]"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isCurrent = isCurrentUser(user.email);
                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-[#F5F7FA] ${
                          isCurrent ? "bg-[#FEF3F2] opacity-60" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-[#141824]">
                          {user.name}
                          {isCurrent && (
                            <span className="ml-2 text-xs text-[#8A94AD]">
                              (You)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#525B75]">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "ADMIN"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View User"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              disabled={isCurrent}
                              className={`p-1.5 rounded transition-colors ${
                                isCurrent
                                  ? "text-[#8A94AD] cursor-not-allowed opacity-50"
                                  : "text-orange-600 hover:bg-orange-50"
                              }`}
                              title={
                                isCurrent
                                  ? "Cannot edit your own account here"
                                  : "Edit User"
                              }
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              disabled={isCurrent}
                              className={`p-1.5 rounded transition-colors ${
                                isCurrent
                                  ? "text-[#8A94AD] cursor-not-allowed opacity-50"
                                  : "text-red-600 hover:bg-red-50"
                              }`}
                              title={
                                isCurrent
                                  ? "Cannot delete your own account"
                                  : "Delete User"
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleUserAdded}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleUserUpdated}
        />
      )}

      {showViewModal && selectedUser && (
        <ViewUserModal
          user={selectedUser}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {showDeleteModal && selectedUser && (
        <DeleteConfirmModal
          user={selectedUser}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleUserDeleted}
        />
      )}
    </div>
  );
}
