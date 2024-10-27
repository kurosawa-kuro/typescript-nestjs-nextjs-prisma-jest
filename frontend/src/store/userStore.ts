import { create } from 'zustand';
import { UserDetails } from '@/types/user';

interface UserStore {
  users: UserDetails[];
  setUsers: (users: UserDetails[]) => void;
  updateUserRole: (userId: number, newRole: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
  updateUserRole: (userId, newRole) => set((state) => ({
    users: state.users.map(user =>
      user.id === userId ? { ...user, userRoles: [newRole] } : user
    )
  })),
}));
