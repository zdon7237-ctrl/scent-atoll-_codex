// miniprogram/pages/index/index.ts
import { IAppOption } from '../../app';
import { MemberManager } from '../../utils/memberManager';
import { DbManager } from '../../utils/db';
import { PerfumeItem } from '../../data/perfumes';

const app = getApp<IAppOption>();

Page({
  data: {
    perfumeList: [] as any[],
    isLoading: false,
    featureTiles: [
      { title: '全部香水', desc: '按价格、销量和新品筛选', target: 'category' },
      { title: '品牌馆', desc: '小众沙龙与经典商业线', target: 'brands' },
      { title: '会员权益', desc: '积分、礼券和会员价', target: 'member' }
    ]
  },

  onLoad() {
    this.loadPerfumes();
  },

  onShow() {
    // 每次显示时重新计算价格（用户等级可能变了）
    this.updateListPrices();

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadPerfumes(false); // 不使用缓存
    wx.stopPullDownRefresh();
  },

  // 从云数据库加载商品
  async loadPerfumes(useCache: boolean = true) {
    this.setData({ isLoading: true });

    try {
      const perfumes = await DbManager.getPerfumes(useCache);
      this.processAndSetPerfumes(perfumes);
    } catch (e) {
      console.error('加载商品失败', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  // 计算并设置商品列表价格
  processAndSetPerfumes(perfumes: PerfumeItem[]) {
    this.setData({ perfumeList: this.formatPerfumeList(perfumes) });
  },

  // 更新价格显示
  updateListPrices() {
    if (this.data.perfumeList.length === 0) return;
    const updated = this.formatPerfumeList(this.data.perfumeList);
    this.setData({ perfumeList: updated });
  },

  // 格式化商品列表（计算会员价）
  formatPerfumeList(list: PerfumeItem[]) {
    const totalSpend = app.globalData.totalSpend || 0;
    const level = MemberManager.getCurrentLevel(totalSpend);
    const isVip = level.discount < 1.0;

    return list.map(item => {
      const isAllowed = item.allowMemberDiscount !== false;
      let displayPrice = item.price;

      if (isVip && isAllowed) {
        displayPrice = MemberManager.calculateDiscountPrice(item.price, totalSpend);
      }

      return {
        ...item,
        displayPrice,
        showMemberTag: isVip && isAllowed,
        showExcludedTag: isVip && !isAllowed
      };
    });
  },

  goToDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  goToCategory() {
    wx.switchTab({ url: '/pages/category/category' });
  },

  goToBrands() {
    wx.switchTab({ url: '/pages/brands/brands' });
  },

  goToMember() {
    wx.switchTab({ url: '/pages/user/user' });
  },

  onFeatureTap(e: any) {
    const target = e.currentTarget.dataset.target;
    if (target === 'category') {
      this.goToCategory();
      return;
    }
    if (target === 'brands') {
      this.goToBrands();
      return;
    }
    this.goToMember();
  }
});
