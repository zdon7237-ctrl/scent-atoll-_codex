// miniprogram/pages/pointHistory/pointHistory.ts
import { AccountPointHistoryItem, AccountService } from '../../utils/accountService';

function formatHistoryList(rawList: Array<AccountPointHistoryItem | any>) {
  return rawList.map(item => {
    const d = new Date(item.time);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const date = d.getDate().toString().padStart(2, '0');
    const hour = d.getHours().toString().padStart(2, '0');
    const minute = d.getMinutes().toString().padStart(2, '0');

    return {
      ...item,
      timeStr: `${year}.${month}.${date} ${hour}:${minute}`
    };
  });
}

Page({
  data: {
    list: [] as any[],
    totalPoints: 0,
    loadError: ''
  },

  onShow() {
    void this.loadData();
  },

  async loadData() {
    try {
      const summary = await AccountService.getSummary();
      this.setData({
        list: formatHistoryList(summary.pointHistory),
        totalPoints: summary.points,
        loadError: ''
      });
    } catch (e) {
      console.warn('服务端积分明细加载失败', e);
      this.setData({
        list: [],
        totalPoints: 0,
        loadError: '积分账本暂不可用，请稍后重试'
      });
    }
  }
});
