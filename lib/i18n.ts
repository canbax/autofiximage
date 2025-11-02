import { ar } from './locales/ar';
import { en } from './locales/en';
import { es } from './locales/es';
import { tr } from './locales/tr';

export const translations = {
  en,
  es,
  tr,
  ar,
};

export type Language = keyof typeof translations;
export const LANGUAGES: Language[] = ['tr', 'en', 'es', 'ar'];
export const DEFAULT_LANGUAGE: Language = 'en';