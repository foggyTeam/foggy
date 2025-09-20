'use client';
import teamsStore from '@/app/stores/teamsStore';
import { observer } from 'mobx-react-lite';
import settingsStore from '@/app/stores/settingsStore';
import ContentSection from '@/app/lib/components/contentSection';
import TeamCard from '@/app/lib/components/teams/teamCard';
import { useDisclosure } from '@heroui/modal';
import TeamSettingsModal from '@/app/lib/components/teams/teamSettingsModal';

const AllTeams = observer(() => {
  const {
    isOpen: isCreateTeamOpen,
    onOpen: onCreateTeamOpen,
    onOpenChange: onCreateTeamOpenChange,
  } = useDisclosure();

  return (
    <>
      <ContentSection
        sectionTitle={settingsStore.t.main.myTeams}
        data={teamsStore.allTeams.slice()}
        DataCard={TeamCard}
        filter
        onlyWithNotification
        addNew={onCreateTeamOpen}
      />
      {isCreateTeamOpen && (
        <TeamSettingsModal
          isNewTeam
          isOpen={isCreateTeamOpen}
          onOpenChange={onCreateTeamOpenChange}
        />
      )}
    </>
  );
});

export default AllTeams;
