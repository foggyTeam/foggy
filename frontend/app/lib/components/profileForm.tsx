'use client';

import { observer } from 'mobx-react-lite';
import { Form } from '@heroui/form';
import React, { useEffect, useState } from 'react';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';
import userStore from '@/app/stores/userStore';
import { Input, Textarea } from '@heroui/input';
import { ProfileData } from '@/app/(pages)/(main)/profile/page';
import { Checkbox } from '@heroui/checkbox';
import { profileFormSchema } from '@/app/lib/types/schemas';
import AreYouSureModal from '@/app/lib/components/modals/areYouSureModal';
import { useDisclosure } from '@heroui/modal';
import IsFormValid from '@/app/lib/utils/isFormValid';
import HandleImageUpload from '@/app/lib/utils/handleImageUpload';
import UploadAvatarButton from '@/app/lib/components/uploadAvatarButton';
import { deleteImage, uploadImage } from '@/app/lib/server/actions/handleImage';
import {
  DeleteUserById,
  SignUserOut,
  UpdateUserData,
} from '@/app/lib/server/actions/userServerActions';
import { addToast } from '@heroui/toast';

const ProfileForm = observer((userData: ProfileData) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
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
    IsFormValid({ nickname, email, about }, profileFormSchema, setErrors);
  }, [nickname, email, about]);

  const handleImageUpload = async (event: any) => {
    setIsAvatarLoading(true);
    const initialURL = userStore.user?.image;

    const imageBlob = await HandleImageUpload(event);
    if (imageBlob && userStore.user) {
      const response = await uploadImage('avatar', imageBlob);

      if ('url' in response) {
        await UpdateUserData({
          avatar: response.url,
        }).then((result) => {
          if (
            Object.keys(result).findIndex((element) => element === 'errors') !==
            -1
          )
            addToast({
              color: 'danger',
              severity: 'danger',
              title: settingsStore.t.toasts.globalError,
            });
          else userStore.updateUserData({ image: response.url });
        });
      } else
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.globalError,
        });
    }
    setIsAvatarLoading(false);

    await clearImage(initialURL);
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

      await UpdateUserData(updatedData)
        .then((result) => {
          if (
            Object.keys(result).findIndex((element) => element === 'errors') !==
            -1
          ) {
            setErrors(result.errors);
            addToast({
              color: 'danger',
              severity: 'danger',
              title: settingsStore.t.toasts.user.updateUserDataError,
            });
          }
        })
        .finally(() => setIsSaving(false));
    }
  };

  const onSignOut = async () => {
    await SignUserOut();
  };

  const deleteAccount = async () => {
    await DeleteUserById().then((result) => {
      if (
        Object.keys(result).findIndex((element) => element === 'errors') !== -1
      )
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.user.deleteUserSuccess,
        });
    });
    await onSignOut();
  };

  const clearImage = async (initialURL: string | null | undefined) => {
    if (userStore.user?.image !== initialURL && initialURL)
      await deleteImage(initialURL).then((response) => {
        if ('error' in response)
          addToast({
            color: 'danger',
            severity: 'danger',
            title: settingsStore.t.toasts.user.deleteUserImageError,
          });
      });
  };

  return (
    <>
      <Form className={'flex w-[736px] min-w-24 flex-col gap-6'}>
        <div className="items-top flex w-full justify-between gap-2">
          <UploadAvatarButton
            isLoading={isAvatarLoading}
            handleImageUpload={handleImageUpload}
            name={userStore.user?.name as string}
            src={userStore.user?.image as string}
            tooltipContent={settingsStore.t.profile.uploadAvatarHint}
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
      {isOpen && (
        <AreYouSureModal
          header={settingsStore.t.profile.deleteAccount.modalHeader}
          description={settingsStore.t.profile.deleteAccount.modalDescription}
          sure={settingsStore.t.profile.deleteAccount.modalSure}
          dismiss={settingsStore.t.profile.deleteAccount.modalDismiss}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          action={deleteAccount}
        />
      )}
    </>
  );
});

export default ProfileForm;
