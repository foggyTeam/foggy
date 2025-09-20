'use client';

import { observer } from 'mobx-react-lite';
import ContentSection from '@/app/lib/components/contentSection';
import teamsStore from '@/app/stores/teamsStore';
import MemberCard from '@/app/lib/components/members/memberCard';
import { Role } from '@/app/lib/types/definitions';
import MembersContext from '@/app/lib/hooks/useMembersContext';
import CompareByRole from '@/app/lib/utils/compareByRole';
import { useDisclosure } from '@heroui/modal';
import AddMembersModal from '@/app/lib/components/members/addMembersModal';
import TeamSettingsModal from '@/app/lib/components/teams/teamSettingsModal';

const AllTeamMembers = observer(() => {
  const myRole: Role | null =
    teamsStore.activeTeam?.members.toSorted(CompareByRole)[0].role || null;
  const {
    isOpen: isAddMemberOpen,
    onOpen: onAddMemberOpen,
    onOpenChange: onAddMemberOpenChange,
  } = useDisclosure();
  const {
    isOpen: isSettingsOpen,
    onOpen: onOpenSettings,
    onOpenChange: onSettingsOpenChange,
  } = useDisclosure();

  const handleRemoveMember = async (id: string, newOwnerId?: string | null) => {
    if (!teamsStore.activeTeam) return;
    // TODO: redo when API ready
  };
  const handleUpdateMemberRole = async (id: string, newRole: Role) => {
    if (!teamsStore.activeTeam) return;
    // TODO: redo when API ready
  };

  return (
    <>
      <MembersContext.Provider
        value={{
          memberType: 'team',
          myRole: myRole,
          removeMember: handleRemoveMember,
          updateMemberRole: handleUpdateMemberRole,
        }}
      >
        <ContentSection
          sectionAvatar={teamsStore.activeTeam?.avatar}
          sectionTitle={teamsStore.activeTeam?.name.toUpperCase()}
          data={teamsStore.activeTeam?.members?.slice() ?? []}
          DataCard={MemberCard}
          filter
          type="team"
          addMember={onAddMemberOpen}
          openSettings={onOpenSettings}
        />
      </MembersContext.Provider>
      {isSettingsOpen && (
        <TeamSettingsModal
          isOpen={isSettingsOpen}
          onOpenChange={onSettingsOpenChange}
        />
      )}
      {isAddMemberOpen && (
        <AddMembersModal
          type="team"
          isOpen={isAddMemberOpen}
          onOpenChange={onAddMemberOpenChange}
        />
      )}
    </>
  );
});

export default AllTeamMembers;
