import { useUserStore } from '@/store/userStore';
import { UserDetails } from '@/types/user';

describe('UserStore', () => {
  // 各テストの前にストアをリセット
  beforeEach(() => {
    useUserStore.setState({ users: [] });
  });

  // テストユーザーデータ
  const mockUsers: UserDetails[] = [
    {
      id: 1,
      name: 'User 1',
      email: 'user1@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: ['user'],
      profile: {
        avatarPath: '/avatar1.jpg',
      }
    },
    {
      id: 2,
      name: 'User 2',
      email: 'user2@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: ['user'],
      profile: {
        avatarPath: '/avatar2.jpg',
      }
    }
  ];

  // setUsersのテスト
  test('setUsers should update users state', () => {
    const { setUsers } = useUserStore.getState();
    setUsers(mockUsers);
    
    expect(useUserStore.getState().users).toEqual(mockUsers);
  });

  // updateUserRoleのテスト
  test('updateUserRole should update role for specific user', () => {
    // 初期ユーザーを設定
    const { setUsers, updateUserRole } = useUserStore.getState();
    setUsers(mockUsers);

    // User 1のロールを更新
    const newRole = 'admin';
    updateUserRole(1, newRole);

    // 更新された状態を検証
    const updatedUsers = useUserStore.getState().users;
    expect(updatedUsers[0].userRoles).toEqual([newRole]);
    // 他のユーザーは変更されていないことを確認
    expect(updatedUsers[1].userRoles).toEqual(['user']);
  });

  // 存在しないユーザーのupdateUserRoleのテスト
  test('updateUserRole should not affect users when userId does not exist', () => {
    const { setUsers, updateUserRole } = useUserStore.getState();
    setUsers(mockUsers);

    // 存在しないユーザーIDでロール更新を試みる
    updateUserRole(999, 'admin');

    // ユーザー一覧が変更されていないことを確認
    expect(useUserStore.getState().users).toEqual(mockUsers);
  });
});
