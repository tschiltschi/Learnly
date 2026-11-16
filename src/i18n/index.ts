import { useStore } from '@/store/AppStore';
import { DE } from './de';

export type Lang = 'en' | 'de';

export const LANGUAGE_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
];

export function detectLanguage(): Lang {
  try {
    return navigator.language?.toLowerCase().startsWith('de') ? 'de' : 'en';
  } catch {
    return 'en';
  }
}

/** English source strings are the keys; German comes from de.ts. Missing keys fall back to English. */
export function translate(lang: Lang, text: string, vars?: Record<string, string | number>): string {
  let out = lang === 'de' ? (DE[text] ?? text) : text;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}

export type TFn = ((text: string, vars?: Record<string, string | number>) => string) & { lang: Lang; locale: string };

export function makeT(lang: Lang): TFn {
  const t = ((text: string, vars?: Record<string, string | number>) => translate(lang, text, vars)) as TFn;
  t.lang = lang;
  t.locale = lang === 'de' ? 'de-DE' : 'en-GB';
  return t;
}

export function useT(): TFn {
  const { state } = useStore();
  return makeT(state.settings.language ?? 'en');
}
