'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { UserDetails } from '@/types/models';
import RoleChangeModal from './RoleChangeModal';
import { useUserStore } from '@/store/userStore';

interface UsersClientProps {
  initialUsers: UserDetails[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const { users, setUsers } = useUserStore();
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers, setUsers]);

  const handleOpenModal = (user: UserDetails) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Users</h1>
      <div className="max-w-6xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.profile?.avatarPath ? (
                    <Image
                      src={`http://localhost:3001/uploads/${user.profile.avatarPath}`}
                      alt={`${user.name}'s avatar`}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-sm">{user.name.charAt(0)}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.userRoles.includes('admin') ? 'Admin' : 'User'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Change Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedUser && (
        <RoleChangeModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
