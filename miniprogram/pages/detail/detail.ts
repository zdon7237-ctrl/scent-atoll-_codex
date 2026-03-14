// miniprogram/pages/detail/detail.ts
import { PerfumeItem } from '../../data/perfumes';
import { MemberManager } from '../../utils/memberManager';
import { IAppOption } from '../../app';
import { DbManager } from '../../utils/db';

Page({
  data: {
    info: null as PerfumeItem | null,
    showShare: false,
    isLoading: true,

    // UI状态字段
    currentPrice: 0,
    showMemberPrice: false,
    showExcludedTag: false
  },

  async onLoad(options: any) {
    const id = Number(options.id);

    try {
      // 从云数据库获取商品
      const target = await DbManager.getPerfumeById(id);

      if (target) {
        const app = getApp<IAppOption>();
        const totalSpend = app.globalData.totalSpend || 0;

        const level = MemberManager.getCurrentLevel(totalSpend);
        const isVip = level.discount < 1.0;

        const isAllowed = target.allowMemberDiscount !== false;

        const showMemberPrice = isVip && isAllowed;
        const showExcludedTag = isVip && !isAllowed;

        const finalPrice = showMemberPrice
          ? MemberManager.calculateDiscountPrice(target.price, totalSpend)
          : target.price;

        this.setData({
          info: target,
          currentPrice: finalPrice,
          showMemberPrice: showMemberPrice,
          showExcludedTag: showExcludedTag,
          isLoading: false
        });

        wx.setNavigationBarTitle({ title: target.name });
      } else {
        this.setData({ isLoading: false });
        wx.showToast({ title: '商品不存在', icon: 'none' });
      }
    } catch (e) {
      console.error('加载商品详情失败', e);
      this.setData({ isLoading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  openShareModal() { this.setData({ showShare: true }); },
  closeShareModal() { this.setData({ showShare: false }); },

  addToCart() {
    const item = this.data.info;
    if (!item) return;

    let cart = wx.getStorageSync('myCart') || [];
    const index = cart.findIndex((p: any) => p.id === item.id);
    if (index > -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1, selected: true, spec: '标准装' });
    }
    wx.setStorageSync('myCart', cart);
    wx.showToast({ title: '已加入购物袋', icon: 'success' });
  },

  buyNow() {
    this.addToCart();
    setTimeout(() => { wx.switchTab({ url: '/pages/cart/cart' }); }, 500);
  },

  goHome() { wx.switchTab({ url: '/pages/index/index' }); },
  goToCart() { wx.switchTab({ url: '/pages/cart/cart' }); }
});