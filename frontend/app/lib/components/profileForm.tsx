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
import { Input, Textarea } from '@heroui/input';
import { ProfileData } from '@/app/(pages)/(main)/profile/page';
import { Checkbox } from '@heroui/checkbox';
import { profileFormSchema } from '@/app/lib/types/schemas';
import z from 'zod';
import { updateUserData } from '@/app/lib/server/actions/updateUserData';
import { deleteUserById } from '@/app/lib/server/actions/deleteUserById';
import { signUserOut } from '@/app/lib/server/actions/signUserOut';
import AreYouSureModal from '@/app/lib/components/areYouSureModal';
import { useDisclosure } from '@heroui/modal';

const ProfileForm = observer((userData: ProfileData) => {
  const [isSaving, setIsSaving] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [errors, setErrors] = useState({} as any);

  const [nickname, setNickname] = useState(userData.nickname);
  const [email, setEmail] = useState(userData.email);
  const [about, setAbout] = useState(userData.about);
  const [checkboxes, setCheckboxes] = useState({
    team: userData.teamInvitations,
    project: userData.projectNotifications,
    email: userData.emailNotifications,
  });

  useEffect(() => {
    setNickname(userData.nickname);
    setEmail(userData.email);
    setAbout(userData.about);
    setCheckboxes({
      team: userData.teamInvitations,
      project: userData.projectNotifications,
      email: userData.emailNotifications,
    });
  }, [userData]);

  useEffect(() => {
    isFormValid({ nickname, email, about });
  }, [nickname, email, about]);

  const isFormValid = (data: {
    nickname: string;
    email: string;
    about: string;
  }) => {
    try {
      profileFormSchema.parse(data);
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: any = {};
        e.errors.forEach((error) => {
          if (error.path.length > 0) {
            newErrors[error.path[0]] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const onSubmit = async () => {
    if (!Object.keys(errors as any).length) {
      setIsSaving(true);

      const updatedData = {
        ...(nickname !== userData.nickname && {
          nickname: nickname,
        }),
        ...(about !== userData.about && {
          profileDescription: about,
        }),
        settings: {
          ...(checkboxes.email !== userData.emailNotifications && {
            emailNotifications: checkboxes.email,
          }),
          ...(checkboxes.project !== userData.projectNotifications && {
            projectNotifications: checkboxes.project,
          }),
          ...(checkboxes.team !== userData.teamInvitations && {
            teamNotifications: checkboxes.team,
          }),
        },
      };

      await updateUserData(userStore.user?.id, updatedData)
        .then((result) => {
          if (
            Object.keys(result).findIndex((element) => element === 'errors') !==
            -1
          ) {
            setErrors(result.errors);
            console.error(result);
          }
        })
        .finally(() => setIsSaving(false));
    }
  };

  const onSignOut = async () => {
    await signUserOut();
  };

  const deleteAccount = async () => {
    await deleteUserById(userStore.user?.id).then((result) => {
      if (
        Object.keys(result).findIndex((element) => element === 'errors') !== -1
      ) {
        console.error(result);
      }
    });
    await onSignOut();
  };

  return (
    <>
      <Form className={'flex w-[736px] min-w-24 flex-col gap-6'}>
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
              isInvalid={errors.nickname}
              errorMessage={errors.nickname}
              label={settingsStore.t.profile.nickname}
              labelPlacement="inside"
              name="nickname"
              type="nickname"
              autoComplete="nickname"
              size="md"
              value={nickname}
              onValueChange={setNickname}
              classNames={{ inputWrapper: 'bg-white' }}
            />
            <Input
              isReadOnly
              isInvalid={errors.email}
              errorMessage={errors.email}
              label={settingsStore.t.profile.email}
              labelPlacement="inside"
              name="email"
              type="email"
              autoComplete="email"
              size="md"
              value={email}
              classNames={{ inputWrapper: 'bg-white' }}
            />
          </div>
          <div className="flex h-full w-full flex-col">
            <Textarea
              isInvalid={errors.about}
              errorMessage={errors.about}
              maxRows={4}
              label={settingsStore.t.profile.about}
              labelPlacement="inside"
              name="about"
              type="about"
              autoComplete="about"
              size="md"
              value={about}
              onValueChange={setAbout}
              classNames={{
                inputWrapper: 'bg-white',
              }}
            />
          </div>
        </div>
        <div className="flex w-full justify-between gap-6">
          <div className="flex w-full flex-col gap-2">
            <Checkbox
              isSelected={checkboxes.team}
              onValueChange={(value) =>
                setCheckboxes({ ...checkboxes, team: value })
              }
              size="sm"
            >
              {settingsStore.t.profile.teamInvitations}
            </Checkbox>
            <Checkbox
              isSelected={checkboxes.project}
              onValueChange={(value) =>
                setCheckboxes({ ...checkboxes, project: value })
              }
              size="sm"
            >
              {settingsStore.t.profile.projectNotifications}
            </Checkbox>
          </div>
          <div className="flex w-full flex-col">
            <Checkbox
              className="align-top"
              isSelected={checkboxes.email}
              onValueChange={(value) =>
                setCheckboxes({ ...checkboxes, email: value })
              }
              size="sm"
            >
              {settingsStore.t.profile.emailNotifications}
            </Checkbox>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-2">
          <FButton
            onPress={onOpen}
            type={'button'}
            variant="bordered"
            color="danger"
            size="md"
          >
            {settingsStore.t.profile.deleteButton}
          </FButton>

          <FButton
            isLoading={isSaving}
            onPress={onSubmit}
            variant="solid"
            color="primary"
            size="md"
          >
            {settingsStore.t.profile.saveButton}
          </FButton>
        </div>
      </Form>
      <AreYouSureModal
        header={settingsStore.t.profile.deleteAccount.modalHeader}
        description={settingsStore.t.profile.deleteAccount.modalDescription}
        sure={settingsStore.t.profile.deleteAccount.modalSure}
        dismiss={settingsStore.t.profile.deleteAccount.modalDismiss}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        action={deleteAccount}
      />
    </>
  );
});

export default ProfileForm;
