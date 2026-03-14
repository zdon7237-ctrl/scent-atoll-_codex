import { CouponItem, CouponIssueMode } from './db';

const USER_COUPON_STORAGE_KEY = 'myCoupons';

export type UserCouponStatus = 0 | 1 | 2;

type CouponTemplate = CouponItem;
type UserCouponBase = Omit<CouponItem, 'redeemCode'>;

export interface UserCouponRecord extends UserCouponBase {
  issueMode: CouponIssueMode;
  status: UserCouponStatus;
  receiveTime: number;
}

function resolveIssueMode(template: Pick<CouponItem, 'issueMode'>): CouponIssueMode {
  return template.issueMode === 'auto' ? 'auto' : 'code';
}

function toUserCoupon(template: CouponTemplate, existing?: Partial<UserCouponRecord>): UserCouponRecord {
  const { redeemCode: _redeemCode, ...rest } = template;
  return {
    ...rest,
    issueMode: resolveIssueMode(template),
    status: (existing?.status as UserCouponStatus) ?? 0,
    receiveTime: existing?.receiveTime || Date.now()
  };
}

function stripLegacyFields(coupon: any): UserCouponRecord {
  const { redeemCode: _redeemCode, ...rest } = coupon || {};
  return {
    ...rest,
    issueMode: resolveIssueMode(rest),
    status: typeof rest.status === 'number' ? rest.status : 0,
    receiveTime: typeof rest.receiveTime === 'number' ? rest.receiveTime : Date.now()
  } as UserCouponRecord;
}

function warnMisconfiguredCodeTemplates(templates: CouponTemplate[]) {
  templates.forEach(template => {
    if (resolveIssueMode(template) === 'code' && !template.redeemCode) {
      console.warn(`[coupon template misconfigured] code coupon ${template.id} is missing redeemCode`);
    }
  });
}

export const CouponManager = {
  getUserCoupons(): UserCouponRecord[] {
    const list = (wx.getStorageSync(USER_COUPON_STORAGE_KEY) || []) as any[];
    let changed = false;

    const normalized = list.map(rawCoupon => {
      const coupon = stripLegacyFields(rawCoupon);
      const status = this.getCouponStatus(coupon);
      const nextCoupon: UserCouponRecord = {
        ...coupon,
        status
      };

      if (JSON.stringify(nextCoupon) !== JSON.stringify(rawCoupon)) {
        changed = true;
      }
      return nextCoupon;
    });

    if (changed) {
      this.saveUserCoupons(normalized);
    }

    return normalized;
  },

  saveUserCoupons(coupons: UserCouponRecord[]) {
    wx.setStorageSync(USER_COUPON_STORAGE_KEY, coupons);
  },

  syncTemplatesToUserCoupons(templates: CouponTemplate[]) {
    warnMisconfiguredCodeTemplates(templates);

    const currentCoupons = this.getUserCoupons();
    const couponMap = new Map(currentCoupons.map(coupon => [coupon.id, coupon]));
    let changed = false;

    templates.forEach(template => {
      const existing = couponMap.get(template.id);
      if (existing) {
        const merged = toUserCoupon(template, existing);
        if (JSON.stringify(merged) !== JSON.stringify(existing)) {
          couponMap.set(template.id, merged);
          changed = true;
        }
        return;
      }

      if (resolveIssueMode(template) === 'auto') {
        couponMap.set(template.id, toUserCoupon(template));
        changed = true;
      }
    });

    const mergedCoupons = Array.from(couponMap.values());
    if (changed) {
      this.saveUserCoupons(mergedCoupons);
    }

    return mergedCoupons;
  },

  redeemCouponByCode(code: string, templates: CouponTemplate[]) {
    warnMisconfiguredCodeTemplates(templates);

    const normalizedCode = code.trim().toUpperCase();
    const template = templates.find(item => (
      resolveIssueMode(item) === 'code' &&
      typeof item.redeemCode === 'string' &&
      item.redeemCode.trim().toUpperCase() === normalizedCode
    ));

    if (!template) {
      return { ok: false as const, reason: 'invalid' as const };
    }

    const coupons = this.getUserCoupons();
    const existing = coupons.find(item => item.id === template.id);
    if (existing) {
      return { ok: false as const, reason: 'duplicate' as const };
    }

    const nextCoupon = toUserCoupon(template);
    this.saveUserCoupons([nextCoupon, ...coupons]);
    return { ok: true as const, coupon: nextCoupon };
  },

  markCouponUsed(id: number) {
    const coupons = this.getUserCoupons().map(coupon => (
      coupon.id === id ? { ...coupon, status: 1 as UserCouponStatus } : coupon
    ));
    this.saveUserCoupons(coupons);
  },

  isCouponExpired(coupon: Pick<UserCouponRecord, 'endTime'>) {
    const end = new Date(coupon.endTime).getTime();
    if (!Number.isFinite(end)) return false;
    return end < Date.now();
  },

  getCouponStatus(coupon: Pick<UserCouponRecord, 'status' | 'endTime'>): UserCouponStatus {
    if (coupon.status === 1) return 1;
    if (this.isCouponExpired(coupon)) return 2;
    return 0;
  }
};
