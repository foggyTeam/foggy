import { ProjectMember, TeamMember } from '@/app/lib/types/definitions';
import settingsStore from '@/app/stores/settingsStore';
import React, { ReactNode } from 'react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';

export default function RemoveTeamMemberModal({
  member,
  submitRemoveType,
  isOpen,
  onOpenChange,
  action,
}: {
  member: ProjectMember | TeamMember;
  submitRemoveType: (type: 'breakup' | 'entire') => void;
  isOpen: boolean;
  onOpenChange: any;
  action: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent className="flex w-fit max-w-2xl gap-4 p-6">
        {(onClose) =>
          (
            <>
              <ModalHeader className="flex p-0">
                Remove team member
                {settingsStore.t.members.changeRole.modalHeader.replace(
                  '_',
                  member.nickname,
                )}
              </ModalHeader>

              <ModalBody className="flex h-fit max-h-40 w-full max-w-2xl flex-col flex-wrap gap-2 p-0">
                Remove team member
              </ModalBody>

              <ModalFooter className="flex w-full justify-between gap-2 p-0">
                <FButton
                  color="primary"
                  variant="light"
                  size="md"
                  className="w-fit"
                  onPress={onClose}
                >
                  {settingsStore.t.members.changeRole.modalDismiss}
                </FButton>

                <FButton
                  onPress={action}
                  color="primary"
                  size="md"
                  className="w-full"
                >
                  {settingsStore.t.members.changeRole.modalSave}
                </FButton>
              </ModalFooter>
            </>
          ) as ReactNode
        }
      </ModalContent>
    </Modal>
  );
}
