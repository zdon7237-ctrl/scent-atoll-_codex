import { DbManager, CouponItem } from '../../utils/db';
import { CouponManager, UserCouponRecord } from '../../utils/couponManager';

Page({
  data: {
    activeTab: 0,
    exchangeCode: '',
    allCoupons: [] as UserCouponRecord[],
    displayList: [] as UserCouponRecord[],
    couponTemplates: [] as CouponItem[],
    selectedId: 0,
    isLoading: true,
    isCartSource: false
  },

  onLoad(options: any) {
    const isCartSource = options.source === 'cart';
    if (isCartSource) {
      wx.setNavigationBarTitle({ title: '选择优惠券' });
      const current = wx.getStorageSync('selectedCoupon');
      if (current) {
        this.setData({ selectedId: current.id });
      }
    }

    this.setData({ isCartSource });
    this.loadCoupons();
  },

  async onPullDownRefresh() {
    await this.loadCoupons(false);
    wx.stopPullDownRefresh();
  },

  async loadCoupons(useCache: boolean = true) {
    this.setData({ isLoading: true });
    try {
      const templates = await DbManager.getCoupons(useCache);
      const coupons = CouponManager.syncTemplatesToUserCoupons(templates);
      this.setData({
        couponTemplates: templates,
        allCoupons: coupons
      });
      this.updateDisplayList();
    } catch (e) {
      console.error('加载优惠券失败', e);
      this.setData({
        couponTemplates: [],
        allCoupons: CouponManager.getUserCoupons()
      });
      this.updateDisplayList();
    } finally {
      this.setData({ isLoading: false });
    }
  },

  onTabChange(e: any) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({ activeTab: index });
    this.updateDisplayList();
  },

  updateDisplayList() {
    const { activeTab, allCoupons } = this.data;
    const coupons = allCoupons.map(coupon => ({
      ...coupon,
      status: CouponManager.getCouponStatus(coupon)
    }));

    CouponManager.saveUserCoupons(coupons);

    const filtered = coupons.filter(coupon => (
      activeTab === 0 ? coupon.status === 0 : coupon.status !== 0
    ));

    this.setData({
      allCoupons: coupons,
      displayList: filtered
    });
  },

  onUseCoupon(e: any) {
    if (this.data.activeTab !== 0) return;

    const index = Number(e.currentTarget.dataset.index);
    const coupon = this.data.displayList[index];
    if (!coupon || CouponManager.getCouponStatus(coupon) !== 0) {
      wx.showToast({ title: '该优惠券不可用', icon: 'none' });
      return;
    }

    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.route.includes('cart')) {
      wx.setStorageSync('selectedCoupon', coupon);
      this.setData({ selectedId: coupon.id });
      wx.navigateBack();
      return;
    }

    if (coupon.limitBrands && coupon.limitBrands.length > 0) {
      const targetBrand = coupon.limitBrands[0];
      wx.setStorageSync('tempSearchFilter', targetBrand);
      wx.showToast({ title: `前往 ${targetBrand} 专区`, icon: 'none' });
    } else {
      wx.removeStorageSync('tempSearchFilter');
      wx.showToast({ title: '前往全部商品', icon: 'none' });
    }

    setTimeout(() => {
      wx.switchTab({ url: '/pages/category/category' });
    }, 500);
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  onInputCode(e: any) {
    this.setData({ exchangeCode: (e.detail.value || '').toUpperCase() });
  },

  onExchange() {
    const code = this.data.exchangeCode.trim().toUpperCase();
    if (!code) {
      wx.showToast({ title: '请输入兑换码', icon: 'none' });
      return;
    }

    const result = CouponManager.redeemCouponByCode(code, this.data.couponTemplates);
    if (!result.ok) {
      wx.showToast({
        title: result.reason === 'duplicate' ? '该优惠券已领取' : '兑换码无效',
        icon: 'none'
      });
      return;
    }

    const coupons = CouponManager.getUserCoupons();
    this.setData({
      exchangeCode: '',
      activeTab: 0,
      allCoupons: coupons,
      selectedId: result.coupon.id
    });
    this.updateDisplayList();
    wx.showToast({ title: '领取成功', icon: 'success' });
  }
});
