'use client';

import { useEffect } from 'react';
import { User } from 'next-auth';
import userStore from '@/app/stores/userStore';

const UserLoader = ({ userData }: { userData: User | null }) => {
  useEffect(() => {
    if (userData && !userStore.isAuthenticated) {
      userStore.setUser(userData);
    }
  }, [userData]);

  return null;
};

export default UserLoader;
