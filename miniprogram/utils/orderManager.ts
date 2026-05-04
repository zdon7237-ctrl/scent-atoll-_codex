export type OrderStatus = 0 | 1 | 2 | 3 | 4;

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'closed';

const ORDER_STORAGE_KEY = 'myOrders';

export interface OrderItemSnapshot {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  quantity: number;
  spec: string;
  image: string;
  allowMemberDiscount?: boolean;
}

export interface OrderRecord {
  id: number;
  orderNo: string;
  createTime: number;
  items: OrderItemSnapshot[];
  itemCount: number;
  originalPrice: string;
  memberPrice: string;
  couponDiscount: string;
  finalPrice: string;
  walletDeduction: string;
  payAmount: string;
  totalPrice: string;
  couponInfo: any | null;
  status: OrderStatus;
  deliveryInfo: DeliveryInfo;
  paymentStatus: PaymentStatus;
  paymentTime: number;
  shippingInfo: ShippingInfo;
}

export interface DeliveryInfo {
  receiverName: string;
  phone: string;
  address: string;
  note?: string;
}

export interface ShippingInfo {
  status: 'pending' | 'shipped' | 'delivered';
  company: string;
  trackingNo: string;
  shippedAt: number;
}

interface CreateOrderPayload {
  items: any[];
  originalPrice: string;
  memberPrice: string;
  couponDiscount: string;
  finalPrice: string;
  walletDeduction?: string;
  payAmount?: string;
  couponInfo?: any | null;
  status?: OrderStatus;
  deliveryInfo: DeliveryInfo;
}

function toItemSnapshot(item: any): OrderItemSnapshot {
  const displayPrice = Number(item.checkoutPrice ?? item.price ?? 0);
  const originalPrice = Number(item.price ?? displayPrice);

  return {
    id: item.id,
    name: item.name,
    brand: item.brand,
    price: displayPrice,
    originalPrice,
    quantity: item.quantity,
    spec: item.spec || '',
    image: item.image || '',
    allowMemberDiscount: item.allowMemberDiscount
  };
}

export const OrderManager = {
  getOrders(): OrderRecord[] {
    return wx.getStorageSync(ORDER_STORAGE_KEY) || [];
  },

  saveOrders(orders: OrderRecord[]) {
    wx.setStorageSync(ORDER_STORAGE_KEY, orders);
  },

  saveOrder(order: OrderRecord) {
    const orders = this.getOrders();
    this.saveOrders([order, ...orders]);
  },

  createOrderFromCheckout(payload: CreateOrderPayload): OrderRecord {
    const createTime = Date.now();
    const walletDeduction = payload.walletDeduction || '0.00';
    const payAmount = payload.payAmount || payload.finalPrice;
    const order: OrderRecord = {
      id: createTime,
      orderNo: `AT${createTime}`,
      createTime,
      items: payload.items.map(toItemSnapshot),
      itemCount: payload.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
      originalPrice: payload.originalPrice,
      memberPrice: payload.memberPrice,
      couponDiscount: payload.couponDiscount,
      finalPrice: payload.finalPrice,
      walletDeduction,
      payAmount,
      totalPrice: payload.finalPrice,
      couponInfo: payload.couponInfo || null,
      status: payload.status ?? 0,
      deliveryInfo: payload.deliveryInfo,
      paymentStatus: 'pending',
      paymentTime: 0,
      shippingInfo: {
        status: 'pending',
        company: '',
        trackingNo: '',
        shippedAt: 0
      }
    };

    this.saveOrder(order);
    return order;
  }
};
