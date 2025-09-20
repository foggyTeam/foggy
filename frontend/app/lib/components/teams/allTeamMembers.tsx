'use client';

import { observer } from 'mobx-react-lite';
import ContentSection from '@/app/lib/components/contentSection';
import teamsStore from '@/app/stores/teamsStore';
import MemberCard from '@/app/lib/components/members/memberCard';
import { Role } from '@/app/lib/types/definitions';
import MembersContext from '@/app/lib/hooks/useMembersContext';
import CompareByRole from '@/app/lib/utils/compareByRole';

const AllTeamMembers = observer(() => {
  const myRole: Role | null =
    teamsStore.activeTeam?.members.toSorted(CompareByRole)[0].role || null;

  const onOpenSettings = () => console.log('settings');
  const onAddMemberOpen = () => {
    console.log('add member');
  };
  const handleRemoveMember = async (id: string, newOwnerId?: string | null) => {
    console.log('remove member');
  };
  const handleUpdateMemberRole = async (id: string, newRole: Role) => {
    if (!teamsStore.activeTeam) return;
    console.log('update role');
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
    </>
  );
});

export default AllTeamMembers;
