import {
  FilterSet,
  Project,
  ProjectMember,
  Team,
  TeamMember,
  TeamRole,
} from '@/app/lib/types/definitions';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import React, { ReactNode, useEffect, useState } from 'react';
import settingsStore from '@/app/stores/settingsStore';
import SmallMemberCard from '@/app/lib/components/members/smallMemberCard';
import { Select, SelectItem } from '@heroui/select';
import { useDebouncedCallback } from 'use-debounce';
import RoleCard from '@/app/lib/components/roleCard';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import { DateRangePicker } from '@heroui/date-picker';
import {
  getLocalTimeZone,
  parseAbsoluteToLocal,
  today,
  ZonedDateTime,
} from '@internationalized/date';
import { Button } from '@heroui/button';
import { X } from 'lucide-react';
import { FilterReducerActionPayload } from '@/app/lib/components/contentSection';

const teamRoles: Set<TeamRole> = new Set([
  'owner',
  'admin',
  'editor',
  'reader',
]);

export default function FilterModal({
  data,
  filters,
  dispatchFilters,
  isOpen,
  onOpenChange,
}: {
  data: Project[] | Team[] | TeamMember[] | ProjectMember[]; // | Notification[];
  filters: FilterSet;
  dispatchFilters: any;
  isOpen: any;
  onOpenChange: any;
}) {
  const [membersList, setMembersList] = useState<Array<ProjectMember>>();
  const [teamsList, setTeamsList] = useState<Array<Team>>();
  const [rolesList, setRolesList] = useState<Array<TeamRole>>();
  const [maxDate, setMaxDate] = useState<ZonedDateTime>();

  const [lastUpdated, setLastUpdated] = useState<{
    start: ZonedDateTime;
    end: ZonedDateTime;
  }>({ start: undefined, end: undefined });

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    if (data.length) {
      // nickname || team
      if (data[0]?.members) {
        const allMembers: Map<string, ProjectMember> = new Map();
        const allTeams: Map<string, Team> = new Map();
        const alreadySelectedMembers: Map<string, string> = new Map();
        const alreadySelectedTeams: Map<string, string> = new Map();

        data.map((element) => {
          element.members?.map((member) => {
            if (member.nickname) {
              allMembers.set(member.id, member);
              if (filters.nickname.has(member.nickname))
                alreadySelectedMembers.set(member.id, member.nickname);
            }
            if (member.name) {
              allTeams.set(member.id, member);
              if (filters.team.has(member.name))
                alreadySelectedTeams.set(member.id, member.name);
            }
          });
        });

        setMembersList(Array.from(allMembers.values()));
        setTeamsList(Array.from(allTeams.values()));
        setSelectedMembers(Array.from(alreadySelectedMembers.values()));
        setSelectedTeams(Array.from(alreadySelectedTeams.values()));
      }
      // role
      if (data[0]?.members || data[0]?.nickname) {
        setRolesList(Array.from(teamRoles));
        setSelectedRoles(Array.from(filters.role));
      }
      // lastChange
      if (data[0]?.lastChange) {
        setMaxDate(today(getLocalTimeZone()));
        if (filters.lastChange) {
          const [periodStart, periodEnd] = filters.lastChange.split('_');
          setLastUpdated({
            start: parseAbsoluteToLocal(periodStart),
            end: parseAbsoluteToLocal(periodEnd),
          });
        }
      }
    }
  }, [data, filters]);

  const debouncedUpdateFilters = useDebouncedCallback(
    (payload: FilterReducerActionPayload[]) =>
      dispatchFilters({
        type: 'SET',
        payload: payload,
      }),
    300,
  );

  useEffect(() => {
    const newPeriod = [lastUpdated?.start, lastUpdated?.end].map((date) =>
      date?.toDate().toISOString(),
    );
    const filtersToUpdate: FilterReducerActionPayload[] = [
      { key: 'nickname', value: new Set(selectedMembers) },
      { key: 'team', value: new Set(selectedTeams) },
      { key: 'role', value: new Set(selectedRoles) },
      {
        key: 'lastChange',
        value: newPeriod[0] ? newPeriod.join('_') : '',
      },
    ];

    debouncedUpdateFilters(filtersToUpdate);
  }, [
    selectedMembers,
    selectedTeams,
    selectedRoles,
    lastUpdated,
    debouncedUpdateFilters,
  ]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent className="flex w-fit max-w-2xl gap-2 p-6">
        {(onClose) =>
          (
            <>
              <ModalHeader className="flex p-0">
                {settingsStore.t.filters.menuHeader}
              </ModalHeader>

              <ModalBody className="flex h-fit max-h-40 w-fit max-w-2xl flex-col flex-wrap gap-2 p-0">
                {membersList?.length > 0 && (
                  <Select
                    radius="md"
                    className="w-72"
                    classNames={{
                      popoverContent: clsx(
                        bg_container_no_padding,
                        'p-2 sm:p-3 bg-opacity-100',
                      ),
                    }}
                    selectedKeys={selectedMembers}
                    onSelectionChange={setSelectedMembers}
                    selectionMode="multiple"
                    label={settingsStore.t.filters.byMember.label}
                    placeholder={settingsStore.t.filters.byMember.placeholder}
                  >
                    {membersList.map(
                      (member) =>
                        (
                          <SelectItem
                            key={member.nickname}
                            textValue={member.nickname}
                          >
                            <SmallMemberCard {...member} />
                          </SelectItem>
                        ) as any,
                    )}
                  </Select>
                )}
                {teamsList?.length > 0 && (
                  <Select
                    radius="md"
                    className="w-72"
                    classNames={{
                      popoverContent: clsx(
                        bg_container_no_padding,
                        'p-2 sm:p-3 bg-opacity-100',
                      ),
                    }}
                    selectedKeys={selectedTeams}
                    onSelectionChange={setSelectedTeams}
                    selectionMode="multiple"
                    label={settingsStore.t.filters.byTeam.label}
                    placeholder={settingsStore.t.filters.byTeam.placeholder}
                  >
                    {teamsList.map(
                      (team) =>
                        (
                          <SelectItem key={team.name} textValue={team.name}>
                            <SmallMemberCard {...team} />
                          </SelectItem>
                        ) as any,
                    )}
                  </Select>
                )}
                {rolesList?.length > 0 && (
                  <Select
                    radius="md"
                    className="w-72"
                    classNames={{
                      popoverContent: clsx(
                        bg_container_no_padding,
                        'p-2 sm:p-3 bg-opacity-100',
                      ),
                    }}
                    selectedKeys={selectedRoles}
                    onSelectionChange={setSelectedRoles}
                    selectionMode="multiple"
                    label={settingsStore.t.filters.byRole.label}
                    placeholder={settingsStore.t.filters.byRole.placeholder}
                    renderValue={(items) => {
                      return (
                        <div className="flex gap-1 overflow-hidden">
                          {items.map((item) => (
                            <RoleCard key={item.key} role={item.key} />
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
                )}

                {maxDate && (
                  <DateRangePicker
                    value={lastUpdated}
                    onChange={setLastUpdated}
                    maxValue={maxDate}
                    label={settingsStore.t.filters.byLastChange.label}
                    selectorButtonPlacement="start"
                    endContent={
                      lastUpdated?.start && (
                        <Button
                          isIconOnly
                          variant="light"
                          className="h-fit w-fit min-w-fit"
                          onClick={() =>
                            setLastUpdated({ start: undefined, end: undefined })
                          }
                        >
                          <X className="stroke-default-400" />
                        </Button>
                      )
                    }
                    className="w-72"
                    classNames={{
                      label: 'text-xs',
                    }}
                    hideTimeZone
                    granularity="day"
                    aria-label="Last change"
                  />
                )}
              </ModalBody>
            </>
          ) as ReactNode
        }
      </ModalContent>
    </Modal>
  );
}
