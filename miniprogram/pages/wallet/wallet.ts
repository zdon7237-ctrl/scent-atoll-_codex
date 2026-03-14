// miniprogram/pages/wallet/wallet.ts
import { WalletManager } from '../../utils/walletManager';

Page({
  data: {
    balance: '0.00',
    amount: 0
  },

  onShow() {
    this.refreshBalance();
  },

  refreshBalance() {
    const balance = WalletManager.getBalance();
    this.setData({ balance: balance.toFixed(2) });
  },

  onInput(e: any) {
    this.setData({ amount: Number(e.detail.value) });
  },

  onTopUp() {
    if (this.data.amount <= 0) {
      wx.showToast({ title: '请输入金额', icon: 'none' });
      return;
    }

    WalletManager.topUp(this.data.amount, '钱包充值');
    this.refreshBalance();

    wx.showToast({ title: '充值成功', icon: 'success' });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});
