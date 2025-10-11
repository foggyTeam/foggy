'use client';

import { observer } from 'mobx-react-lite';
import { usePathname, useRouter } from 'next/navigation';
import EmptyState from '@/app/lib/components/emptyState';
import { useEffect, useState } from 'react';

const NotFound = observer(() => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const router = useRouter();

  const path = usePathname();

  useEffect(() => {
    console.log(path);
  }, [path]);

  return (
    <EmptyState
      action={{ title: 'Go back', callback: router.back }}
      title="not found"
      size="lg"
      illustrationType={404}
    />
  );
});

export default NotFound;
