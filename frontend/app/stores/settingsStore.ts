import {
  action,
  autorun,
  computed,
  makeAutoObservable,
  observable,
} from 'mobx';
import en from '../lib/dictionaries/en.json';
import ru from '../lib/dictionaries/ru.json';
import { AvailableLocales } from '@/app/lib/types/definitions';
import { getLocale, updateLocale } from '@/app/lib/locale';

class SettingsStore {
  locale: AvailableLocales = 'en';

  constructor() {
    makeAutoObservable(this, {
      locale: observable,
      t: computed,
      setLocale: action,
    });

    autorun(() => {
      try {
        getLocale().then((l) => {
          this.setLocale(l);
        });
      } catch (e: any) {
        console.error(e.message);
      }
    });
    autorun(async () => {
      try {
        await updateLocale(this.locale);
      } catch (e: any) {
        console.error(e.message);
      }
    });
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
