import { DbManager } from './utils/db';
import { CouponManager } from './utils/couponManager';
import { AuthService, CloudUserProfile } from './utils/authService';

async function syncAutoCoupons() {
  try {
    const templates = await DbManager.getCoupons(false);
    CouponManager.syncTemplatesToUserCoupons(templates);
  } catch (e) {
    console.warn('自动发券同步失败', e);
  }
}

async function initUserContext(app: WechatMiniprogram.App.Instance<IAppOption>) {
  try {
    const authResult = await AuthService.ensureLogin();
    app.globalData.openid = authResult.openid;
    app.globalData.userId = authResult.userId;
    app.globalData.currentUser = authResult.profile;
    app.globalData.totalSpend = authResult.profile.totalSpend;
    wx.setStorageSync('totalSpend', authResult.profile.totalSpend);
  } catch (e) {
    console.warn('用户身份初始化失败', e);
    app.globalData.totalSpend = 0;
  }
}

export interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo;
    totalSpend: number;
    cloudEnvId: string;
    openid?: string;
    userId?: string;
    currentUser?: CloudUserProfile;
  }
  userInfoReadyCallback?: (res: WechatMiniprogram.UserInfo) => void
}

App<IAppOption>({
  globalData: {
    totalSpend: 0,
    cloudEnvId: 'cloud1-8gknss58137b61a2'
  },

  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: this.globalData.cloudEnvId,
        traceUser: true
      });
      console.log('云开发初始化成功');
      void initUserContext(this);
      void syncAutoCoupons();
    } else {
      console.warn('请使用 2.2.3 或以上的基础库以使用云能力');
    }

    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
  }
})