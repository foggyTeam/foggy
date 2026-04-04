'use client';

import { observer } from 'mobx-react-lite';
import { usePathname, useRouter } from 'next/navigation';
import EmptyState from '@/app/lib/components/emptyState';
import { useEffect, useState } from 'react';
import settingsStore from '@/app/stores/settingsStore';

const NotFound = observer(() => {
  const regexMap = {
    board: {
      regex: /project\/[^\/]+\/[^\/]+\/[^\/]+\/(simple|graph|doc)$/,
      text: settingsStore.t.projects.notFoundBoard,
    },
    section: {
      regex: /project\/[^\/]+\/[^\/]+$/,
      text: settingsStore.t.projects.notFoundSection,
    },
    project: {
      regex: /project\/[^\/]+$/,
      text: settingsStore.t.projects.notFound,
    },
    team: { regex: /team\/[^\/]+$/, text: settingsStore.t.team.notFound },
    other: { regex: /^.*$/, text: settingsStore.t.main.notFound },
  };

  const [text, setText] = useState<{
    title: string;
    text: string;
    action: string;
  }>({
    title: '',
    text: '',
    action: '',
  });
  const router = useRouter();
  const [callback, setCallback] = useState<() => void>(() => {});
  const path = usePathname();

  useEffect(() => {
    setCallback(() => router.back());
    for (const [key, item] of Object.entries(regexMap)) {
      if (item.regex.test(path)) {
        setText({ action: '', ...item.text });
        if (key === 'other') setCallback(() => router.push('/'));
        break;
      }
    }
  }, [path, router]);

  return (
    <EmptyState
      rightButton={{ title: text.action, callback }}
      title={text.title}
      text={text.text}
      size="full"
      illustrationType={404}
    />
  );
});

export default NotFound;
