import React, { useState } from 'react';
import { UserDetails } from '@/types/models';

interface RoleChangeModalProps {
  user: UserDetails;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRole: (userId: number, newRole: string) => Promise<void>;
}

export default function RoleChangeModal({ user, isOpen, onClose, onUpdateRole }: RoleChangeModalProps) {
  const [newRole, setNewRole] = useState(user.userRoles.includes('admin') ? 'admin' : 'general');

  const handleRoleChange = async () => {
    await onUpdateRole(user.id, newRole);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Change Role for {user.name}</h2>
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="general">General</option>
          <option value="admin">Admin</option>
        </select>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleRoleChange}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Update Role
          </button>
        </div>
      </div>
    </div>
  );
}
