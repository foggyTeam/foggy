import { useEffect, useRef, useState } from 'react';

const limit = 20;

export function useMembersList({ inputValue }: { inputValue: string }) {
  const [membersList, setMembersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const lastQuery = useRef<string>('');

  const loadMembers = async (
    cursor: string | null,
    search: string,
    append = false,
  ) => {
    setIsLoading(true);

    /*
    const body = {
      query: search,
      limit,
      cursor: cursor || undefined,
    };

    // TODO: get request
    const data: any = await res.json();

    setMembersList((prev) => (append ? [...prev, ...data.users] : data.users));
    setNextCursor(data.nextCursor || null);
    setHasMore(Boolean(data.hasNextPage));*/
    setIsLoading(false);
  };

  useEffect(() => {
    if (inputValue.length >= 3 || !inputValue.length) {
      lastQuery.current = inputValue;
      setNextCursor(null);
      loadMembers(null, inputValue, false).catch(console.error);
    } else {
      setMembersList([]);
      setHasMore(false);
      setNextCursor(null);
    }
  }, [inputValue]);

  const onLoadMore = async () => {
    if (isLoading || !hasMore || !nextCursor) return;
    await loadMembers(nextCursor, lastQuery.current, true);
  };

  return { membersList, isLoading, hasMore, onLoadMore };
}
