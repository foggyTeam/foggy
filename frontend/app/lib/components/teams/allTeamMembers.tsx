'use client';

import { observer } from 'mobx-react-lite';
import ContentSection from '@/app/lib/components/contentSection';
import teamsStore from '@/app/stores/teamsStore';
import MemberCard from '@/app/lib/components/members/memberCard';
import { Role } from '@/app/lib/types/definitions';
import MembersContext from '@/app/lib/hooks/useMembersContext';
import { useDisclosure } from '@heroui/modal';
import AddMembersModal from '@/app/lib/components/members/addMembersModal';
import TeamSettingsModal from '@/app/lib/components/teams/teamSettingsModal';
import {
  DeleteTeamMember,
  UpdateTeamMemberRole,
} from '@/app/lib/server/actions/membersServerActions';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import { useRouter } from 'next/navigation';

const AllTeamMembers = observer(() => {
  const router = useRouter();
  const myRole: Role | null = teamsStore.myRole ?? null;
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
    try {
      const response = await DeleteTeamMember(teamsStore.activeTeam.id, id);
      if (response.errors) throw new Error(JSON.stringify(response.errors));

      teamsStore.removeTeamMember(id);
      if (newOwnerId) router.push('/');
    } catch (e: any) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.members.deleteMemberError,
        description: e,
      });
    }
  };
  const handleUpdateMemberRole = async (id: string, newRole: Role) => {
    if (!teamsStore.activeTeam) return;
    try {
      await UpdateTeamMemberRole(teamsStore.activeTeam.id, {
        userId: id,
        role: newRole,
      });
      teamsStore.updateTeamMember(id, { role: newRole });
    } catch (e: any) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.members.updateMemberRoleError,
        description: e,
      });
    }
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
          data-testid='all-team-members'
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
