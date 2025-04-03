'use client';

import { observer } from 'mobx-react-lite';
import { Form } from '@heroui/form';
import React, { useEffect, useState } from 'react';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';
import { Avatar } from '@heroui/avatar';
import userStore from '@/app/stores/userStore';
import { User2Icon } from 'lucide-react';
import { Input } from '@heroui/input';
import { ProfileData } from '@/app/(pages)/(main)/profile/page';

const ProfileForm = observer((userData: ProfileData) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, changeFormData] = useState(userData);

  useEffect(() => {
    changeFormData(userData);
  }, [userData]);

  const onSubmit = () => {
    setIsSaving(!isSaving);
    console.log('saving..');
    // await blablabla
    setIsSaving(!isSaving);
  };

  const onSignOut = () => {
    console.log('sign out');
  };

  const onDeleteAccount = () => {
    console.log('delete');
  };

  return (
    <Form className={'flex w-fit min-w-24 flex-col gap-2'} onSubmit={onSubmit}>
      <div className="items-top flex w-full justify-between gap-2">
        <Avatar
          showFallback
          icon={<User2Icon className="h-72 w-72 stroke-default-200" />}
          name={userStore.user?.name as string}
          src={userStore.user?.image as string}
          size="lg"
          className="h-72 w-72"
          color="default"
        />
        <Button
          onPress={onSignOut}
          type={'button'}
          variant="light"
          size="md"
          color="secondary"
        >
          {settingsStore.t.profile.signOutButton}
        </Button>
      </div>
      <div className="flex w-full justify-between gap-2">
        <div className="flex w-full flex-col gap-1">
          <Input
            isRequired
            label={settingsStore.t.profile.nickname}
            labelPlacement="inside"
            name="nickname"
            type="nickname"
            autoComplete="nickname"
            size="md"
            value={formData.nickname}
            onValueChange={(value) =>
              changeFormData({ ...formData, nickname: value })
            }
            classNames={{ inputWrapper: 'bg-white' }}
          />
        </div>
        <div></div>
      </div>
      <div>checkboxes</div>
      <div className="flex w-full items-center justify-between gap-2">
        <FButton
          onPress={onDeleteAccount}
          type={'button'}
          variant="bordered"
          color="danger"
          size="md"
        >
          {settingsStore.t.profile.deleteButton}
        </FButton>

        <FButton
          isLoading={isSaving}
          type="submit"
          variant="solid"
          color="primary"
          size="md"
        >
          {settingsStore.t.profile.saveButton}
        </FButton>
      </div>
    </Form>
  );
});

export default ProfileForm;
