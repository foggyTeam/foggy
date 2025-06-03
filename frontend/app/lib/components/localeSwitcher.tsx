'use client';

import { Button } from '@heroui/button';
import settingsStore from '@/app/stores/settingsStore';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { getLocale } from '@/app/lib/locale';
import { addToast } from '@heroui/toast';

const LocaleSwitcher = observer(() => {
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
    <div className="invisible absolute bottom-4 right-4 z-50 sm:visible">
      <Button
        onPress={() => {
          if (settingsStore.locale == 'en') settingsStore.setLocale('ru');
          else settingsStore.setLocale('en');
        }}
        isIconOnly
        color="secondary"
        variant="light"
        size="md"
        className="font-semibold"
      >
        {settingsStore.locale.toUpperCase()}
      </Button>
    </div>
  );
});

export default LocaleSwitcher;
