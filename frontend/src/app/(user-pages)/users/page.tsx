import { getUsers, getUsersWithFollowStatus } from '@/app/actions/users';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  const users = await getUsersWithFollowStatus();
  console.log('users', users);

  return <UsersClient initialUsers={users} />;
}
