import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import React from 'react';
import ProfileForm from '@/app/lib/components/profileForm';
import { getRequest } from '@/app/lib/server/requests';
import { cookies } from 'next/headers';
import { decrypt } from '@/app/lib/session';
import ProfileFormSkeleton from '@/app/lib/components/skeletons/profileFormSkeleton';

export interface ProfileData {
  nickname: string;
  email: string;
  avatar: string;
  about: string;
  teamInvitations: boolean;
  projectNotifications: boolean;
  emailNotifications: boolean;
}
async function getUserData() {
  const cookie = (await cookies()).get('session' as any)?.value;
  const session = await decrypt(cookie);

  if (!session) {
    return null;
  }

  const response = await getRequest('users/' + session.userId);

  const userData = {
    nickname: response.nickname,
    avatar: response.avatar,
    email: response.email,
    about: response.profileDescription,
    teamInvitations: response.settings.teamNotifications,
    projectNotifications: response.settings.projectNotifications,
    emailNotifications: response.settings.emailNotifications,
  } as ProfileData;

  return userData ? userData : null;
}

export default async function Profile() {
  const userData = await getUserData();
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div
        className={clsx(
          'flex h-fit w-auto flex-col items-center justify-center',
          bg_container,
          'rounded-bl-[64px] px-12',
        )}
      >
        {userData ? <ProfileForm {...userData} /> : <ProfileFormSkeleton />}
      </div>
    </div>
  );
}
