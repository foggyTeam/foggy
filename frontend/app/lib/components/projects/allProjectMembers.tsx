'use client';

import ContentSection from '@/app/lib/components/contentSection';
import settingsStore from '@/app/stores/settingsStore';
import projectsStore from '@/app/stores/projectsStore';
import { observer } from 'mobx-react-lite';
import { useDisclosure } from '@heroui/modal';
import ProjectSettingsModal from '@/app/lib/components/projects/projectSettingsModal';
import MemberCard from '@/app/lib/components/members/memberCard';
import CompareByRole from '@/app/lib/utils/compareByRole';

const AllProjectMembers = observer(() => {
  const {
    isOpen: isAddMemberOpen,
    onOpen: onAddMemberOpen,
    onOpenChange: onAddMemberOpenChange,
  } = useDisclosure();

  return (
    <>
      <ContentSection
        sectionTitle={settingsStore.t.projects.projectMembers}
        data={
          projectsStore.activeProject?.members.toSorted(CompareByRole) || []
        }
        DataCard={MemberCard}
        filter
        addMember={onAddMemberOpen}
      />
      {isAddMemberOpen && (
        <ProjectSettingsModal
          isOpen={isAddMemberOpen}
          onOpenChange={onAddMemberOpenChange}
        />
      )}
    </>
  );
});

export default AllProjectMembers;
