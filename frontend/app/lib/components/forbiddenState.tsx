'use client';

import EmptyState from '@/app/lib/components/emptyState';
import { observer } from 'mobx-react-lite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import settingsStore from '@/app/stores/settingsStore';

const ForbiddenState = observer(() => {
  const [type, setType] = useState<'project' | 'team' | 'global'>('global');
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const queryType = params.get('type');
    if (queryType === 'project' || queryType === 'team') {
      setType(queryType);
    }
  }, [params]);
  return (
    <EmptyState
      illustrationType="files"
      size="full"
      rightButton={{
        title: settingsStore.t.forbidden.action,
        callback: () => router.push('/'),
      }}
      text={settingsStore.t.forbidden[type].text}
      title={settingsStore.t.forbidden[type].title}
    />
  );
});

export default ForbiddenState;
