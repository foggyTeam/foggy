'use client';

import ContentSection from '@/app/lib/components/contentSection';
import settingsStore from '@/app/stores/settingsStore';
import projectsStore from '@/app/stores/projectsStore';
import { observer } from 'mobx-react-lite';
import { useDisclosure } from '@heroui/modal';
import MemberCard from '@/app/lib/components/members/memberCard';
import CompareByRole from '@/app/lib/utils/compareByRole';
import { createContext, useContext } from 'react';
import { Role } from '@/app/lib/types/definitions';
import AddMembersModal from '@/app/lib/components/members/addMembersModal';
import {
  DeleteProjectMember,
  UpdateProjectMemberRole,
} from '@/app/lib/server/actions/membersServerActions';
import { addToast } from '@heroui/toast';
import { useRouter } from 'next/navigation';

interface MembersContextType {
  memberType: 'team' | 'project';
  myRole: Role | null;
  removeMember: (
    id: string,
    newOwnerId?: string | null,
    removeType?: 'breakup' | 'entire' | null,
  ) => void;
  updateMemberRole: (
    id: string,
    newRole: Role,
    changeType?: 'override' | 'updateMax' | null,
  ) => void;
}

const MembersContext = createContext<MembersContextType | null>(null);
export const useMembersContext = () => {
  const context = useContext(MembersContext);
  if (!context)
    throw new Error('useContext must be used within a ContextProvider');
  return context;
};

const AllProjectMembers = observer(() => {
  const router = useRouter();
  const myRole: Role | null =
    projectsStore.activeProject?.members.toSorted(CompareByRole)[0].role ||
    null;
  const {
    isOpen: isAddMemberOpen,
    onOpen: onAddMemberOpen,
    onOpenChange: onAddMemberOpenChange,
  } = useDisclosure();

  const handleRemoveMember = async (
    id: string,
    newOwnerId?: string | null,
    removeType?: 'breakup' | 'entire' | null,
  ) => {
    if (!projectsStore.activeProject) return;
    await DeleteProjectMember(projectsStore.activeProject.id, id, newOwnerId)
      .catch((error: string) =>
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.members.deleteMemberError,
          description: error,
        }),
      )
      .then((response) => {
        if (response.errors) {
          addToast({
            color: 'danger',
            severity: 'danger',
            title: settingsStore.t.toasts.members.deleteMemberError,
            description: response.errors[Object.keys(response.errors)[0]],
          });
        } else {
          projectsStore.removeProjectMember(id);
          if (newOwnerId) router.push('/');
        }
      });
  };
  const handleUpdateMemberRole = async (
    id: string,
    newRole: Role,
    changeType?: 'override' | 'updateMax' | null,
  ) => {
    if (!projectsStore.activeProject) return;
    await UpdateProjectMemberRole(projectsStore.activeProject.id, {
      userId: id,
      role: newRole,
    })
      .catch((error) =>
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.members.updateMemberRoleError,
          description: error,
        }),
      )
      .then(() => projectsStore.updateProjectMember(id, { role: newRole }));
  };

  return (
    <>
      <MembersContext.Provider
        value={{
          memberType: 'project',
          myRole: myRole,
          removeMember: handleRemoveMember,
          updateMemberRole: handleUpdateMemberRole,
        }}
      >
        <ContentSection
          sectionTitle={settingsStore.t.projects.projectMembers}
          data={
            projectsStore.activeProject?.members.toSorted(CompareByRole) || []
          }
          DataCard={MemberCard}
          filter
          addMember={onAddMemberOpen}
        />
      </MembersContext.Provider>
      {isAddMemberOpen && (
        <AddMembersModal
          isOpen={isAddMemberOpen}
          onOpenChange={onAddMemberOpenChange}
        />
      )}
    </>
  );
});

export default AllProjectMembers;
