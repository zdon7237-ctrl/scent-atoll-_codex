import { IAppOption } from '../../app';
import { DbManager } from '../../utils/db';
import { CouponManager, UserCouponRecord } from '../../utils/couponManager';
import { OrderManager, OrderRecord } from '../../utils/orderManager';
import { WalletManager } from '../../utils/walletManager';
import { createDevtoolCartItems, createDevtoolCoupons, createDevtoolOrders, getMemberSpendPreset } from '../../utils/devtoolsFixtures.js';

const app = getApp<IAppOption>();

const RESET_KEYS = [
  'myCart',
  'selectedCoupon',
  'myOrders',
  'myCoupons',
  'myWallet',
  'wallet_history',
  'point_ledger',
  'point_history',
  'totalSpend',
  'tempSearchFilter'
];

function resolveUserLevel(totalSpend: number) {
  if (totalSpend >= 50000) return '黑钻会员';
  if (totalSpend >= 20000) return '钻石会员';
  if (totalSpend >= 1000) return '黄金会员';
  return '普通会员';
}

function formatPerfumes(list: any[]) {
  return list.map(item => {
    const isEnabled = item.allowMemberDiscount !== false;
    return {
      ...item,
      discountEnabled: isEnabled,
      discountColor: isEnabled ? 'green' : 'red',
      discountLabel: isEnabled ? '参与折扣' : '不参与折扣'
    };
  });
}

async function getPerfumesForCart() {
  try {
    const perfumes = await DbManager.getPerfumes();
    if (perfumes.length > 0) return perfumes;
  } catch (e) {
    console.warn('加载购物车测试商品失败，改用本地兜底', e);
  }
  return DbManager.getLocalPerfumes();
}

Page({
  data: {
    perfumes: [] as any[],
    currentSpend: 0,
    userLevel: '加载中',
    couponCount: 0,
    orderCount: 0
  },

  onShow() {
    void this.loadData();
  },

  async loadData() {
    const spend = Number(app.globalData.totalSpend || wx.getStorageSync('totalSpend') || 0);

    try {
      const perfumes = await DbManager.getPerfumes();
      this.setData({
        perfumes: formatPerfumes(perfumes),
        currentSpend: spend,
        userLevel: resolveUserLevel(spend),
        couponCount: CouponManager.getUserCoupons().length,
        orderCount: OrderManager.getOrders().length
      });
    } catch (e) {
      console.error('加载测试工具数据失败', e);
      this.setData({
        perfumes: [],
        currentSpend: spend,
        userLevel: resolveUserLevel(spend),
        couponCount: CouponManager.getUserCoupons().length,
        orderCount: OrderManager.getOrders().length
      });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async toggleDiscountStatus(e: any) {
    const fallbackKey = `id:${e.currentTarget.dataset.id}`;
    const overrideKey = e.currentTarget.dataset.key || fallbackKey;
    const allowMemberDiscount = !!e.detail.value;
    DbManager.setPerfumeDiscountOverride(overrideKey, allowMemberDiscount);
    await this.loadData();
  },

  applyMemberPreset(e: any) {
    const preset = String(e.currentTarget.dataset.preset || 'normal');
    const spend = Number(getMemberSpendPreset(preset));
    app.globalData.totalSpend = spend;
    wx.setStorageSync('totalSpend', spend);
    void this.loadData();
    wx.showToast({ title: '会员场景已注入', icon: 'none' });
  },

  injectCoupons() {
    const coupons = createDevtoolCoupons() as UserCouponRecord[];
    CouponManager.saveUserCoupons(coupons);
    void this.loadData();
    wx.showToast({ title: '测试券包已注入', icon: 'success' });
  },

  injectOrders() {
    const orders = createDevtoolOrders() as OrderRecord[];
    OrderManager.saveOrders(orders);
    void this.loadData();
    wx.showToast({ title: '测试订单已注入', icon: 'success' });
  },

  async injectCart() {
    const perfumes = await getPerfumesForCart();
    wx.setStorageSync('myCart', createDevtoolCartItems(perfumes));
    wx.showToast({ title: '测试购物车已注入', icon: 'success' });
  },

  resetAllState() {
    RESET_KEYS.forEach(key => wx.removeStorageSync(key));
    CouponManager.saveUserCoupons([]);
    OrderManager.saveOrders([]);
    WalletManager.setBalance(0);
    WalletManager.saveHistory([]);
    DbManager.clearPerfumeOverrides();
    DbManager.clearCache();
    app.globalData.totalSpend = 0;
    void this.loadData();
    wx.showToast({ title: '测试状态已重置', icon: 'success' });
  },

  openPage(e: any) {
    const target = String(e.currentTarget.dataset.target || '');
    if (!target) return;

    const switchTabTargets = new Set([
      '/pages/index/index',
      '/pages/category/category',
      '/pages/cart/cart',
      '/pages/user/user'
    ]);

    if (switchTabTargets.has(target)) {
      wx.switchTab({ url: target });
      return;
    }

    wx.navigateTo({ url: target });
  }
});
