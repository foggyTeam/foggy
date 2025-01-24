import { createContext } from 'react';
import settingsStore from './settingsStore';

export const SettingsContext = createContext(settingsStore);
