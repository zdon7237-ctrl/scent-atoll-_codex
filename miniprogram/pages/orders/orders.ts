import { OrderManager, OrderRecord, OrderStatus } from '../../utils/orderManager';

function formatOrderTime(value: number | string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '');

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

function formatMoney(value: any) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num.toFixed(2) : '0.00';
}

Page({
  data: {
    tabs: ['全部', '待付款', '待发货', '待收货', '待评价', '退款/售后'],
    activeTab: 0,
    allOrders: [] as OrderRecord[],
    displayOrders: [] as any[]
  },

  onLoad(options: any) {
    if (options.type) {
      this.setData({ activeTab: Number(options.type) });
    }
  },

  onShow() {
    this.loadOrders();
  },

  loadOrders() {
    const orders = OrderManager.getOrders();
    this.setData({ allOrders: orders });
    this.filterOrders();
  },

  onTabClick(e: WechatMiniprogram.TouchEvent) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({ activeTab: index });
    this.filterOrders();
  },

  filterOrders() {
    const { activeTab, allOrders } = this.data;
    const rawList = activeTab === 0
      ? allOrders
      : allOrders.filter((item: OrderRecord) => item.status === activeTab - 1);

    const displayOrders = rawList.map((order: OrderRecord) => ({
      ...order,
      createTimeText: formatOrderTime(order.createTime),
      totalPriceText: formatMoney(order.totalPrice ?? order.finalPrice),
      couponDiscountText: formatMoney(order.couponDiscount),
      showCouponDiscount: Number(order.couponDiscount) > 0,
      items: Array.isArray(order.items)
        ? order.items.map(goods => ({
            ...goods,
            image: goods.image || '',
            priceText: formatMoney(goods.price),
            showOriginalPrice: Number(goods.originalPrice) > Number(goods.price),
            originalPriceText: formatMoney(goods.originalPrice)
          }))
        : []
    }));

    this.setData({ displayOrders });
  },

  onConfirmReceipt(e: WechatMiniprogram.TouchEvent) {
    const orderId = Number(e.currentTarget.dataset.id);

    wx.showModal({
      title: '提示',
      content: '确认收到香水了吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateOrderStatus(orderId, 3);
        }
      }
    });
  },

  onRefund(e: WechatMiniprogram.TouchEvent) {
    const orderId = Number(e.currentTarget.dataset.id);
    wx.showModal({
      title: '申请售后',
      content: '确定要申请退款吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateOrderStatus(orderId, 4);
        }
      }
    });
  },

  updateOrderStatus(orderId: number, newStatus: OrderStatus) {
    const list = this.data.allOrders.map((order: OrderRecord) => {
      if (order.id === orderId) {
        return { ...order, status: newStatus };
      }
      return order;
    });

    OrderManager.saveOrders(list);
    this.loadOrders();
    wx.showToast({ title: '操作成功', icon: 'success' });
  }
});
