'use client';

import { useEffect } from 'react';
import { User } from 'next-auth';
import userStore from '@/app/stores/userStore';
import { signOut } from 'next-auth/react';
import { ClearUserSession } from '@/app/lib/server/actions/userServerActions';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';

const UserLoader = ({ userData }: { userData: User | undefined }) => {
  useEffect(() => {
    if (userData && !userStore.isAuthenticated) {
      userStore.setUser(userData);
    } else if (userData && !userData?.id) {
      signOut({ redirectTo: '/login' }).catch(() =>
        addToast({
          severity: 'danger',
          title: settingsStore.t.toasts.signOutError,
        }),
      );
      userStore.clearUser();
      ClearUserSession().catch(() =>
        addToast({
          severity: 'danger',
          title: settingsStore.t.toasts.signOutError,
        }),
      );
    }
  }, [userData]);

  return null;
};

export default UserLoader;
