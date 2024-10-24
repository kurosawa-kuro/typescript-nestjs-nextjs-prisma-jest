import { getUserDetails } from '@/app/actions/users';
import UserProfileClient from './UserProfileClient';
import { headers } from 'next/headers';

export default async function UserProfilePage() {
  const userId = getUserIdFromHeaders();
  
  if (!userId) {
    return <div>User ID not found</div>;
  }

  try {
    console.log('userId', userId);
    const userDetails = await getUserDetails(userId);
    console.log('userDetails', userDetails);
    if (!userDetails) {
      return <div>User details not found</div>;
    }
    return <UserProfileClient initialUserDetails={userDetails} />;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return <div>Error loading user details</div>;
  }
}

function getUserIdFromHeaders(): number | null {
  const headersList = headers();
  const userDataString = headersList.get('x-user-data');
  
  if (!userDataString) {
    return null;
  }

  try {
    const userData = JSON.parse(userDataString);
    return typeof userData.id === 'number' ? userData.id : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}
