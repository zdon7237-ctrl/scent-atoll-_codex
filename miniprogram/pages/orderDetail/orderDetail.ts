import { CloudOrderRecord, OrderService } from '../../utils/orderService';

const { mapOrderDetailForDisplay } = require('../../utils/orderViewModel.js') as {
  mapOrderDetailForDisplay: (order: CloudOrderRecord | null) => any | null;
};

Page({
  data: {
    orderId: '',
    order: null as any,
    isLoading: true,
    loadError: '',
    isPaying: false
  },

  async onLoad(options: any) {
    const orderId = String(options.orderId || '');
    this.setData({ orderId });
    wx.setNavigationBarTitle({ title: '订单详情' });

    if (!orderId) {
      this.setData({
        isLoading: false,
        loadError: '缺少订单信息'
      });
      return;
    }

    await this.loadOrder(orderId);
  },

  async loadOrder(orderId: string) {
    this.setData({ isLoading: true, loadError: '' });

    try {
      const order = await OrderService.getOrderDetail(orderId);
      this.setData({
        order: mapOrderDetailForDisplay(order),
        isLoading: false
      });
    } catch (e) {
      console.error('加载订单详情失败', e);
      this.setData({
        order: null,
        isLoading: false,
        loadError: '订单详情加载失败，请稍后重试'
      });
    }
  },

  async onPay() {
    if (this.data.isPaying || !this.data.orderId) return;

    this.setData({ isPaying: true });
    try {
      const payment = await OrderService.createPayment(this.data.orderId);
      if (!payment.ok || !payment.paymentParams) {
        const title = payment.code === 'PAY_CONFIG_MISSING'
          ? '支付暂未开通，请联系商家'
          : payment.code === 'ORDER_PRICING_UNVERIFIED'
            ? '支付暂未开通，请联系商家'
            : (payment.message || '暂无法发起支付');
        wx.showToast({
          title,
          icon: 'none'
        });
        return;
      }

      await OrderService.requestPayment(payment.paymentParams);
      wx.showToast({ title: '支付结果确认中', icon: 'none' });
      await this.loadOrder(this.data.orderId);
    } catch (e) {
      console.error('发起支付失败', e);
      wx.showToast({ title: '支付未完成', icon: 'none' });
    } finally {
      this.setData({ isPaying: false });
    }
  },

  onCopyOrderNo() {
    const orderNo = this.data.order && this.data.order.orderNo;
    if (!orderNo) return;
    wx.setClipboardData({ data: orderNo });
  }
});
