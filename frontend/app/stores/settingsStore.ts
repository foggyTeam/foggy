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
  isLoading: boolean = false;
  isGeneratingBoard: boolean = false;

  constructor() {
    makeAutoObservable(this, {
      // LOCALE
      locale: observable,
      t: computed,
      setLocale: action,
      // LOADING BAR
      isLoading: observable,
      startLoading: action,
      endLoading: action,
    });

    reaction(
      () => this.locale,
      async (locale) => {
        try {
          await updateLocale(locale);
        } catch (e: any) {
          addToast({
            color: 'danger',
            severity: 'danger',
            title: this.t.toasts.localeError,
          });
        }
      },
    );
  }

  // LOCALE
  setLocale(newLocale: AvailableLocales) {
    this.locale = newLocale;
  }
  get t() {
    return this.locale == 'en' ? en : ru;
  }

  // LOADING BAR
  startLoading() {
    this.isLoading = true;
  }
  endLoading() {
    this.isLoading = false;
  }

  // AI GENERATION LOADING
  startAiLoading() {
    this.isGeneratingBoard = true;
  }
  endAiLoading() {
    this.isGeneratingBoard = false;
  }
}

const settingsStore = new SettingsStore();
export default settingsStore;
