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
import { ProjectMember, Role } from '@/app/lib/types/definitions';
import { Select, SelectItem } from '@heroui/select';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import SmallMemberCard from '@/app/lib/components/members/smallMemberCard';
import { HistoryIcon, SearchIcon } from 'lucide-react';
import { Autocomplete, AutocompleteItem } from '@heroui/autocomplete';
import RoleCard, { rolesList } from '@/app/lib/components/members/roleCard';
import { Button } from '@heroui/button';

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
    const [membersList, setMembersList] = useState<Array<ProjectMember>>([]);

    const [searchValue, setSearchValue] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [role, setRole] = useState<Role[]>([]);
    const [expirationTime, setExpirationTime] = useState<
      (keyof typeof expirationTimes)[]
    >(['24h']);

    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
        <ModalContent className="flex w-full max-w-lg gap-2 p-6">
          {(onClose) => (
            <>
              <ModalHeader className="flex p-0">
                {settingsStore.t.members.addMember.modalHeader}
              </ModalHeader>

              <ModalBody className="flex h-fit max-h-40 w-full max-w-lg flex-col flex-wrap gap-2 p-0">
                <Autocomplete
                  selectedKeys={selectedMembers}
                  onSelectionChange={(keys) =>
                    setSelectedMembers(Array.from(keys) as string[])
                  }
                  selectionMode="multiple"
                  allowsCustomValue
                  radius="full"
                  size="sm"
                  variant="flat"
                  type="text"
                  className="w-full"
                  classNames={{
                    popoverContent: clsx(
                      bg_container_no_padding,
                      'p-2 sm:p-3 bg-opacity-100',
                    ),
                  }}
                  placeholder={
                    settingsStore.t.members.addMember.searchPlaceholder
                  }
                  startContent={<SearchIcon className="stroke-default-500" />}
                  aria-label="select-members"
                >
                  {membersList.map(
                    (member) =>
                      (
                        <AutocompleteItem
                          key={member.id}
                          textValue={member.nickname}
                        >
                          <SmallMemberCard member={member} teamLabel={true} />
                        </AutocompleteItem>
                      ) as any,
                  )}
                </Autocomplete>
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
                <Button isDisabled={!role.length} size="md" variant="light">
                  {settingsStore.t.members.addMember.modalCopyLink}
                </Button>
                <Button
                  isDisabled={!selectedMembers.length || !role.length}
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
