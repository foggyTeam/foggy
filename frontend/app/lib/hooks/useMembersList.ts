import { useEffect, useRef, useState } from 'react';

const limit = 20;

export function useMembersList({ inputValue }: { inputValue: string }) {
  const [membersList, setMembersList] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  const lastQuery = useRef<string>('');

  const loadMembers = async (
    currentOffset: number,
    search: string,
    append = false,
  ) => {
    setIsLoading(true);

    // TODO: Здесь делай реальный запрос на бэкенд
    // Например:
    // const res = await fetch(`/api/members?search=${search}&offset=${currentOffset}&limit=${limit}`);
    // const data = await res.json();
    const data = Array.from({ length: limit }, (_, i) => ({
      id: `user-${currentOffset + i}`,
      nickname: `User ${currentOffset + i}`,
      avatar: 'https://i.pravatar.cc/40?img=' + ((currentOffset + i) % 70),
    }));

    setMembersList((prev) => (append ? [...prev, ...data] : data));
    setHasMore(data.length === limit); // Если меньше limit, значит всё загрузили
    setIsLoading(false);
  };

  useEffect(() => {
    if (inputValue.length >= 3 || !inputValue.length) {
      setOffset(0);
      lastQuery.current = inputValue;
      loadMembers(0, inputValue, false).catch((error) => console.error(error));
    }
  }, [inputValue]);

  const onLoadMore = async () => {
    if (isLoading || !hasMore) return;
    const newOffset = offset + limit;
    setOffset(newOffset);
    await loadMembers(newOffset, lastQuery.current, true);
  };

  return { membersList, isLoading, hasMore, onLoadMore };
}
