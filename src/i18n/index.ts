import type { LocaleCode, Translations } from './types';
import zh from './locales/zh';
import en from './locales/en';

const locales: Record<LocaleCode, Translations> = { zh, en };

export function getTranslations(locale: LocaleCode): Translations {
  return locales[locale] || locales.zh;
}

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

type DotNestedKeys<T> = (
  T extends object
    ? { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : ''
) extends infer D
  ? Extract<D, string>
  : never;

type PathInto<T extends Record<string, unknown>> = keyof {
  [K in keyof T & string as T[K] extends Record<string, unknown>
    ? K | `${K}.${PathInto<T[K]>}`
    : K]: unknown;
};

export function t(locale: LocaleCode, path: PathInto<Translations>): string {
  const keys = path.split('.');
  let result: unknown = locales[locale] || locales.zh;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof result === 'string' ? result : path;
}

export function tCat(locale: LocaleCode, category: string): string {
  const cats = getTranslations(locale).categories;
  return (cats as Record<string, string>)[category] || category;
}

export { zh, en };
export type { LocaleCode, Translations };