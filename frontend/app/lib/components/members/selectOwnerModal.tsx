import { ProjectMember, TeamMember } from '@/app/lib/types/definitions';
import settingsStore from '@/app/stores/settingsStore';
import React, { ReactNode, useEffect, useState } from 'react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import { Select, SelectItem } from '@heroui/select';
import SmallMemberCard from '@/app/lib/components/members/smallMemberCard';
import projectsStore from '@/app/stores/projectsStore';

export default function SelectOwnerModal({
  member,
  submitOwnerId,
  teamFilter,
  isOpen,
  onOpenChange,
  action,
}: {
  member: ProjectMember | TeamMember;
  submitOwnerId: (id: string) => void;
  teamFilter?: string;
  isOpen: boolean;
  onOpenChange: any;
  action: () => void;
}) {
  const projectMembersList =
    (projectsStore.activeProject &&
      projectsStore.activeProject.members.filter(
        (projectMember) =>
          member.id !== projectMember.id &&
          (teamFilter && 'team' in projectMember
            ? projectMember.team !== teamFilter
            : true),
      )) ||
    [];
  const [selectedOwner, setSelectedOwner] = useState(['']);

  useEffect(() => {
    submitOwnerId(selectedOwner[0]);
  }, [selectedOwner, submitOwnerId]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent className="flex w-fit max-w-2xl gap-4 p-6">
        {(onClose) =>
          (
            <>
              <ModalHeader className="flex p-0">
                {settingsStore.t.members.selectOwner.modalHeader}
              </ModalHeader>

              <ModalBody className="flex h-fit max-h-40 w-full max-w-2xl flex-col flex-wrap gap-2 p-0">
                <Select
                  radius="md"
                  classNames={{
                    popoverContent: clsx(
                      bg_container_no_padding,
                      'p-2 sm:p-3 bg-opacity-100',
                    ),
                  }}
                  selectedKeys={selectedOwner}
                  onSelectionChange={(keys) =>
                    setSelectedOwner(Array.from(keys) as string[])
                  }
                  label={settingsStore.t.members.selectOwner.label}
                >
                  {projectMembersList.map(
                    (member) =>
                      (
                        <SelectItem key={member.id} textValue={member.nickname}>
                          <SmallMemberCard {...member} />
                        </SelectItem>
                      ) as any,
                  )}
                </Select>
              </ModalBody>

              <ModalFooter className="flex w-full justify-between gap-2 p-0">
                <FButton
                  color="primary"
                  variant="light"
                  size="md"
                  className="w-fit"
                  onPress={onClose}
                >
                  {settingsStore.t.members.selectOwner.modalDismiss}
                </FButton>

                <FButton
                  onPress={action}
                  color="primary"
                  size="md"
                  className="w-full"
                >
                  {settingsStore.t.members.selectOwner.modalSave}
                </FButton>
              </ModalFooter>
            </>
          ) as ReactNode
        }
      </ModalContent>
    </Modal>
  );
}
