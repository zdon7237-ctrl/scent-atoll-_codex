import { DbManager } from './utils/db';
import { CouponManager } from './utils/couponManager';

async function syncAutoCoupons() {
  try {
    const templates = await DbManager.getCoupons(false);
    CouponManager.syncTemplatesToUserCoupons(templates);
  } catch (e) {
    console.warn('自动发券同步失败', e);
  }
}

export interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo;
    totalSpend: number;
    cloudEnvId: string;
  }
  userInfoReadyCallback?: (res: WechatMiniprogram.UserInfo) => void
}

App<IAppOption>({
  globalData: {
    totalSpend: 45000,
    cloudEnvId: 'cloud1-8gknss58137b61a2'
  },

  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: this.globalData.cloudEnvId,
        traceUser: true
      });
      console.log('云开发初始化成功');
      void syncAutoCoupons();
    } else {
      console.warn('请使用 2.2.3 或以上的基础库以使用云能力');
    }

    const localSpend = wx.getStorageSync('totalSpend');
    if (typeof localSpend === 'number') {
      this.globalData.totalSpend = localSpend;
    } else {
      wx.setStorageSync('totalSpend', this.globalData.totalSpend);
    }

    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    wx.login({
      success: res => {
        console.log(res.code);
      },
    });
  }
})
