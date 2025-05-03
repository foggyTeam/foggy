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
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent className="flex w-fit max-w-2xl gap-4 p-6">
        {(onClose) =>
          (
            <>
              <ModalHeader className="flex p-0">Select new owner</ModalHeader>

              <ModalBody className="flex h-fit max-h-40 w-full max-w-2xl flex-col flex-wrap gap-2 p-0">
                Select new owner
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
