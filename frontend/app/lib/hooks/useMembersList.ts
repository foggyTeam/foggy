import { useEffect, useRef, useState } from 'react';
import {
  SearchAll,
  SearchUsers,
} from '@/app/lib/server/actions/membersServerActions';
import projectsStore from '@/app/stores/projectsStore';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import teamsStore from '@/app/stores/teamsStore';

const limit = 20;

export function useMembersList({
  inputValue,
  memberType,
}: {
  inputValue: string;
  memberType: 'project' | 'team' | 'all';
}) {
  const [membersList, setMembersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [hasMoreTeams, setHasMoreTeams] = useState(true);
  const [teamsNextCursor, setTeamsNextCursor] = useState('');
  const [usersNextCursor, setUsersNextCursor] = useState('');

  const lastQuery = useRef('');

  const loadUsers = async (cursor: string, search: string, append = false) => {
    if (
      (memberType === 'project' && !projectsStore.activeProject) ||
      (memberType === 'team' && !teamsStore.activeTeam)
    )
      return;
    setIsLoading(true);

    const data: any = {
      query: search,
      cursor,
      limit,
      teamId: undefined,
      projectId: undefined,
    };
    if (memberType === 'project')
      data.projectId = projectsStore.activeProject?.id;
    if (memberType === 'team') data.teamId = teamsStore.activeTeam?.id;

    try {
      const result: {
        hasNextPage: boolean;
        nextCursor: string;
        users: any[];
      } = await SearchUsers(data);

      setMembersList((prev) =>
        append ? [...prev, ...result.users] : (result.users ?? []),
      );
      setUsersNextCursor(result.nextCursor || '');
      setHasMoreUsers(result.hasNextPage);
    } catch (error: any) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.user.loadMoreError,
        description: error?.message,
      });
    }

    setIsLoading(false);
  };

  const loadAll = async (
    usersCursor: string,
    teamsCursor: string,
    search: string,
    append = false,
  ) => {
    if (memberType === 'all' && !projectsStore.activeProject) return;
    setIsLoading(true);

    const data: any = {
      query: search,
      usersCursor,
      teamsCursor,
      limit,
      projectId: projectsStore.activeProject?.id,
    };

    try {
      const result: {
        hasMoreUsers: boolean;
        hasMoreTeams: boolean;
        usersNextCursor: string;
        teamsNextCursor: string;
        users: any[];
        teams: any[];
      } = await SearchAll(data);

      const mergedList = [...result.users, ...result.teams].sort((a, b) => {
        const aKey = a['name' in a ? 'name' : 'nickname'];
        const bKey = b['name' in b ? 'name' : 'nickname'];
        return aKey.localeCompare(bKey, 'en', { sensitivity: 'base' });
      });

      setMembersList((prev) =>
        append ? [...prev, ...mergedList] : (mergedList ?? []),
      );
      setUsersNextCursor(result.usersNextCursor || '');
      setTeamsNextCursor(result.teamsNextCursor || '');
      setHasMoreUsers(result.hasMoreUsers);
      setHasMoreUsers(result.hasMoreTeams);
    } catch (error: any) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.user.loadMoreError,
        description: error?.message,
      });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (inputValue.length >= 3 || !inputValue.length) {
      lastQuery.current = inputValue;
      setUsersNextCursor('');
      setTeamsNextCursor('');

      if (memberType !== 'all') {
        loadUsers('', inputValue, false).catch((error) =>
          addToast({
            color: 'danger',
            severity: 'danger',
            title: settingsStore.t.toasts.user.loadMoreError,
            description: error,
          }),
        );
      } else {
        loadAll('', '', inputValue, false).catch((error) =>
          addToast({
            color: 'danger',
            severity: 'danger',
            title: settingsStore.t.toasts.user.loadMoreError,
            description: error,
          }),
        );
      }
    } else {
      setHasMoreUsers(false);
      setHasMoreTeams(false);
      setUsersNextCursor('');
      setTeamsNextCursor('');
    }
  }, [inputValue]);

  const onLoadMoreUsers = async () => {
    if (isLoading || !hasMoreUsers || !usersNextCursor) return;
    await loadUsers(usersNextCursor, lastQuery.current, true);
  };

  const onLoadMoreAll = async () => {
    if (
      isLoading ||
      !(hasMoreUsers || hasMoreTeams) ||
      !(usersNextCursor || teamsNextCursor)
    )
      return;
    await loadAll(usersNextCursor, teamsNextCursor, lastQuery.current, true);
  };

  return {
    membersList,
    isLoading,
    hasMoreUsers,
    hasMoreTeams,
    onLoadMoreUsers,
    onLoadMoreAll,
  };
}
