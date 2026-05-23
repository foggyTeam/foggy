'use client';

import { useEffect } from 'react';
import userStore from '@/app/stores/userStore';
import { Team } from '@/app/lib/types/definitions';
import teamsStore from '@/app/stores/teamsStore';
import useSWR from 'swr';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import { GetAllTeams } from '@/app/lib/server/actions/teamServerActions';

const TeamsLoader = ({ teamsData }: { teamsData: Team[] | undefined }) => {
  const {
    data: revalidatedData,
    error,
    mutate,
  } = useSWR(
    teamsData ? 'allTeams' : null,
    () => (teamsData ? GetAllTeams() : undefined),
    {
      fallbackData: teamsData,
      revalidateOnFocus: true,
      refreshInterval: 300000, // 5 минут
    },
  );

  useEffect(() => {
    if (teamsData && userStore.isAuthenticated) {
      teamsStore.setAllTeams(teamsData);
    }
  }, [teamsData]);

  useEffect(() => {
    if (revalidatedData && !error) teamsStore.setAllTeams(revalidatedData);
    else
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.globalError,
      });
  }, [teamsData, revalidatedData]);

  useEffect(() => {
    mutate();
  }, [teamsStore.revalidateTeamsTrigger, mutate]);

  return null;
};

export default TeamsLoader;
