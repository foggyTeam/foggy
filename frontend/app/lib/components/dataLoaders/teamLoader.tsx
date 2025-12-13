'use client';

import { useEffect } from 'react';
import { RawTeam } from '@/app/lib/types/definitions';
import useSWR from 'swr';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import teamsStore from '@/app/stores/teamsStore';
import { GetTeam } from '@/app/lib/server/actions/teamServerActions';

export default function TeamLoader({
  teamData,
}: {
  teamData: RawTeam | undefined;
}) {
  const { data: revalidatedData, error } = useSWR(
    teamData ? teamData.id : null,
    () => (teamData ? GetTeam(teamData.id) : undefined),
    {
      fallbackData: teamData,
      revalidateOnFocus: true,
      refreshInterval: 120000, // 2 минуты
    },
  );

  useEffect(() => {
    if (teamData) teamsStore.setActiveTeam(teamData);
    return () => teamsStore.setActiveTeam(null);
  }, [teamData]);

  useEffect(() => {
    if (revalidatedData.id !== teamsStore.activeTeam?.id) return;
    if (!error && revalidatedData)
      teamsStore.revalidateActiveTeam(revalidatedData);
    else
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.team.updateTeamError,
      });
  }, [teamData, revalidatedData, error]);

  return null;
}
