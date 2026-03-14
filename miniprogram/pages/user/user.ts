// miniprogram/pages/user/user.ts
import { PointManager } from '../../utils/pointManager';
import { MemberManager } from '../../utils/memberManager';
import { IAppOption } from '../../app';
import { CouponManager } from '../../utils/couponManager';
import { WalletManager } from '../../utils/walletManager';

const app = getApp<IAppOption>();

const LEVEL_CONFIG = [
  { level: 1, name: '白银', className: 'level-1', benefits: ['全场包邮', '极速发货'] },
  { level: 2, name: '黄金', className: 'level-2', benefits: ['全场95折', '1.1倍积分'] },
  { level: 3, name: '白金', className: 'level-3', benefits: ['全场92折', '1.2倍积分'] },
  { level: 4, name: '钻石', className: 'level-4', benefits: ['全场88折', '1.5倍积分'] },
  { level: 5, name: '黑钻', className: 'level-5', benefits: ['全场85折', '双倍积分'] },
  { level: 6, name: '至尊', className: 'level-6', benefits: ['全场8折', '双倍积分', '专属客服'] }
];

Page({
  data: {
    paddingTop: 0,
    userInfo: {
      nickName: 'ScentAtoll 会员',
      avatarUrl: ''
    },
    levelList: LEVEL_CONFIG,
    currentSwiperIndex: 0,
    userLevelIndex: 0,
    userSpend: 0,
    nextLevelSpend: 0,
    stats: {
      points: 0,
      coupons: 0,
      wallet: '0.00'
    }
  },

  onLoad() {
    this.calcNavBarHeight();
  },

  onShow() {
    this.updateData();
  },

  calcNavBarHeight() {
    let statusBarHeight = 20;
    try {
      const windowInfo = (wx as any).getWindowInfo();
      statusBarHeight = windowInfo.statusBarHeight;
    } catch (e) {
      const sysInfo = wx.getSystemInfoSync();
      statusBarHeight = sysInfo.statusBarHeight;
    }

    this.setData({ paddingTop: statusBarHeight + 44 });
  },

  updateData() {
    const totalSpend = app.globalData.totalSpend || 0;
    const currentLevelInfo = MemberManager.getCurrentLevel(totalSpend);
    const upgradeInfo = MemberManager.getUpgradeProgress(totalSpend);

    let currentIndex = currentLevelInfo.level - 1;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= LEVEL_CONFIG.length) currentIndex = LEVEL_CONFIG.length - 1;

    this.setData({
      userSpend: totalSpend,
      nextLevelSpend: upgradeInfo ? upgradeInfo.needSpend : 0,
      currentSwiperIndex: currentIndex,
      userLevelIndex: currentIndex,
      'stats.points': PointManager.getTotalPoints(),
      'stats.coupons': this.getValidCouponCount(),
      'stats.wallet': WalletManager.getBalance().toFixed(2)
    });
  },

  getValidCouponCount() {
    const coupons = CouponManager.getUserCoupons();
    return coupons.filter(c => CouponManager.getCouponStatus(c) === 0).length;
  },

  onSwiperChange(e: WechatMiniprogram.SwiperChange) {
    this.setData({ currentSwiperIndex: e.detail.current });
  },

  onGoToWallet() { wx.navigateTo({ url: '/pages/wallet/wallet' }); },
  onGoToPointHistory() { wx.navigateTo({ url: '/pages/pointHistory/pointHistory' }); },
  onGoToCoupons() { wx.navigateTo({ url: '/pages/coupons/coupons' }); },
  onGoToPointShop() { wx.navigateTo({ url: '/pages/pointShop/pointShop' }); },
  onGoToCart() { wx.switchTab({ url: '/pages/cart/cart' }); },
  onGoToOrders(e: WechatMiniprogram.TouchEvent) {
    const type = e.currentTarget.dataset.type || 0;
    wx.navigateTo({ url: `/pages/orders/orders?type=${type}` });
  },
  onMemberCode() {
    const levelName = this.data.levelList[this.data.userLevelIndex].name;
    wx.showToast({ title: `${levelName}会员码生成中...`, icon: 'none' });
  }
});
