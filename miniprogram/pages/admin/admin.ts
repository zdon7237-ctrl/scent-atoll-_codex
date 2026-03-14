import { IAppOption } from '../../app';
import { DbManager } from '../../utils/db';

const app = getApp<IAppOption>();

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

Page({
  data: {
    perfumes: [] as any[],
    currentSpend: 0,
    userLevel: '加载中'
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    const spend = app.globalData.totalSpend || 0;
    let levelName = '普通会员';
    if (spend >= 20000) levelName = '钻石 (88折)';
    else if (spend >= 1000) levelName = '黄金 (95折)';

    try {
      const perfumes = await DbManager.getPerfumes();
      this.setData({
        perfumes: formatPerfumes(perfumes),
        currentSpend: spend,
        userLevel: levelName
      });
    } catch (e) {
      console.error('加载测试数据失败', e);
      this.setData({
        perfumes: [],
        currentSpend: spend,
        userLevel: levelName
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

  simulateVip() {
    const newSpend = 25000;
    app.globalData.totalSpend = newSpend;
    wx.setStorageSync('totalSpend', newSpend);
    this.loadData();
    wx.showToast({ title: '已升级，去首页看看', icon: 'none' });
  },

  resetUser() {
    app.globalData.totalSpend = 0;
    wx.setStorageSync('totalSpend', 0);
    this.loadData();
    wx.showToast({ title: '已重置为普通会员', icon: 'none' });
  }
});
