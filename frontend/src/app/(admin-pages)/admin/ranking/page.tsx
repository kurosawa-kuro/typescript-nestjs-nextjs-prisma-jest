import { getUserDetails } from '@/app/actions/users';
import { getMicropostRanking } from '@/app/actions/micropost';
import { headers } from 'next/headers';
import RankingClient from './RankingClient';

export default async function AdminPage() {
  const userId = getUserIdFromHeaders();
  
  if (!userId) {
    return <div>User ID not found</div>;
  }

  try {
    const [userDetails, rankingData] = await Promise.all([
      getUserDetails(userId),
      getMicropostRanking()
    ]);

    if (!userDetails) {
      return <div>User details not found</div>;
    }

    if (!userDetails.userRoles.includes('admin')) {
      return <div>Access denied. Admin privileges required.</div>;
    }

    return <RankingClient rankingData={rankingData} />;
  } catch (error) {
    console.error('Error loading data:', error);
    return <div>Error loading data</div>;
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
