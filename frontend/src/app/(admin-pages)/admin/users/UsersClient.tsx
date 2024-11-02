'use client';
import { useState, useEffect } from 'react';
import { UserDetails } from '@/types/user';
import { useUserStore } from '@/store/userStore';
import { UserTableHeader } from './components/UserTableHeader';
import { UserTableRow } from './components/UserTableRow';
import RoleChangeModal from './RoleChangeModal';

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
          <UserTableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onChangeRole={handleOpenModal}
              />
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
