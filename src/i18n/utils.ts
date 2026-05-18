import type { LocaleCode } from './types';

export function getLocaleFromUrl(url: URL): LocaleCode {
  const path = url.pathname;
  if (path.startsWith('/en/') || path === '/en') return 'en';
  return 'zh';
}

export function getLocalePath(path: string, locale: LocaleCode): string {
  const clean = path.replace(/^\/(en|zh)\/?/, '').replace(/\/$/, '') || '';
  if (locale === 'zh') return `/zh/${clean}`;
  return `/en/${clean}`;
}

export function getLangDir(locale: LocaleCode): 'ltr' | 'rtl' {
  return 'ltr';
}

export function getAlternateUrls(path: string): Array<{ locale: LocaleCode; url: string }> {
  const clean = path.replace(/^\/(en|zh)\/?/, '').replace(/\/$/, '') || '';
  return [
    { locale: 'zh', url: `/zh/${clean}` },
    { locale: 'en', url: `/en/${clean}` },
  ];
}

export function formatArea(sqm: number, locale: LocaleCode): string {
  if (locale === 'zh') return `${sqm}㎡`;
  const sqft = Math.round(sqm * 10.7639);
  return `${sqm} sqm (${sqft} sq ft)`;
}

export function formatBudget(amount: number, locale: LocaleCode): string {
  if (locale === 'zh') {
    if (amount >= 10000) return `${(amount / 10000).toFixed(1)}万元`;
    return `${amount}元`;
  }
  if (amount >= 10000) return `$${(amount / 10000 * 1400).toFixed(0)} (CN¥${(amount / 10000).toFixed(1)}万)`;
  return `CN¥${amount}`;
}

export function estimateReadingTime(text: string, locale: LocaleCode): number {
  const cjkChars = (text.match(/[一-鿿㐀-䶿]/g) || []).length;
  const wordChars = (text.match(/[a-zA-Z]+/g) || []).length;
  if (locale === 'zh') return Math.max(1, Math.ceil(cjkChars / 400 + wordChars / 200));
  return Math.max(1, Math.ceil((cjkChars / 2 + wordChars) / 200));
}