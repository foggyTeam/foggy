import { makeAutoObservable } from 'mobx';
import en from '../lib/dictionaries/en.json';
import ru from '../lib/dictionaries/ru.json';

export type availableLocales = 'en' | 'ru';

class SettingsStore {
  locale: availableLocales = 'ru';
  translations = {
    en: en,
    ru: ru,
  };

  constructor() {
    makeAutoObservable(this);
  }

  setLocale(newLocale: availableLocales) {
    this.locale = newLocale;
  }

  get t() {
    return this.translations[this.locale];
  }
}

const settingsStore = new SettingsStore();
export default settingsStore;
