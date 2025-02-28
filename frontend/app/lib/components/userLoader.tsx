'use client';

import { useEffect } from 'react';
import { User } from 'next-auth';
import userStore from '@/app/stores/userStore';
import { signOut } from 'next-auth/react';
import { clearUserSession } from '@/app/lib/server/actions/clearUserSession';

const UserLoader = async ({ userData }: { userData: User | null }) => {
  useEffect(() => {
    if (userData && !userStore.isAuthenticated) {
      userStore.setUser(userData);
    } else {
      signOut({ redirectTo: '/login' });
      userStore.clearUser();
      clearUserSession();
    }
  }, [userData]);

  return null;
};

export default UserLoader;
