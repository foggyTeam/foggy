'use client';

import { Button } from '@heroui/button';
import SettingsStore from '@/app/stores/settingsStore';
import { observer } from 'mobx-react-lite';

const LocaleSwitcher = observer(() => {
  return (
    <div className="absolute bottom-4 right-4 z-50">
      <Button
        onPress={() => {
          SettingsStore.locale == 'en'
            ? SettingsStore.setLocale('ru')
            : SettingsStore.setLocale('en');
        }}
        isIconOnly
        color="secondary"
        variant="light"
        size="md"
        className="font-semibold"
      >
        {SettingsStore.locale.toUpperCase()}
      </Button>
    </div>
  );
});

export default LocaleSwitcher;
