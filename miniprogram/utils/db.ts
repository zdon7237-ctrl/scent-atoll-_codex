import { PerfumeItem, allPerfumes } from '../data/perfumes';
import { BrandItem, CategoryData, brandCategories } from '../data/brands';

const CACHE_KEYS = {
  perfumes: 'cache_perfumes',
  brands: 'cache_brands',
  coupons: 'cache_coupons'
};

const CACHE_DURATION = 10 * 60 * 1000;
const PERFUME_OVERRIDE_KEY = 'perfume_overrides';

interface CacheData<T> {
  data: T;
  timestamp: number;
}

interface PerfumeOverrideItem {
  allowMemberDiscount?: boolean;
}

type PerfumeOverrideMap = Record<string, PerfumeOverrideItem>;

export type CouponIssueMode = 'auto' | 'code';

export interface CouponItem {
  _id: string;
  id: number;
  name: string;
  value: number;
  min: number;
  type: 'cash' | 'discount';
  startTime: string;
  endTime: string;
  status: number;
  limitBrands: string[];
  desc: string;
  issueMode?: CouponIssueMode;
  redeemCode?: string;
}

function buildOverrideKey(item: { id?: number; _id?: string; overrideKey?: string }, source: 'local' | 'cloud' = 'local') {
  if (item.overrideKey) return item.overrideKey;
  if (typeof item.id === 'number' && Number.isFinite(item.id)) {
    return `id:${item.id}`;
  }
  if (item._id) {
    return `cloud:${item._id}`;
  }
  return `${source}:unknown`;
}

function clonePerfume(item: PerfumeItem): PerfumeItem {
  return {
    ...item,
    tags: Array.isArray(item.tags) ? [...item.tags] : [],
    overrideKey: buildOverrideKey(item)
  };
}

function cloneCategory(category: CategoryData): CategoryData {
  return {
    id: category.id,
    name: category.name,
    items: category.items.map((item: BrandItem) => ({ ...item }))
  };
}

function mapCloudPerfumes(data: any[]): PerfumeItem[] {
  return data.map(item => ({
    id: item.id || parseInt(item._id, 16) % 1000000,
    brand: item.brand,
    name: item.name,
    desc: item.desc,
    price: item.price,
    priceStr: item.priceStr,
    sales: item.sales,
    isNew: item.isNew,
    tags: item.tags || [],
    image: item.image || '',
    stock: item.stock,
    allowMemberDiscount: item.allowMemberDiscount,
    overrideKey: buildOverrideKey(item, 'cloud')
  }));
}

function mapCloudBrands(data: any[]): CategoryData[] {
  const categoryMap = new Map<string, CategoryData>();

  data.forEach(item => {
    const categoryId = item.categoryId;
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        id: categoryId,
        name: item.categoryName,
        items: []
      });
    }

    categoryMap.get(categoryId)!.items.push({
      name: item.name,
      letter: item.letter,
      logo: item.logo
    });
  });

  return Array.from(categoryMap.values());
}

function normalizeIssueMode(value: any): CouponIssueMode | undefined {
  if (value === 'auto' || value === 'code') return value;
  return undefined;
}

