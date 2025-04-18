import { Modal, ModalBody, ModalContent, useDisclosure } from '@heroui/modal';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import React, { ReactNode, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import projectsStore from '@/app/stores/projectsStore';
import { Project, ProjectSettings } from '@/app/lib/types/definitions';
import { projectFormSchema } from '@/app/lib/types/schemas';
import IsFormValid from '@/app/lib/utils/isFormValid';
import { Form } from '@heroui/form';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
import { Checkbox } from '@heroui/checkbox';
import AreYouSureModal from '@/app/lib/components/areYouSureModal';
import HandleImageUpload from '@/app/lib/utils/handleImageUpload';
import UploadAvatarButton from '@/app/lib/components/uploadAvatarButton';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

const ProjectSettingsModal = observer(
  ({
    isOpen,
    onOpenChange,
    isNewProject = false,
  }: {
    isOpen: boolean;
    onOpenChange: any;
    isNewProject: boolean;
  }) => {
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
    const [avatar, setAvatar] = useState<null | string | ArrayBuffer>(null);

    useEffect(() => {
      if (!isNewProject && projectsStore.activeProject) {
        setName(projectsStore.activeProject.name);
        setDescription(projectsStore.activeProject.description || '');
        setCheckboxes(
          projectsStore.activeProject.settings || new ProjectSettings(),
        );
      } else if (!isNewProject) {
        console.error('No active project!');
      }
    }, [isNewProject]);

    useEffect(() => {
      IsFormValid({ name, description }, projectFormSchema, setErrors);
    }, [name, description, setErrors]);

    const handleImageUpload = async (event: any) => {
      const resizedImageURL = await HandleImageUpload(event);
      if (resizedImageURL) setAvatar(resizedImageURL);
    };

    const deleteProject = () => {
      console.log('delete');
    };

    const onSubmit = async () => {
      if (!Object.keys(errors as any).length) {
        setIsSaving(true);
        const updatedData: Partial<Project> = {
          name: name,
          description: description,
          settings: checkboxes,
        };
        if (avatar) {
          updatedData.avatar = avatar as any;
        }

        if (isNewProject) {
          /*
          await createProject(updatedData)
            .then((result) => {
              if (
                Object.keys(result).findIndex(
                  (element) => element === 'errors',
                ) !== -1
              ) {
                setErrors(result.errors);
                console.error(result);
              } else {
                const newProject = new Project({
                  id: result.id,
                  creator: {
                    id: userStore.user?.id,
                    nickname: userStore.user?.name,
                    avatar: userStore.user?.image,
                  },
                  ...updatedData,
                } as any);

                projectsStore.addProject(newProject);

                router.push(`projects/${newProject.id}`)
              }
            })
            .finally(() => setIsSaving(false));*/
        } else {
          /*
          await updateProject(projectsStore.activeProject?.id, updatedData)
            .then((result) => {
              if (
                Object.keys(result).findIndex(
                  (element) => element === 'errors',
                ) !== -1
              ) {
                setErrors(result.errors);
                console.error(result);
              }
            })
            .finally(() => setIsSaving(false));*/
        }
      }
    };

    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
        <ModalContent className="w-2xl flex max-w-2xl gap-2 overflow-visible p-6">
          {(onClose) =>
            (
              <ModalBody className="w-2xl flex h-fit max-w-2xl gap-2 p-0">
                <Form className={'flex h-fit w-full min-w-24 flex-col gap-6'}>
                  <div className="items-top -mt-12 flex w-1/2 justify-center">
                    <UploadAvatarButton
                      handleImageUpload={handleImageUpload}
                      name={name}
                      src={projectsStore.activeProject?.avatar}
                      classNames={{
                        icon: 'w-32 h-32',
                        avatar: 'w-32 h-32 border border-4 border-white',
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
                        size="md"
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
                        size="md"
                        value={description}
                        onValueChange={setDescription}
                      />
                    </div>
                    <div className="flex h-full w-full flex-col justify-between gap-6">
                      <div className="flex h-full w-full flex-col gap-2">
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
                          {
                            settingsStore.t.projects.projectSettings
                              .allowRequests
                          }
                        </Checkbox>
                        <Checkbox
                          isSelected={checkboxes.isPublic}
                          onValueChange={(value) =>
                            setCheckboxes({ ...checkboxes, isPublic: value })
                          }
                          size="sm"
                        >
                          {settingsStore.t.projects.projectSettings.isPublic}
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
                          {
                            settingsStore.t.projects.projectSettings
                              .memberListIsPublic
                          }
                        </Checkbox>
                      </div>
                      {!isNewProject && (
                        <div className="flex w-full justify-end">
                          <Button variant="light" size="md" color="secondary">
                            {
                              settingsStore.t.projects.projectSettings
                                .leaveButton
                            }
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className={clsx(
                      'flex w-full items-center gap-2',
                      isNewProject ? 'justify-end' : 'justify-between',
                    )}
                  >
                    {!isNewProject && (
                      <FButton
                        onPress={onDeleteProjectOpen}
                        variant="bordered"
                        color="danger"
                        size="md"
                      >
                        {settingsStore.t.projects.projectSettings.deleteButton}
                      </FButton>
                    )}

                    <FButton
                      isLoading={isSaving}
                      onPress={onSubmit}
                      variant="solid"
                      color="primary"
                      size="md"
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
