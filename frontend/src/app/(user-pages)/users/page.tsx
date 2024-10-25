import { getUsers } from '@/app/actions/users';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  const users = await getUsers();
  console.log('users', users);

  return <UsersClient initialUsers={users} />;
}
