import {
  FilterSet,
  Project,
  ProjectMember,
  Team,
  TeamMember,
  TeamRole,
} from '@/app/lib/types/definitions';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import { ReactNode, useEffect, useState } from 'react';
import settingsStore from '@/app/stores/settingsStore';
import SmallMemberCard from '@/app/lib/components/members/smallMemberCard';
import { Select, SelectItem } from '@heroui/select';
import { useDebouncedCallback } from 'use-debounce';
import RoleCard from '@/app/lib/components/roleCard';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';

export default function FilterModal({
  data,
  filters,
  setFilters,
  isOpen,
  onOpenChange,
}: {
  data: Project[] | Team[] | TeamMember[] | ProjectMember[]; // | Notification[];
  filters: FilterSet;
  setFilters: any;
  isOpen: any;
  onOpenChange: any;
}) {
  const teamRoles: Set<TeamRole> = new Set([
    'owner',
    'admin',
    'editor',
    'reader',
  ]);
  const [membersList, setMembersList] = useState<Array<ProjectMember>>();
  const [teamsList, setTeamsList] = useState<Array<Team>>();
  const [rolesList, setRolesList] = useState<Array<TeamRole>>();
  const [lastUpdated, setLastUpdated] = useState<{
    start: string;
    end: string;
  }>();

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    // nickname || team
    if (data[0].members) {
      const allMembers: Map<string, ProjectMember> = new Map();
      const allTeams: Map<string, Team> = new Map();
      const alreadySelectedMembers: Map<string, string> = new Map();
      const alreadySelectedTeams: Map<string, string> = new Map();

      data.map((element) => {
        element.members.map((member) => {
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
    if (data[0].members || data[0].nickname) {
      setRolesList(Array.from(teamRoles));
      setSelectedRoles(Array.from(filters.role));
    }
    // lastChange
    if (data[0].lastChange) {
      if (filters.lastChange) {
        const [periodStart, periodEnd] = filters.lastChange.split('_');
        setLastUpdated({ start: periodStart, end: periodEnd });
      } else {
        const today = new Date().toISOString();
        setLastUpdated({ start: today, end: today });
      }
    }
  }, [data]);

  const debouncedUpdateFilters = useDebouncedCallback(
    (newFilters: FilterSet) => setFilters(newFilters),
    300,
  );
  useEffect(() => {
    const newFilters: FilterSet = { ...filters };
    newFilters.nickname = new Set(selectedMembers);
    newFilters.team = new Set(selectedTeams);
    newFilters.role = new Set(selectedRoles);

    debouncedUpdateFilters(newFilters);
  }, [selectedMembers, selectedTeams, selectedRoles]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent className="flex w-fit gap-2 p-6">
        {(onClose) =>
          (
            <>
              <ModalHeader className="flex p-0">
                {settingsStore.t.filters.menuHeader}
              </ModalHeader>

              <ModalBody className="flex h-fit w-fit flex-row gap-4 p-0">
                <div className="flex w-fit flex-col gap-2">
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
                </div>
                {lastUpdated && <div>Dates</div>}
              </ModalBody>
            </>
          ) as ReactNode
        }
      </ModalContent>
    </Modal>
  );
}
