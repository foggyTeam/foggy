'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import userStore from '@/app/stores/userStore';
import { observer } from 'mobx-react-lite';
import { getRequest } from '@/app/lib/utils/requests';
import { User } from 'next-auth';

const UserLoader = observer(() => {
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'authenticated' && session?.user) {
        const response: any[] = await getRequest('users');

        const userData: any = response.find(
          (user) => user['_id'] == session.user.id,
        );
        userStore.setUser({
          id: userData.id,
          name: userData.nickname,
          email: userData.email,
          image: userData.avatar,
        } as User);
      } else {
        userStore.clearUser();
      }
    };

    fetchUserData().catch((error) =>
      console.error('Failed to fetch user data: ', error),
    );
  }, [session, status]);

  return null;
});

export default UserLoader;
