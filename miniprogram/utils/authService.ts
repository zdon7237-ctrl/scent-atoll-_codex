export interface CloudUserProfile {
  _id: string;
  openid: string;
  nickName: string;
  avatarUrl: string;
  totalSpend: number;
  memberLevel: number;
  points: number;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export interface AuthLoginResult {
  openid: string;
  userId: string;
  isNewUser: boolean;
  profile: CloudUserProfile;
}

const USER_CACHE_KEY = 'cloud_current_user';

function getCachedAuthResult(): AuthLoginResult | null {
  try {
    const cached = wx.getStorageSync(USER_CACHE_KEY);
    return cached && typeof cached === 'object' ? cached as AuthLoginResult : null;
  } catch (e) {
    console.warn('读取用户缓存失败', e);
    return null;
  }
}

function saveCachedAuthResult(result: AuthLoginResult) {
  wx.setStorageSync(USER_CACHE_KEY, result);
}

function login(): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve(res.code);
          return;
        }
        reject(new Error('wx.login missing code'));
      },
      fail: reject
    });
  });
}

async function ensureLogin(force: boolean = false): Promise<AuthLoginResult> {
  if (!force) {
    const cached = getCachedAuthResult();
    if (cached) return cached;
  }

  const code = await login();
  const res = await (wx.cloud.callFunction({
    name: 'auth_login',
    data: { code }
  }) as Promise<{ result: unknown }>);
  const result = res.result as AuthLoginResult;

  if (!result || !result.userId || !result.openid || !result.profile) {
    throw new Error('auth_login returned invalid result');
  }

  saveCachedAuthResult(result);
  return result;
}

function getCurrentUser(): CloudUserProfile | null {
  const cached = getCachedAuthResult();
  return cached ? cached.profile : null;
}

function clearCurrentUserCache() {
  wx.removeStorageSync(USER_CACHE_KEY);
}

export const AuthService = {
  ensureLogin,
  getCachedAuthResult,
  getCurrentUser,
  clearCurrentUserCache
};