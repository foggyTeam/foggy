'use client';

import { useEffect } from 'react';
import { User } from 'next-auth';
import userStore from '@/app/stores/userStore';
import { signOut } from 'next-auth/react';
import { clearUserSession } from '@/app/lib/server/actions/clearUserSession';

const UserLoader = ({ userData }: { userData: User | undefined }) => {
  useEffect(() => {
    if (userData && !userStore.isAuthenticated) {
      userStore.setUser(userData);
    } else if (userData && !userData?.id) {
      signOut({ redirectTo: '/login' }).catch((e) => console.error(e));
      userStore.clearUser();
      clearUserSession().catch((e) => console.error(e));
    }
  }, [userData]);

  return null;
};

export default UserLoader;
