import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import settingsStore from '@/app/stores/settingsStore';
import React, { ReactNode, useEffect, useState } from 'react';
import { ProjectMember, Role, TeamMember } from '@/app/lib/types/definitions';
import { Select, SelectItem } from '@heroui/select';
import RoleCard from '@/app/lib/components/members/roleCard';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';

export default function ({
  member,
  submitRole,
  submitRoleType,
  isOpen,
  onOpenChange,
  action,
}: {
  member: ProjectMember | TeamMember;
  submitRole: (value: Role) => void;
  submitRoleType: (type: 'override' | 'updateMax') => void;
  isOpen: boolean;
  onOpenChange: any;
  action: () => void;
}) {
  const changeTypes = {
    override: settingsStore.t.members.changeRole.upgradeMember.replace(
      '_',
      member.nickname,
    ),
    updateMax: settingsStore.t.members.changeRole.upgradeTeam,
  };
  const [newRole, setNewRole] = useState<Role[]>([member.role]);
  const [changeType, setChangeType] = useState<('override' | 'updateMax')[]>([
    'override',
  ]);
  const rolesList: Role[] = ['admin', 'editor', 'reader', 'owner'];

  useEffect(() => {
    submitRole(newRole[0]);
    if ('team' in member) submitRoleType(changeType[0]);
  }, [newRole, changeType, submitRoleType, submitRole]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent className="flex w-fit max-w-2xl gap-4 p-6">
        {(onClose) =>
          (
            <>
              <ModalHeader className="flex p-0">
                {settingsStore.t.members.changeRole.modalHeader.replace(
                  '_',
                  member.nickname,
                )}
              </ModalHeader>

              <ModalBody className="flex h-fit max-h-40 w-full max-w-2xl flex-col flex-wrap gap-2 p-0">
                <Select
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
                  selectedKeys={newRole}
                  disabledKeys={['owner']}
                  onSelectionChange={(keys) =>
                    setNewRole(Array.from(keys) as Role[])
                  }
                  aria-label="Select role"
                  renderValue={(items) => {
                    return (
                      <div className="flex gap-1 overflow-hidden">
                        {items.map((item) => (
                          <RoleCard key={item.key} role={item.key as string} />
                        ))}
                      </div>
                    );
                  }}
                >
                  {rolesList.map(
                    (role) =>
                      (
                        <SelectItem key={role} textValue={role}>
                          <RoleCard role={role} />
                        </SelectItem>
                      ) as any,
                  )}
                </Select>
                {'team' in member && member.team && (
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
                    selectedKeys={changeType}
                    onSelectionChange={(keys) =>
                      setChangeType(Array.from(keys) as string[])
                    }
                    aria-label="Select type of change"
                    renderValue={(items: any[]) => {
                      return (
                        <div className="flex gap-1 overflow-hidden p-1">
                          {items.map((item: any) => changeTypes[item.key])}
                        </div>
                      );
                    }}
                  >
                    {Object.keys(changeTypes).map(
                      (item: any) =>
                        (
                          <SelectItem key={item} textValue={item}>
                            {changeTypes[item]}
                          </SelectItem>
                        ) as any,
                    )}
                  </Select>
                )}
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
