'use client';

import { observer } from 'mobx-react-lite';
import { Form } from '@heroui/form';
import React, { useEffect, useState } from 'react';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';
import { Avatar } from '@heroui/avatar';
import userStore from '@/app/stores/userStore';
import { Eye, EyeClosed, User2Icon } from 'lucide-react';
import { Input, Textarea } from '@heroui/input';
import { ProfileData } from '@/app/(pages)/(main)/profile/page';
import { Checkbox } from '@heroui/checkbox';

const ProfileForm = observer((userData: ProfileData) => {
  const [isSaving, setIsSaving] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordReadonly, setPasswordReadonly] = useState(false);
  const [errors, setErrors] = useState({} as any);

  const [formData, changeFormData] = useState(userData);

  useEffect(() => {
    changeFormData(userData);
    if (!userData.password) setPasswordReadonly(true);
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
    <Form
      className={'flex w-[736px] min-w-24 flex-col gap-6'}
      onSubmit={onSubmit}
    >
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
      <div className="flex w-full justify-between gap-6">
        <div className="flex h-fit w-full flex-col gap-2">
          <Input
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
          <Input
            label={settingsStore.t.profile.email}
            labelPlacement="inside"
            name="email"
            type="email"
            autoComplete="email"
            size="md"
            value={formData.email}
            onValueChange={(value) =>
              changeFormData({ ...formData, email: value })
            }
            classNames={{ inputWrapper: 'bg-white' }}
          />

          <Input
            isReadOnly={passwordReadonly}
            errorMessage={errors.password}
            description={
              passwordReadonly
                ? settingsStore.t.profile.passwordDescription
                : false
            }
            label={settingsStore.t.profile.password}
            labelPlacement="inside"
            placeholder={settingsStore.t.login.passwordPlaceholder}
            name="password"
            value={formData.password}
            onValueChange={(value) =>
              changeFormData({ ...formData, password: value })
            }
            type={passwordVisible ? 'text' : 'password'}
            endContent={
              <div className="flex items-center gap-2">
                <button
                  aria-label="clear field"
                  className="h-fit w-fit"
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? (
                    <Eye className="stroke-default-500" />
                  ) : (
                    <EyeClosed className="stroke-default-500" />
                  )}
                </button>
              </div>
            }
            size="md"
            autoComplete="current-password"
            classNames={{ inputWrapper: 'bg-white' }}
          />
        </div>
        <div className="flex h-full w-full flex-col">
          <Textarea
            maxRows={7}
            label={settingsStore.t.profile.about}
            labelPlacement="inside"
            name="about"
            type="about"
            autoComplete="about"
            size="md"
            value={formData.about}
            onValueChange={(value) =>
              changeFormData({ ...formData, about: value })
            }
            classNames={{
              inputWrapper: 'bg-white',
            }}
          />
        </div>
      </div>
      <div className="flex w-full justify-between gap-6">
        <div className="flex w-full flex-col gap-2">
          <Checkbox
            isSelected={formData.teamInvitations}
            onValueChange={(value) =>
              changeFormData({ ...formData, teamInvitations: value })
            }
            size="sm"
          >
            {settingsStore.t.profile.teamInvitations}
          </Checkbox>
          <Checkbox
            isSelected={formData.projectNotifications}
            onValueChange={(value) =>
              changeFormData({ ...formData, projectNotifications: value })
            }
            size="sm"
          >
            {settingsStore.t.profile.projectNotifications}
          </Checkbox>
        </div>
        <div className="flex w-full flex-col">
          <Checkbox
            className="align-top"
            isSelected={formData.emailNotifications}
            onValueChange={(value) =>
              changeFormData({ ...formData, emailNotifications: value })
            }
            size="sm"
          >
            {settingsStore.t.profile.emailNotifications}
          </Checkbox>
        </div>
      </div>
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
