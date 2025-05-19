'use client';

import { useEffect } from 'react';
import userStore from '@/app/stores/userStore';
import { Team } from '@/app/lib/types/definitions';
import teamsStore from '@/app/stores/teamsStore';

const TeamsLoader = ({ teamsData }: { teamsData: Team[] | undefined }) => {
  useEffect(() => {
    if (teamsData && userStore.isAuthenticated) {
      teamsStore.setAllTeams(teamsData);
    }
  }, [teamsData]);

  return null;
};

export default TeamsLoader;
