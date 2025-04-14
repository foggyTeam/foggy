'use client';
import teamsStore from '@/app/stores/teamsStore';
import { observer } from 'mobx-react-lite';
import settingsStore from '@/app/stores/settingsStore';
import ContentSection from '@/app/lib/components/contentSection';
import TeamCard from '@/app/lib/components/teams/teamCard';

const AllTeams = observer(() => {
  const addNewTeam = () => {
    console.log('new teams!');
  };
  return (
    <ContentSection
      sectionTitle={settingsStore.t.main.myTeams}
      data={teamsStore.allTeams.slice()}
      DataCard={TeamCard}
      filter
      onlyWithNotification
      addNew={addNewTeam}
    />
  );
});

export default AllTeams;
