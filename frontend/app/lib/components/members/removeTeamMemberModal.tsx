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
import { Select, SelectItem } from '@heroui/select';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import { Alert } from '@heroui/alert';

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
  const removeTypes = {
    breakup: settingsStore.t.members.removeTeamMember.breakup.option,
    entire: settingsStore.t.members.removeTeamMember.entire.option,
  };
  const [removeType, setRemoveType] =
    useState<keyof typeof removeTypes>('entire');

  useEffect(() => {
    submitRemoveType(removeType);
  }, [removeType, submitRemoveType]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent className="flex w-fit max-w-md gap-4 p-6">
        {(onClose) =>
          (
            <>
              <ModalHeader className="flex p-0">
                {'team' in member &&
                  settingsStore.t.members.removeTeamMember.modalHeader.replace(
                    '_',
                    member.team || '',
                  )}
              </ModalHeader>

              <ModalBody className="flex h-fit w-full max-w-md flex-col gap-2 p-0">
                <Select
                  color="primary"
                  radius="full"
                  size="sm"
                  className="m-0 w-full p-0"
                  classNames={{
                    innerWrapper: 'text-sm',
                    value: 'text-sm',
                    popoverContent: clsx(
                      bg_container_no_padding,
                      'p-2 sm:p-3 bg-opacity-100',
                    ),
                  }}
                  selectedKeys={[removeType]}
                  onSelectionChange={(keys) =>
                    setRemoveType(keys.currentKey as keyof typeof removeTypes)
                  }
                  aria-label="remove-type"
                  renderValue={(items) => {
                    return (
                      <div className="flex gap-1 overflow-hidden p-1">
                        {items.map(
                          ({ key }) =>
                            removeTypes[key as keyof typeof removeTypes],
                        )}
                      </div>
                    );
                  }}
                  selectionMode="single"
                  disallowEmptySelection
                >
                  {Object.keys(removeTypes).map((item) => (
                    <SelectItem key={item} textValue={item}>
                      {removeTypes[item as keyof typeof removeTypes]}
                    </SelectItem>
                  ))}
                </Select>

                <Alert
                  color="danger"
                  description={
                    removeType === 'entire'
                      ? settingsStore.t.members.removeTeamMember.entire.hint
                      : settingsStore.t.members.removeTeamMember.breakup.hint
                  }
                />
              </ModalBody>

              <ModalFooter className="flex w-full justify-between gap-2 p-0">
                <FButton
                  color="primary"
                  variant="light"
                  size="md"
                  className="w-fit"
                  onPress={onClose}
                >
                  {settingsStore.t.members.removeTeamMember.modalDismiss}
                </FButton>

                <FButton
                  onPress={action}
                  color="primary"
                  size="md"
                  className="w-full"
                >
                  {settingsStore.t.members.removeTeamMember.modalSure}
                </FButton>
              </ModalFooter>
            </>
          ) as ReactNode
        }
      </ModalContent>
    </Modal>
  );
}
