const BALANCE_KEY = 'myWallet';
const HISTORY_KEY = 'wallet_history';

export type WalletTransactionType = 'topup' | 'consume';

export interface WalletTransaction {
  id: number;
  type: WalletTransactionType;
  amount: number;
  desc: string;
  time: number;
  balanceAfter: number;
}

function roundMoney(value: number) {
  return Number((value || 0).toFixed(2));
}

export const WalletManager = {
  getBalance(): number {
    return roundMoney(Number(wx.getStorageSync(BALANCE_KEY) || 0));
  },

  setBalance(amount: number) {
    wx.setStorageSync(BALANCE_KEY, roundMoney(amount));
  },

  getHistory(): WalletTransaction[] {
    return wx.getStorageSync(HISTORY_KEY) || [];
  },

  saveHistory(list: WalletTransaction[]) {
    wx.setStorageSync(HISTORY_KEY, list);
  },

  addHistory(type: WalletTransactionType, amount: number, desc: string, balanceAfter: number) {
    const history = this.getHistory();
    history.unshift({
      id: Date.now(),
      type,
      amount: roundMoney(amount),
      desc,
      time: Date.now(),
      balanceAfter: roundMoney(balanceAfter)
    });
    this.saveHistory(history);
  },

  topUp(amount: number, desc: string = '钱包充值') {
    const current = this.getBalance();
    const next = roundMoney(current + amount);
    this.setBalance(next);
    this.addHistory('topup', amount, desc, next);
    return next;
  },

  consume(amount: number, desc: string = '购物消费') {
    const current = this.getBalance();
    const cost = roundMoney(amount);
    if (cost > current) {
      return { ok: false as const, balance: current };
    }

    const next = roundMoney(current - cost);
    this.setBalance(next);
    this.addHistory('consume', cost, desc, next);
    return { ok: true as const, balance: next };
  }
};
