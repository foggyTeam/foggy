import { Modal, ModalBody, ModalContent, useDisclosure } from '@heroui/modal';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import React, { ReactNode, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import projectsStore from '@/app/stores/projectsStore';
import {
  Project,
  ProjectSettings,
  TeamMember,
} from '@/app/lib/types/definitions';
import { projectFormSchema } from '@/app/lib/types/schemas';
import IsFormValid from '@/app/lib/utils/isFormValid';
import { Form } from '@heroui/form';
import settingsStore from '@/app/stores/settingsStore';
import { Input, Textarea } from '@heroui/input';
import { Checkbox } from '@heroui/checkbox';
import AreYouSureModal from '@/app/lib/components/modals/areYouSureModal';
import HandleImageUpload from '@/app/lib/utils/handleImageUpload';
import UploadAvatarButton from '@/app/lib/components/uploadAvatarButton';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import CheckAccess from '@/app/lib/utils/checkAccess';
import {
  AddNewProject,
  DeleteProject,
  UpdateProject,
} from '@/app/lib/server/actions/projectServerActions';
import userStore from '@/app/stores/userStore';
import { deleteImage, uploadImage } from '@/app/lib/server/actions/handleImage';
import { addToast } from '@heroui/toast';
import teamsStore from '@/app/stores/teamsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

const ProjectSettingsModal = observer(
  ({
    isOpen,
    onOpenChange,
    isNewProject = false,
    isTeamProject = false,
  }: {
    isOpen: boolean;
    onOpenChange: any;
    isNewProject?: boolean;
    isTeamProject?: boolean;
  }) => {
    const { commonSize, smallerSize } = useAdaptiveParams();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const {
      isOpen: isDeleteProjectOpen,
      onOpen: onDeleteProjectOpen,
      onOpenChange: onDeleteProjectOpenChange,
    } = useDisclosure();
    const [errors, setErrors] = useState({} as any);

    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [checkboxes, setCheckboxes] = useState<ProjectSettings>(
      new ProjectSettings(),
    );
    const [avatar, setAvatar] = useState<string>(
      isNewProject ? '' : projectsStore.activeProject?.avatar || '',
    );

    useEffect(() => {
      if (!isNewProject && projectsStore.activeProject) {
        setName(projectsStore.activeProject.name);
        setDescription(projectsStore.activeProject.description || '');
        setCheckboxes(
          projectsStore.activeProject.settings || new ProjectSettings(),
        );
      } else if (!isNewProject)
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.project.noActive,
        });
    }, [isNewProject]);

    useEffect(() => {
      IsFormValid({ name, description }, projectFormSchema, setErrors);
    }, [name, description, setErrors]);

    const handleImageUpload = async (event: any) => {
      if (!userStore.user) return;
      const imageBlob = await HandleImageUpload(event);
      if (imageBlob) {
        const response = await uploadImage('projects_data', imageBlob);

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

    const deleteProject = async () => {
      if (projectsStore.activeProject) {
        await DeleteProject(projectsStore.activeProject.id)
          .catch((error) =>
            addToast({
              color: 'danger',
              severity: 'danger',
              title: settingsStore.t.toasts.project.deleteProjectError,
              description: error,
            }),
          )
          .then(() => {
            projectsStore.setActiveProject(null);
            addToast({
              color: 'success',
              severity: 'success',
              title: settingsStore.t.toasts.project.deleteProjectSuccess,
            });
            router.push('/');
          });
      } else {
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.project.noActive,
        });
      }
    };

    const onSubmit = async () => {
      if (!Object.keys(errors as any).length) {
        setIsSaving(true);
        const updatedData: Partial<Project & { teamId: string }> = {
          name: name,
          description: description,
          settings: { ...checkboxes },
        };
        if (avatar && projectsStore.activeProject?.avatar !== avatar) {
          updatedData.avatar = avatar;
        }

        if (isNewProject) {
          if (isTeamProject) updatedData.teamId = teamsStore.activeTeam?.id;

          await AddNewProject(updatedData)
            .then((result) => {
              if (
                Object.keys(result).findIndex(
                  (element) => element === 'errors',
                ) !== -1
              ) {
                setErrors(result.errors);
              } else {
                if (!userStore.user) return;
                const projectMembers = (
                  isTeamProject
                    ? (teamsStore.activeTeam?.members ?? [])
                    : [
                        {
                          id: userStore.user.id,
                          nickname: userStore.user.name,
                          avatar: userStore.user.image,
                          role: 'owner',
                        },
                      ]
                ) as TeamMember[];
                const newProject = {
                  id: result.data.id,
                  members: [...projectMembers],
                  ...updatedData,
                } as Project;

                projectsStore.addProject(newProject);

                router.push(`/project/${newProject.id}`);
              }
            })
            .catch((error) =>
              addToast({
                color: 'danger',
                severity: 'danger',
                title: settingsStore.t.toasts.project.addProjectError,
                description: error,
              }),
            )
            .finally(() => setIsSaving(false));
        } else if (projectsStore.activeProject) {
          await UpdateProject(projectsStore.activeProject.id, updatedData)
            .then((result) => {
              if (
                Object.keys(result).findIndex(
                  (element) => element === 'errors',
                ) !== -1
              ) {
                setErrors(result.errors);
                addToast({
                  color: 'danger',
                  severity: 'danger',
                  title: settingsStore.t.toasts.project.updateProjectError,
                });
              } else {
                if (!projectsStore.activeProject) return;
                projectsStore.updateProject(
                  projectsStore.activeProject.id,
                  updatedData,
                );
                addToast({
                  color: 'success',
                  severity: 'success',
                  title: settingsStore.t.toasts.project.updateProjectSuccess,
                });
              }
            })
            .finally(() => setIsSaving(false));
        }
      }
    };

    return (
      <Modal
        data-testid="project-settings-modal"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
      >
        <ModalContent className="flex w-full max-w-2xl gap-2 overflow-visible p-6">
          {() =>
            (
              <ModalBody className="flex h-fit w-full max-w-2xl gap-2 p-0">
                <Form className="flex h-fit w-full min-w-24 flex-col gap-6">
                  <div className="items-top -mt-12 flex w-full justify-center sm:w-1/2">
                    <UploadAvatarButton
                      handleImageUpload={handleImageUpload}
                      name={name}
                      src={avatar}
                      classNames={{
                        icon: 'w-32 h-32',
                        avatar:
                          'w-32 h-32 border border-4 border-[hsl(var(--heroui-background))]',
                      }}
                      tooltipContent={
                        settingsStore.t.projects.projectSettings
                          .uploadAvatarHint
                      }
                    />
                  </div>
                  <div className="flex h-full w-full flex-wrap items-center justify-between gap-6 sm:flex-nowrap">
                    <div className="flex h-fit w-full flex-col gap-2">
                      <Input
                        isRequired
                        isInvalid={errors.name}
                        errorMessage={errors.name}
                        label={settingsStore.t.projects.projectSettings.name}
                        labelPlacement="inside"
                        name="name"
                        size={commonSize}
                        value={name}
                        onValueChange={setName}
                      />
                      <Textarea
                        isInvalid={errors.description}
                        errorMessage={errors.description}
                        maxRows={4}
                        label={
                          settingsStore.t.projects.projectSettings.description
                        }
                        labelPlacement="inside"
                        name="description"
                        type="description"
                        size={commonSize}
                        value={description}
                        onValueChange={setDescription}
                      />
                    </div>
                    <div className="flex h-fit w-full flex-col items-start justify-start gap-2">
                      <Checkbox
                        data-testid="allow-requests-chb"
                        isSelected={checkboxes.allowRequests}
                        onValueChange={(value) =>
                          setCheckboxes({
                            ...checkboxes,
                            allowRequests: value,
                          })
                        }
                        size={smallerSize}
                      >
                        {settingsStore.t.projects.projectSettings.allowRequests}
                      </Checkbox>
                      <Checkbox
                        data-testid="public-chb"
                        isSelected={checkboxes.isPublic}
                        onValueChange={(value) =>
                          setCheckboxes({ ...checkboxes, isPublic: value })
                        }
                        size={smallerSize}
                      >
                        {settingsStore.t.projects.projectSettings.isPublic}
                      </Checkbox>
                      <Checkbox
                        data-testid="members-public-chb"
                        className="align-top"
                        isSelected={checkboxes.memberListIsPublic}
                        onValueChange={(value) =>
                          setCheckboxes({
                            ...checkboxes,
                            memberListIsPublic: value,
                          })
                        }
                        size={smallerSize}
                      >
                        {
                          settingsStore.t.projects.projectSettings
                            .memberListIsPublic
                        }
                      </Checkbox>
                    </div>
                  </div>
                  <div
                    className={clsx(
                      'flex w-full items-center gap-2',
                      isNewProject || !CheckAccess(['owner'], 'project')
                        ? 'justify-end'
                        : 'justify-between',
                    )}
                  >
                    {!isNewProject && CheckAccess(['owner'], 'project') && (
                      <FButton
                        data-testid="delete-btn"
                        onPress={onDeleteProjectOpen}
                        isDisabled={isSaving}
                        variant="bordered"
                        color="danger"
                        size={commonSize}
                      >
                        {settingsStore.t.projects.projectSettings.deleteButton}
                      </FButton>
                    )}

                    <FButton
                      data-testid="save-btn"
                      isLoading={isSaving}
                      isDisabled={!!Object.keys(errors).length}
                      onPress={onSubmit}
                      variant="solid"
                      color="primary"
                      size={commonSize}
                    >
                      {isNewProject
                        ? settingsStore.t.projects.projectSettings.createButton
                        : settingsStore.t.projects.projectSettings.saveButton}
                    </FButton>
                  </div>
                </Form>
                {isDeleteProjectOpen && (
                  <AreYouSureModal
                    header={settingsStore.t.projects.deleteProject.modalHeader}
                    description={
                      settingsStore.t.projects.deleteProject.modalDescription
                    }
                    sure={settingsStore.t.projects.deleteProject.modalSure}
                    dismiss={
                      settingsStore.t.projects.deleteProject.modalDismiss
                    }
                    isOpen={isDeleteProjectOpen}
                    onOpenChange={onDeleteProjectOpenChange}
                    action={deleteProject}
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

export default ProjectSettingsModal;
