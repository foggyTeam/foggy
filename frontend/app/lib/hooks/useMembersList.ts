import { useEffect, useRef, useState } from 'react';
import { SearchUsers } from '@/app/lib/server/actions/membersServerActions';
import projectsStore from '@/app/stores/projectsStore';

const limit = 20;

export function useMembersList({ inputValue }: { inputValue: string }) {
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
    if (!projectsStore.activeProject) return;
    setIsLoading(true);

    await SearchUsers({
      query: search,
      projectId: projectsStore.activeProject.id,
      cursor,
      limit,
    })
      .then(
        (data: { hasNextPage: boolean; nextCursor: string; users: any[] }) => {
          setMembersList((prev) =>
            append ? [...prev, ...data.users] : data.users,
          );
          setNextCursor(data.nextCursor || '');
          setHasMore(data.hasNextPage);
        },
      )
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (inputValue.length >= 3 || !inputValue.length) {
      lastQuery.current = inputValue;
      setNextCursor('');
      loadMembers('', inputValue, false).catch((error) => console.error(error));
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
