import { ar } from './locales/ar';
import { en } from './locales/en';
import { es } from './locales/es';
import { tr } from './locales/tr';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { pt } from './locales/pt';
import { ru } from './locales/ru';
import { ja } from './locales/ja';
import { zh } from './locales/zh';
import { it } from './locales/it';
import { cs } from './locales/cs';

export const translations = {
  en,
  es,
  tr,
  ar,
  fr,
  de,
  pt,
  ru,
  ja,
  zh,
  it,
  cs,
};

export type Language = keyof typeof translations;
export const LANGUAGES: Language[] = ['en', 'tr', 'es', 'ar', 'fr', 'de', 'pt', 'ru', 'ja', 'zh', 'it', 'cs'];
export const DEFAULT_LANGUAGE: Language = 'en';