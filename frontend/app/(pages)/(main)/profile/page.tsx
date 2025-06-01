import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import React from 'react';
import ProfileForm from '@/app/lib/components/profileForm';
import ProfileFormSkeleton from '@/app/lib/components/skeletons/profileFormSkeleton';
import { GetUserById } from '@/app/lib/server/actions/userServerActions';

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
  try {
    const response = await GetUserById();

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
  } catch (error) {
    console.error('Произошла ошибка!', error);
  }
}

export default async function ProfilePage() {
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
