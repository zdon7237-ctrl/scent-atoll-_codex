export interface AccountPointHistoryItem {
  id: string;
  type: 'gain' | 'use' | 'expire';
  amount: number;
  desc: string;
  time: number;
  expireAt?: number;
}

export interface AccountSummary {
  userId: string;
  openid: string;
  points: number;
  totalSpend: number;
  memberLevel: number;
  couponCount: number;
  pointHistory: AccountPointHistoryItem[];
}

export interface AccountSummaryResponse {
  summary: AccountSummary;
}

export interface PointRedeemResponse {
  ok: boolean;
  code?: string;
  message?: string;
}

async function getSummary(): Promise<AccountSummary> {
  const res = await (wx.cloud.callFunction({
    name: 'account_summary',
    data: {}
  }) as Promise<{ result: unknown }>);
  const result = res.result as AccountSummaryResponse;

  if (!result || !result.summary) {
    throw new Error('account_summary returned invalid result');
  }

  return result.summary;
}

async function redeemGift(giftId: number): Promise<PointRedeemResponse> {
  const res = await (wx.cloud.callFunction({
    name: 'point_redeem',
    data: { giftId }
  }) as Promise<{ result: unknown }>);
  return res.result as PointRedeemResponse;
}

export const AccountService = {
  getSummary,
  redeemGift
};
