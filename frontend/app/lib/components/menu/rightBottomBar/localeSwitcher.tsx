'use client';

import { Button } from '@heroui/button';
import settingsStore from '@/app/stores/settingsStore';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { getLocale } from '@/app/lib/locale';
import { addToast } from '@heroui/toast';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

const LocaleSwitcher = observer(() => {
  const { commonSize } = useAdaptiveParams();
  useEffect(() => {
    try {
      getLocale().then((l) => {
        settingsStore.setLocale(l);
      });
    } catch (e: any) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.localeError,
      });
    }
  }, []);

  return (
    <Button
      onPress={() => {
        if (settingsStore.locale == 'en') settingsStore.setLocale('ru');
        else settingsStore.setLocale('en');
      }}
      isIconOnly
      color="secondary"
      variant="light"
      size={commonSize}
      className="font-semibold"
    >
      {settingsStore.locale.toUpperCase()}
    </Button>
  );
});

export default LocaleSwitcher;
