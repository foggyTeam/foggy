import { Select, SelectItem } from '@heroui/select';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import settingsStore from '@/app/stores/settingsStore';
import RoleCard, { rolesList } from '@/app/lib/components/members/roleCard';
import React, { Dispatch, SetStateAction } from 'react';
import { Role } from '@/app/lib/types/definitions';

export default function SelectRole({
  role,
  setRole,
  includeOwner,
  disableOwner,
  disallowEmptySelection = false,
  isDisabled = false,
  style = 'flat',
  className = '',
}: {
  role: Role | undefined;
  setRole: Dispatch<SetStateAction<Role | undefined>>;
  includeOwner?: boolean;
  disableOwner?: boolean;
  disallowEmptySelection?: boolean;
  isDisabled?: boolean;
  style?: 'flat' | 'bordered';
  className?: string;
}) {
  return (
    <Select
      selectedKeys={role ? [role] : []}
      onSelectionChange={(keys) => setRole(keys.currentKey as Role | undefined)}
      disabledKeys={disableOwner ? ['owner'] : []}
      disallowEmptySelection={disallowEmptySelection}
      selectionMode="single"
      placeholder={settingsStore.t.members.addMember.rolePlaceholder}
      renderValue={(items) => {
        return (
          <div className="flex gap-1 overflow-hidden">
            {items.map((item) => (
              <RoleCard key={item.key} role={item.key as string} />
            ))}
          </div>
        );
      }}
      isDisabled={isDisabled}
      radius="full"
      variant={style}
      aria-label="select-role"
      size="sm"
      className={clsx('w-full', className)}
      classNames={{
        innerWrapper: 'text-sm',
        value: 'text-sm',
        popoverContent: clsx(
          bg_container_no_padding,
          'p-2 sm:p-3 bg-opacity-100',
        ),
      }}
    >
      {(includeOwner
        ? rolesList
        : rolesList.filter((role) => role !== 'owner')
      ).map(
        (role) =>
          (
            <SelectItem key={role} textValue={role}>
              <RoleCard role={role} />
            </SelectItem>
          ) as any,
      )}
    </Select>
  );
}
