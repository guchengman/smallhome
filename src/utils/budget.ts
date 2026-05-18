export interface BudgetConfig {
  areaSqm: number;
  level: 'basic' | 'standard' | 'premium';
  cityTier: 1 | 2 | 3;
}

export interface BudgetItem {
  category: string;
  labelZh: string;
  labelEn: string;
  percentage: number;
  color: string;
}

export interface BudgetResult {
  total: number;
  items: Array<BudgetItem & { amount: number }>;
}

const BUDGET_CATEGORIES: BudgetItem[] = [
  { category: 'electrical', labelZh: '水电改造', labelEn: 'Electrical & Plumbing', percentage: 10, color: '#d97706' },
  { category: 'tiling', labelZh: '泥工贴砖', labelEn: 'Tiling', percentage: 15, color: '#059669' },
  { category: 'carpentry', labelZh: '木工定制', labelEn: 'Carpentry', percentage: 35, color: '#3b82f6' },
  { category: 'painting', labelZh: '油漆涂料', labelEn: 'Painting', percentage: 8, color: '#8b5cf6' },
  { category: 'materials', labelZh: '主材采购', labelEn: 'Main Materials', percentage: 20, color: '#ec4899' },
  { category: 'furnishing', labelZh: '软装家具', labelEn: 'Furnishings', percentage: 12, color: '#f59e0b' },
];

const LEVEL_PRICES: Record<BudgetConfig['level'], number> = {
  basic: 600,
  standard: 1200,
  premium: 2500,
};

const CITY_MULTIPLIERS: Record<number, number> = {
  1: 1.2,
  2: 1.0,
  3: 0.8,
};

export function calculateBudget(config: BudgetConfig): BudgetResult {
  const pricePerSqm = LEVEL_PRICES[config.level];
  const multiplier = CITY_MULTIPLIERS[config.cityTier];
  const total = Math.round(config.areaSqm * pricePerSqm * multiplier);

  const items = BUDGET_CATEGORIES.map((cat) => ({
    ...cat,
    amount: Math.round((total * cat.percentage) / 100),
  }));

  return { total, items };
}

export { BUDGET_CATEGORIES, LEVEL_PRICES, CITY_MULTIPLIERS };