function formatOrderTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '');

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

function formatMoney(value) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num.toFixed(2) : '0.00';
}

function formatStatusText(status) {
  const labels = {
    0: '待付款',
    1: '待发货',
    2: '待收货',
    3: '已完成',
    4: '售后中'
  };
  return labels[status] || '未知状态';
}

function formatPaymentStatusText(paymentStatus) {
  const labels = {
    pending: '待付款',
    paid: '已支付',
    failed: '支付失败',
    closed: '已关闭'
  };
  return labels[paymentStatus] || '待付款';
}

function formatShippingStatusText(shippingInfo) {
  const status = shippingInfo && shippingInfo.status;
  const labels = {
    pending: '待发货',
    shipped: '已发货',
    delivered: '已签收'
  };
  return labels[status] || '待发货';
}

function mapOrderItemsForDisplay(items) {
  return Array.isArray(items)
    ? items.map((goods) => ({
        ...goods,
        image: goods.image || '',
        priceText: formatMoney(goods.price),
        showOriginalPrice: Number(goods.originalPrice) > Number(goods.price),
        originalPriceText: formatMoney(goods.originalPrice)
      }))
    : [];
}

function mapOrdersForDisplay(orders) {
  return (Array.isArray(orders) ? orders : []).map((order) => ({
    ...order,
    createTimeText: formatOrderTime(order.createTime),
    totalPriceText: formatMoney(order.totalPrice ?? order.finalPrice),
    couponDiscountText: formatMoney(order.couponDiscount),
    showCouponDiscount: Number(order.couponDiscount) > 0,
    items: mapOrderItemsForDisplay(order.items)
  }));
}

function mapOrderDetailForDisplay(order) {
  if (!order || typeof order !== 'object') return null;

  const deliveryInfo = order.deliveryInfo || {};
  const deliveryParts = [
    deliveryInfo.receiverName,
    deliveryInfo.phone,
    deliveryInfo.address
  ].filter(Boolean);

  const shippingInfo = order.shippingInfo || { status: 'pending' };

  return {
    ...order,
    statusText: formatStatusText(order.status),
    createTimeText: formatOrderTime(order.createTime),
    originalPriceText: formatMoney(order.originalPrice),
    memberPriceText: formatMoney(order.memberPrice),
    couponDiscountText: formatMoney(order.couponDiscount),
    walletDeductionText: formatMoney(order.walletDeduction),
    payAmountText: formatMoney(order.payAmount),
    totalPriceText: formatMoney(order.totalPrice ?? order.finalPrice),
    paymentStatusText: formatPaymentStatusText(order.paymentStatus),
    paymentTimeText: order.paymentTime ? formatOrderTime(order.paymentTime) : '',
    deliveryInfo,
    deliveryText: deliveryParts.join(' '),
    deliveryNoteText: deliveryInfo.note || '',
    shippingInfo,
    shippingStatusText: formatShippingStatusText(shippingInfo),
    shippedAtText: shippingInfo.shippedAt ? formatOrderTime(shippingInfo.shippedAt) : '',
    items: mapOrderItemsForDisplay(order.items)
  };
}

function shouldShowOrdersEmptyState(isLoading, orders) {
  return !isLoading && Array.isArray(orders) && orders.length === 0;
}

module.exports = {
  mapOrdersForDisplay,
  mapOrderDetailForDisplay,
  shouldShowOrdersEmptyState
};
