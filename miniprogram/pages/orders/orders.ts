import { OrderStatus } from '../../utils/orderManager';
import { CloudOrderRecord, OrderService } from '../../utils/orderService';

const { mapOrdersForDisplay, shouldShowOrdersEmptyState } = require('../../utils/orderViewModel.js') as {
  mapOrdersForDisplay: (orders: CloudOrderRecord[]) => any[];
  shouldShowOrdersEmptyState: (isLoading: boolean, orders: any[]) => boolean;
};

Page({
  data: {
    tabs: ['全部', '待付款', '待发货', '待收货', '待评价', '退款/售后'],
    activeTab: 0,
    allOrders: [] as CloudOrderRecord[],
    displayOrders: [] as any[],
    isLoading: false,
    loadError: '',
    showEmptyState: false
  },

  onLoad(options: any) {
    if (options.type) {
      this.setData({ activeTab: Number(options.type) });
    }
  },

  onShow() {
    void this.loadOrders();
  },

  async loadOrders() {
    const status = this.data.activeTab === 0 ? undefined : (this.data.activeTab - 1) as OrderStatus;
    this.setData({ isLoading: true, loadError: '', showEmptyState: false });

    try {
      const result = await OrderService.listOrders({ status, page: 1, size: 20 });
      const displayOrders = mapOrdersForDisplay(result.list);
      this.setData({
        allOrders: result.list,
        displayOrders,
        showEmptyState: shouldShowOrdersEmptyState(false, displayOrders)
      });
    } catch (e) {
      console.error('加载订单失败', e);
      this.setData({
        allOrders: [],
        displayOrders: [],
        loadError: '订单加载失败，请稍后重试',
        showEmptyState: false
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  onTabClick(e: WechatMiniprogram.TouchEvent) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({ activeTab: index });
    void this.loadOrders();
  },

  onConfirmReceipt() {
    wx.showToast({ title: '确认收货将在下一阶段接入', icon: 'none' });
  },

  onRefund() {
    wx.showToast({ title: '售后申请将在下一阶段接入', icon: 'none' });
  }
});