import {
  action,
  computed,
  makeAutoObservable,
  observable,
  reaction,
} from 'mobx';
import en from '../lib/dictionaries/en/dictionary';
import ru from '../lib/dictionaries/ru/dictionary';
import { AvailableLocales } from '@/app/lib/types/definitions';
import { updateLocale } from '@/app/lib/locale';
import { addToast } from '@heroui/toast';

class SettingsStore {
  locale: AvailableLocales = 'en';

  constructor() {
    makeAutoObservable(this, {
      locale: observable,
      t: computed,
      setLocale: action,
    });

    reaction(
      () => this.locale,
      async (locale) => {
        try {
          await updateLocale(locale);
        } catch (e: any) {
          addToast({
            severity: 'danger',
            title: this.t.toasts.localeError,
          });
        }
      },
    );
  }

  setLocale(newLocale: AvailableLocales) {
    this.locale = newLocale;
  }

  get t() {
    return this.locale == 'en' ? en : ru;
  }
}

const settingsStore = new SettingsStore();
export default settingsStore;
