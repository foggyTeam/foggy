import { Modal, ModalBody, ModalContent, useDisclosure } from '@heroui/modal';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import React, { ReactNode, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Team, TeamSettings } from '@/app/lib/types/definitions';
import { teamFormSchema } from '@/app/lib/types/schemas';
import IsFormValid from '@/app/lib/utils/isFormValid';
import { Form } from '@heroui/form';
import settingsStore from '@/app/stores/settingsStore';
import { Input } from '@heroui/input';
import { Checkbox } from '@heroui/checkbox';
import AreYouSureModal from '@/app/lib/components/modals/areYouSureModal';
import HandleImageUpload from '@/app/lib/utils/handleImageUpload';
import UploadAvatarButton from '@/app/lib/components/uploadAvatarButton';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import CheckAccess from '@/app/lib/utils/checkAccess';
import userStore from '@/app/stores/userStore';
import { deleteImage, uploadImage } from '@/app/lib/server/actions/handleImage';
import { addToast } from '@heroui/toast';
import teamsStore from '@/app/stores/teamsStore';
import {
  AddNewTeam,
  DeleteTeam,
  UpdateTeam,
} from '@/app/lib/server/actions/teamServerActions';

const TeamSettingsModal = observer(
  ({
    isOpen,
    onOpenChange,
    isNewTeam = false,
  }: {
    isOpen: boolean;
    onOpenChange: any;
    isNewTeam?: boolean;
  }) => {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const {
      isOpen: isDeleteTeamOpen,
      onOpen: onDeleteTeamOpen,
      onOpenChange: onDeleteTeamOpenChange,
    } = useDisclosure();
    const [errors, setErrors] = useState({} as any);

    const [name, setName] = useState<string>('');
    const [checkboxes, setCheckboxes] = useState<TeamSettings>(
      new TeamSettings(),
    );
    const [avatar, setAvatar] = useState<string>(
      isNewTeam ? '' : teamsStore.activeTeam?.avatar || '',
    );

    useEffect(() => {
      if (!isNewTeam && teamsStore.activeTeam) {
        setName(teamsStore.activeTeam.name);
        setCheckboxes(teamsStore.activeTeam.settings || new TeamSettings());
      } else if (!isNewTeam)
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.team.noActive,
        });
    }, [isNewTeam]);

    useEffect(() => {
      IsFormValid({ name }, teamFormSchema, setErrors);
    }, [name, setErrors]);

    const handleImageUpload = async (event: any) => {
      if (!userStore.user) return;
      const imageBlob = await HandleImageUpload(event);
      if (imageBlob) {
        const response = await uploadImage('teams_data', imageBlob);

        if ('url' in response && response.url) {
          if (avatar)
            await deleteImage(avatar).then((response) => {
              if ('error' in response)
                addToast({
                  color: 'warning',
                  severity: 'warning',
                  title: settingsStore.t.toasts.image.deleteImageWarning,
                });
            });
          setAvatar(response.url);
        } else
          addToast({
            color: 'danger',
            severity: 'danger',
            title: settingsStore.t.toasts.image.uploadImageError,
            description: response.error,
          });
      }
    };

    const deleteTeam = async () => {
      if (teamsStore.activeTeam) {
        try {
          await DeleteTeam(teamsStore.activeTeam.id);
          teamsStore.setActiveTeam(null);
          addToast({
            color: 'success',
            severity: 'success',
            title: settingsStore.t.toasts.team.deleteTeamSuccess,
          });
          router.push('/');
        } catch (e: any) {
          addToast({
            color: 'danger',
            severity: 'danger',
            title: settingsStore.t.toasts.team.deleteTeamError,
            description: e.toString(),
          });
        }
      } else {
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.team.noActive,
        });
      }
    };

    const onSubmit = async () => {
      if (!Object.keys(errors as any).length) {
        setIsSaving(true);
        const updatedData: Partial<Team> = {
          name: name,
          settings: { ...checkboxes },
        };
        if (avatar && teamsStore.activeTeam?.avatar !== avatar) {
          updatedData.avatar = avatar;
        }

        if (isNewTeam) {
          try {
            const result = await AddNewTeam(updatedData);
            if (
              Object.keys(result).findIndex(
                (element) => element === 'errors',
              ) !== -1
            ) {
              setErrors(result.errors);
            } else {
              if (!userStore.user) return;
              const newTeam = {
                id: result.data.id,
                members: [
                  {
                    id: userStore.user.id,
                    nickname: userStore.user.name,
                    avatar: userStore.user.image,
                    role: 'owner',
                  },
                ],
                ...updatedData,
              } as Team;
              teamsStore.addTeam(newTeam);

              router.push(`/team/${newTeam.id}`);
            }
          } catch (e: any) {
            addToast({
              color: 'danger',
              severity: 'danger',
              title: settingsStore.t.toasts.team.addTeamError,
              description: e.toString(),
            });
          }
        } else if (teamsStore.activeTeam) {
          try {
            const result = await UpdateTeam(
              teamsStore.activeTeam.id,
              updatedData,
            );
            if (
              Object.keys(result).findIndex(
                (element) => element === 'errors',
              ) !== -1
            ) {
              setErrors(result.errors);
              throw new Error(result.errors);
            } else {
              addToast({
                color: 'success',
                severity: 'success',
                title: settingsStore.t.toasts.team.updateTeamSuccess,
              });
            }
          } catch (e: any) {
            addToast({
              color: 'danger',
              severity: 'danger',
              title: settingsStore.t.toasts.team.updateTeamError,
              description: e.toString(),
            });
          }
        }
        setIsSaving(false);
      }
    };

    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
        <ModalContent className="flex w-full max-w-md gap-2 overflow-visible p-6">
          {() =>
            (
              <ModalBody className="flex h-fit w-full max-w-md gap-2 p-0">
                <Form className={'flex h-fit w-full min-w-24 flex-col gap-6'}>
                  <div className="items-top -mt-12 flex w-full justify-center">
                    <UploadAvatarButton
                      handleImageUpload={handleImageUpload}
                      name={name}
                      src={avatar}
                      classNames={{
                        icon: 'w-32 h-32',
                        avatar: 'w-32 h-32 border border-4 border-white',
                      }}
                      tooltipContent={
                        settingsStore.t.team.teamSettings.uploadAvatarHint
                      }
                    />
                  </div>
                  <div className="flex h-full w-full flex-col items-start gap-2">
                    <Input
                      isRequired
                      isInvalid={errors.name}
                      errorMessage={errors.name}
                      className="mb-1"
                      label={settingsStore.t.team.teamSettings.name}
                      labelPlacement="inside"
                      name="name"
                      size="md"
                      value={name}
                      onValueChange={setName}
                    />
                    <Checkbox
                      isSelected={checkboxes.allowRequests}
                      onValueChange={(value) =>
                        setCheckboxes({
                          ...checkboxes,
                          allowRequests: value,
                        })
                      }
                      size="sm"
                    >
                      {settingsStore.t.team.teamSettings.allowRequests}
                    </Checkbox>

                    <Checkbox
                      className="align-top"
                      isSelected={checkboxes.memberListIsPublic}
                      onValueChange={(value) =>
                        setCheckboxes({
                          ...checkboxes,
                          memberListIsPublic: value,
                        })
                      }
                      size="sm"
                    >
                      {settingsStore.t.team.teamSettings.memberListIsPublic}
                    </Checkbox>

                    <Checkbox
                      className="align-top"
                      isSelected={checkboxes.projectListIsPublic}
                      onValueChange={(value) =>
                        setCheckboxes({
                          ...checkboxes,
                          projectListIsPublic: value,
                        })
                      }
                      size="sm"
                    >
                      {settingsStore.t.team.teamSettings.projectListIsPublic}
                    </Checkbox>
                  </div>
                  <div
                    className={clsx(
                      'flex w-full items-center gap-2',
                      isNewTeam || !CheckAccess(['owner'], 'team')
                        ? 'justify-end'
                        : 'justify-between',
                    )}
                  >
                    {!isNewTeam && CheckAccess(['owner'], 'team') && (
                      <FButton
                        onPress={onDeleteTeamOpen}
                        isDisabled={isSaving}
                        variant="bordered"
                        color="danger"
                        size="md"
                      >
                        {settingsStore.t.team.teamSettings.deleteButton}
                      </FButton>
                    )}

                    <FButton
                      isLoading={isSaving}
                      isDisabled={!!Object.keys(errors).length}
                      onPress={onSubmit}
                      variant="solid"
                      color="primary"
                      size="md"
                    >
                      {isNewTeam
                        ? settingsStore.t.team.teamSettings.createButton
                        : settingsStore.t.team.teamSettings.saveButton}
                    </FButton>
                  </div>
                </Form>
                {isDeleteTeamOpen && (
                  <AreYouSureModal
                    header={settingsStore.t.team.deleteTeam.modalHeader}
                    description={
                      settingsStore.t.team.deleteTeam.modalDescription
                    }
                    sure={settingsStore.t.team.deleteTeam.modalSure}
                    dismiss={settingsStore.t.team.deleteTeam.modalDismiss}
                    isOpen={isDeleteTeamOpen}
                    onOpenChange={onDeleteTeamOpenChange}
                    action={deleteTeam}
                  />
                )}
              </ModalBody>
            ) as ReactNode
          }
        </ModalContent>
      </Modal>
    );
  },
);

export default TeamSettingsModal;
