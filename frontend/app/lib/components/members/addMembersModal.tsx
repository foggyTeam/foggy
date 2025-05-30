import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import settingsStore from '@/app/stores/settingsStore';
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Role } from '@/app/lib/types/definitions';
import { Select, SelectItem } from '@heroui/select';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import { HistoryIcon } from 'lucide-react';
import RoleCard, { rolesList } from '@/app/lib/components/members/roleCard';
import { Button } from '@heroui/button';
import MemberAutocomplete from '@/app/lib/components/members/memberAutocomplete';

const AddMembersModal = observer(
  ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: () => void }) => {
    const expirationTimes = {
      '24h': `24 ${settingsStore.t.time.hours.toLowerCase()}`,
      '7d': `7 ${settingsStore.t.time.days.toLowerCase()}`,
      '30d': `30 ${settingsStore.t.time.days.toLowerCase()}`,
      '3m': `3 ${settingsStore.t.time.months.toLowerCase()}`,
      '6m': `6 ${settingsStore.t.time.months.toLowerCase()}`,
      '12m': `12 ${settingsStore.t.time.months.toLowerCase()}`,
      never: settingsStore.t.time.never.toLowerCase(),
    } as const;
    const [isLoading, setIsLoading] = useState(false);

    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [role, setRole] = useState<Role[]>([]);
    const [expirationTime, setExpirationTime] = useState<
      (keyof typeof expirationTimes)[]
    >(['24h']);

    const handleAddMembers = async () => {
      setIsLoading(true);
      // TODO: post request
      onOpenChange();
    };

    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
        <ModalContent className="flex w-full max-w-lg gap-2 p-6">
          {(onClose) => (
            <>
              <ModalHeader className="flex p-0">
                {settingsStore.t.members.addMember.modalHeader}
              </ModalHeader>

              <ModalBody className="flex h-fit w-full max-w-lg flex-col flex-wrap gap-4 p-0">
                <MemberAutocomplete setSelectedId={setSelectedMembers} />
                <div className="flex w-full flex-nowrap justify-between gap-2">
                  <Select
                    radius="full"
                    className="w-48"
                    variant="bordered"
                    size="sm"
                    classNames={{
                      popoverContent: clsx(
                        bg_container_no_padding,
                        'p-2 sm:p-3 bg-opacity-100',
                      ),
                    }}
                    selectedKeys={role}
                    onSelectionChange={(keys) =>
                      setRole(Array.from(keys) as Role[])
                    }
                    placeholder={
                      settingsStore.t.members.addMember.rolePlaceholder
                    }
                    aria-label="select-role"
                    renderValue={(items) => {
                      return (
                        <div className="flex gap-1 overflow-hidden">
                          {items.map((item) => (
                            <RoleCard
                              key={item.key}
                              role={item.key as string}
                            />
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
                  <div className="flex w-fit items-center gap-1">
                    <div className="flex items-center gap-1">
                      <HistoryIcon className="stroke-default-500" />
                      <p className="text-sm">
                        {settingsStore.t.members.addMember.expiresIn}
                      </p>
                    </div>
                    <Select
                      radius="full"
                      className="w-fit"
                      variant="flat"
                      size="sm"
                      classNames={{
                        popoverContent: clsx(
                          bg_container_no_padding,
                          'p-2 sm:p-3 bg-opacity-100 w-36',
                        ),
                        innerWrapper: 'w-full',
                        selectorIcon: 'invisible',
                      }}
                      selectedKeys={expirationTime}
                      onSelectionChange={(keys) =>
                        setExpirationTime(Array.from(keys))
                      }
                      disallowEmptySelection
                      aria-label="expires-in"
                    >
                      {Object.keys(expirationTimes).map(
                        (time) =>
                          (
                            <SelectItem key={time} className="w-full p-1">
                              {expirationTimes[time]}
                            </SelectItem>
                          ) as any,
                      )}
                    </Select>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="flex w-full justify-between gap-4 p-0 pt-2">
                {/*TODO: add link*/}
                <Button isDisabled={!role.length} size="md" variant="light">
                  {settingsStore.t.members.addMember.modalCopyLink}
                </Button>
                <Button
                  isDisabled={!selectedMembers.length || !role.length}
                  isLoading={isLoading}
                  onPress={handleAddMembers}
                  size="md"
                  color="primary"
                >
                  {settingsStore.t.members.addMember.modalSure}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  },
);

export default AddMembersModal;
