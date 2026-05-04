import { OrderRecord, OrderStatus } from './orderManager';

export interface DeliveryInfo {
  receiverName: string;
  phone: string;
  address: string;
  note?: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'closed';

export interface ShippingInfo {
  status: 'pending' | 'shipped' | 'delivered';
  company: string;
  trackingNo: string;
  shippedAt: number;
}

export interface CloudOrderRecord extends OrderRecord {
  _id: string;
  userId: string;
  openid: string;
}

export interface CreateOrderRequest {
  items: any[];
  originalPrice: string;
  memberPrice: string;
  couponDiscount: string;
  finalPrice: string;
  walletDeduction?: string;
  payAmount?: string;
  couponInfo?: any | null;
  deliveryInfo: DeliveryInfo;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNo: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export interface OrderListResponse {
  list: CloudOrderRecord[];
  page: number;
  size: number;
  hasMore: boolean;
}

export interface RequestPaymentParams {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: 'MD5' | 'HMAC-SHA256' | 'RSA';
  paySign: string;
}

export interface CreatePaymentResponse {
  ok: boolean;
  code?: string;
  message?: string;
  orderId?: string;
  orderNo?: string;
  paymentParams?: RequestPaymentParams;
}

async function createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
  const res = await (wx.cloud.callFunction({
    name: 'order_create',
    data: payload
  }) as Promise<{ result: unknown }>);
  return res.result as CreateOrderResponse;
}

async function listOrders(options: { status?: OrderStatus; page?: number; size?: number } = {}): Promise<OrderListResponse> {
  const res = await (wx.cloud.callFunction({
    name: 'order_list',
    data: {
      status: options.status,
      page: options.page || 1,
      size: options.size || 20
    }
  }) as Promise<{ result: unknown }>);
  return res.result as OrderListResponse;
}

async function getOrderDetail(orderId: string): Promise<CloudOrderRecord> {
  const res = await (wx.cloud.callFunction({
    name: 'order_detail',
    data: { orderId }
  }) as Promise<{ result: unknown }>);
  const result = res.result as { order: CloudOrderRecord };
  return result.order;
}

async function createPayment(orderId: string): Promise<CreatePaymentResponse> {
  const res = await (wx.cloud.callFunction({
    name: 'payment_create',
    data: { orderId }
  }) as Promise<{ result: unknown }>);
  return res.result as CreatePaymentResponse;
}

function requestPayment(params: RequestPaymentParams): Promise<void> {
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      ...params,
      success: () => resolve(),
      fail: reject
    });
  });
}

export const OrderService = {
  createOrder,
  listOrders,
  getOrderDetail,
  createPayment,
  requestPayment
};
