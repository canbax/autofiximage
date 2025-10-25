import { ar } from './locales/ar';
import { bn } from './locales/bn';
import { de } from './locales/de';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { hi } from './locales/hi';
import { id } from './locales/id';
import { it } from './locales/it';
import { ja } from './locales/ja';
import { pt } from './locales/pt';
import { ru } from './locales/ru';
import { tr } from './locales/tr';
import { zh } from './locales/zh';

export const translations = {
  en,
  es,
  tr,
  pt,
  fr,
  de,
  it,
  zh,
  hi,
  ja,
  ru,
  id,
  bn,
  ar,
};

export type Language = keyof typeof translations;
export const LANGUAGES: Language[] = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'hi', 'bn', 'id', 'tr', 'ar'];
export const DEFAULT_LANGUAGE: Language = 'en';