import type { LocaleCode } from './types';

export const categorySlugs = ['area', 'space', 'style', 'budget', 'tips', 'gallery'] as const;
export type CategorySlug = (typeof categorySlugs)[number];

export const areaRanges = [
  { slug: '30-40sqm', min: 30, max: 40 },
  { slug: '40-50sqm', min: 40, max: 50 },
  { slug: '50-70sqm', min: 50, max: 70 },
  { slug: '70-90sqm', min: 70, max: 90 },
] as const;

export const spaces = ['kitchen', 'bathroom', 'livingroom', 'bedroom', 'balcony', 'entryway'] as const;
export type Space = (typeof spaces)[number];

export const styles = ['nordic', 'japanese', 'modern', 'industrial', 'cream'] as const;
export type Style = (typeof styles)[number];

export const budgetRanges = [
  { slug: 'under-30k', max: 30000 },
  { slug: '30k-80k', min: 30000, max: 80000 },
  { slug: '80k-150k', min: 80000, max: 150000 },
  { slug: 'over-150k', min: 150000 },
] as const;

export const categoryNames: Record<CategorySlug, Record<LocaleCode, string>> = {
  area: { zh: '按面积', en: 'By Area' },
  space: { zh: '按空间', en: 'By Space' },
  style: { zh: '按风格', en: 'By Style' },
  budget: { zh: '按预算', en: 'By Budget' },
  tips: { zh: '避坑指南', en: 'Tips & Traps' },
  gallery: { zh: '图鉴', en: 'Gallery' },
};

export const spaceNames: Record<string, Record<LocaleCode, string>> = {
  kitchen: { zh: '厨房', en: 'Kitchen' },
  bathroom: { zh: '卫生间', en: 'Bathroom' },
  livingroom: { zh: '客厅', en: 'Living Room' },
  bedroom: { zh: '卧室', en: 'Bedroom' },
  balcony: { zh: '阳台', en: 'Balcony' },
  entryway: { zh: '玄关', en: 'Entryway' },
};

export const styleNames: Record<string, Record<LocaleCode, string>> = {
  nordic: { zh: '北欧风', en: 'Scandinavian' },
  japanese: { zh: '日式', en: 'Japandi' },
  modern: { zh: '现代简约', en: 'Modern Minimalist' },
  industrial: { zh: '工业风', en: 'Industrial' },
  cream: { zh: '奶油风', en: 'Cream Style' },
};