export const DbManager = {
  getDb() {
    return wx.cloud.database();
  },

  getCache<T>(key: string): T | null {
    try {
      const cached = wx.getStorageSync(key) as CacheData<T>;
      if (cached && cached.data && cached.timestamp) {
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          return cached.data;
        }
      }
    } catch (e) {
      console.warn(`[cache read failed] ${key}`, e);
    }
    return null;
  },

  setCache<T>(key: string, data: T) {
    try {
      wx.setStorageSync(key, {
        data,
        timestamp: Date.now()
      } as CacheData<T>);
    } catch (e) {
      console.warn(`[cache write failed] ${key}`, e);
    }
  },

  clearCache(key?: string) {
    if (key) {
      wx.removeStorageSync(key);
      return;
    }
    Object.values(CACHE_KEYS).forEach(cacheKey => wx.removeStorageSync(cacheKey));
  },

  getPerfumeOverrides(): PerfumeOverrideMap {
    try {
      const overrides = wx.getStorageSync(PERFUME_OVERRIDE_KEY);
      return overrides && typeof overrides === 'object' ? overrides : {};
    } catch (e) {
      console.warn('[perfume overrides read failed]', e);
      return {};
    }
  },

  savePerfumeOverrides(overrides: PerfumeOverrideMap) {
    wx.setStorageSync(PERFUME_OVERRIDE_KEY, overrides);
  },

  setPerfumeDiscountOverride(key: string | number, allowMemberDiscount: boolean) {
    const overrideKey = String(key);
    const overrides = this.getPerfumeOverrides();
    overrides[overrideKey] = {
      ...(overrides[overrideKey] || {}),
      allowMemberDiscount
    };
    this.savePerfumeOverrides(overrides);
  },

  clearPerfumeOverrides() {
    wx.removeStorageSync(PERFUME_OVERRIDE_KEY);
  },

  applyPerfumeOverrides(perfumes: PerfumeItem[]): PerfumeItem[] {
    const overrides = this.getPerfumeOverrides();
    return perfumes.map(item => {
      const cloned = clonePerfume(item);
      const override = overrides[cloned.overrideKey || buildOverrideKey(cloned)];
      if (override && typeof override.allowMemberDiscount === 'boolean') {
        cloned.allowMemberDiscount = override.allowMemberDiscount;
      }
      return cloned;
    });
  },

  getLocalPerfumes(): PerfumeItem[] {
    return allPerfumes.map(item => ({
      ...clonePerfume(item),
      overrideKey: buildOverrideKey(item, 'local')
    }));
  },

  getLocalBrands(): CategoryData[] {
    return brandCategories.map(cloneCategory);
  },

  async getPerfumes(useCache: boolean = true): Promise<PerfumeItem[]> {
    const cacheKey = CACHE_KEYS.perfumes;

    if (useCache) {
      const cached = this.getCache<PerfumeItem[]>(cacheKey);
      if (cached && cached.length > 0) {
        return this.applyPerfumeOverrides(cached);
      }
    }

    try {
      const res = await this.getDb().collection('perfumes').get();
      const perfumes = mapCloudPerfumes(res.data as any[]);
      if (perfumes.length > 0) {
        this.setCache(cacheKey, perfumes);
        return this.applyPerfumeOverrides(perfumes);
      }
    } catch (e) {
      console.error('[get perfumes failed]', e);
    }

    return this.applyPerfumeOverrides(this.getLocalPerfumes());
  },

  async getPerfumeById(id: number, useCache: boolean = true): Promise<PerfumeItem | null> {
    const perfumes = await this.getPerfumes(useCache);
    return perfumes.find(item => item.id === id) || null;
  },

  async getBrands(useCache: boolean = true): Promise<CategoryData[]> {
    const cacheKey = CACHE_KEYS.brands;

    if (useCache) {
      const cached = this.getCache<CategoryData[]>(cacheKey);
      if (cached && cached.length > 0) {
        return cached.map(cloneCategory);
      }
    }

    try {
      const res = await this.getDb().collection('brands').orderBy('sort', 'asc').get();
      const categories = mapCloudBrands(res.data as any[]);
      if (categories.length > 0) {
        this.setCache(cacheKey, categories);
        return categories.map(cloneCategory);
      }
    } catch (e) {
      console.error('[get brands failed]', e);
    }

    return this.getLocalBrands();
  },

  async getCoupons(useCache: boolean = true): Promise<CouponItem[]> {
    const cacheKey = CACHE_KEYS.coupons;

    if (useCache) {
      const cached = this.getCache<CouponItem[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const res = await this.getDb().collection('coupons').get();
      const coupons: CouponItem[] = (res.data as any[]).map(item => ({
        _id: item._id,
        id: item.id || parseInt(item._id.slice(-6), 16),
        name: item.name,
        value: item.value,
        min: item.min,
        type: item.type,
        startTime: item.startTime,
        endTime: item.endTime,
        status: item.status,
        limitBrands: item.limitBrands || [],
        desc: item.desc,
        issueMode: normalizeIssueMode(item.issueMode),
        redeemCode: item.redeemCode
      }));

      this.setCache(cacheKey, coupons);
      return coupons;
    } catch (e) {
      console.error('[get coupons failed]', e);
      return this.getCache<CouponItem[]>(cacheKey) || [];
    }
  }
};
