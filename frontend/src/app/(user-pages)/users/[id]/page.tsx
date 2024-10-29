import { getUserDetails } from '@/app/actions/users';
import UserProfileClient from './UserProfileClient';
import { headers } from 'next/headers';

export default async function UserProfilePage({ params }: { params: { id: string } }): Promise<JSX.Element> {
  const paramsId = parseInt(params.id);

  try {
    const userDetails = await getUserDetails(paramsId);
    console.log('UserProfilePage userDetails', userDetails);

    if (!userDetails) {
      return <div>User details not found</div>;
    }
    return <UserProfileClient initialUserDetails={userDetails} />;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return <div>Error loading user details</div>;
  }
}
