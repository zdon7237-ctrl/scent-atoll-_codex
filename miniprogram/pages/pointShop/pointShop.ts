// miniprogram/pages/pointShop/pointShop.ts
import { AccountService } from '../../utils/accountService';

interface GiftItem {
  id: number;
  name: string;
  points: number;
  image: string;
  stock: number;
}

Page({
  data: {
    myPoints: 0,
    redemptionEnabled: false,
    giftList: [
      {
        id: 1,
        name: 'Roja Dove 2ml 随机小样',
        points: 500,
        stock: 10,
        image: '/images/gift-roja-sample.png'
      },
      {
        id: 2,
        name: 'Sultan Pasha 0.2ml 纯精油',
        points: 2000,
        stock: 3,
        image: '/images/gift-oud-oil.png'
      },
      {
        id: 3,
        name: '店铺 100元 无门槛代金券',
        points: 1000,
        stock: 99,
        image: '/images/gift-coupon.png'
      }
    ] as GiftItem[]
  },

  onShow() {
    void this.updatePoints();
  },

  async updatePoints() {
    try {
      const summary = await AccountService.getSummary();
      this.setData({ myPoints: summary.points });
    } catch (e) {
      console.warn('服务端积分加载失败', e);
      this.setData({ myPoints: 0 });
    }
  },

  onGoToHistory() {
    wx.navigateTo({
      url: '/pages/pointHistory/pointHistory'
    });
  },

  onRedeem(e: WechatMiniprogram.TouchEvent) {
    const item = e.currentTarget.dataset.item as GiftItem;

    void item;
    wx.showToast({ title: '积分兑换暂未开放', icon: 'none' });
  }
});
