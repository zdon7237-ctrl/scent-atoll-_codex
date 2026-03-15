import { OrderRecord, OrderStatus } from './orderManager';

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
}

export interface CreateOrderResponse {
  orderId: string;
  orderNo: string;
  status: OrderStatus;
}

export interface OrderListResponse {
  list: CloudOrderRecord[];
  page: number;
  size: number;
  hasMore: boolean;
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

export const OrderService = {
  createOrder,
  listOrders,
  getOrderDetail
};