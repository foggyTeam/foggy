import { useEffect, useRef, useState } from 'react';
import { SearchUsers } from '@/app/lib/server/actions/membersServerActions';
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
  memberType: 'project' | 'team';
}) {
  const [membersList, setMembersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState('');

  const lastQuery = useRef('');

  const loadMembers = async (
    cursor: string,
    search: string,
    append = false,
  ) => {
    if (
      (memberType === 'project' && !projectsStore.activeProject) ||
      (memberType === 'team' && !teamsStore.activeTeam)
    )
      return;
    setIsLoading(true);

    const data = {
      query: search,
      cursor,
      limit,
      teamId: undefined,
      projectId: undefined,
    };
    if (memberType === 'project')
      data.projectId = projectsStore.activeProject.id;
    if (memberType === 'team') data.teamId = teamsStore.activeTeam.id;

    await SearchUsers(data)
      .then(
        (data: { hasNextPage: boolean; nextCursor: string; users: any[] }) => {
          setMembersList((prev) =>
            append ? [...prev, ...data.users] : (data.users ?? []),
          );
          setNextCursor(data.nextCursor || '');
          setHasMore(data.hasNextPage);
        },
      )
      .catch((error) =>
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.user.loadMoreError,
          description: error,
        }),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (inputValue.length >= 3 || !inputValue.length) {
      lastQuery.current = inputValue;
      setNextCursor('');
      loadMembers('', inputValue, false).catch((error) =>
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.user.loadMoreError,
          description: error,
        }),
      );
    } else {
      setHasMore(false);
      setNextCursor('');
    }
  }, [inputValue]);

  const onLoadMore = async () => {
    if (isLoading || !hasMore || !nextCursor) return;
    await loadMembers(nextCursor, lastQuery.current, true);
  };

  return { membersList, isLoading, hasMore, onLoadMore };
}
