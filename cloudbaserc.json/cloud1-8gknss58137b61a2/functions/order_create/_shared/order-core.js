function buildOrderNo({ now = Date.now(), randomDigits } = {}) {
  const suffix = randomDigits || String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `AT${String(now)}${suffix}`;
}

function toItemSnapshot(item) {
  const displayPrice = Number(item.checkoutPrice ?? item.price ?? 0);
  const originalPrice = Number(item.originalPrice ?? item.price ?? displayPrice);

  return {
    id: item.id,
    name: item.name,
    brand: item.brand,
    price: displayPrice,
    originalPrice,
    quantity: Number(item.quantity || 0),
    spec: item.spec || '',
    image: item.image || '',
    allowMemberDiscount: item.allowMemberDiscount
  };
}

function normalizeDeliveryInfo(deliveryInfo) {
  const receiverName = String(deliveryInfo?.receiverName || '').trim();
  const phone = String(deliveryInfo?.phone || '').trim();
  const address = String(deliveryInfo?.address || '').trim();
  const note = String(deliveryInfo?.note || '').trim();

  if (!receiverName || !phone || !address) {
    throw new Error('deliveryInfo receiverName, phone, and address are required');
  }

  return {
    receiverName,
    phone,
    address,
    note
  };
}

function buildPendingShippingInfo() {
  return {
    status: 'pending',
    company: '',
    trackingNo: '',
    shippedAt: 0
  };
}

function normalizeMoneyString(value, fallback = '0.00') {
  const num = Number(value ?? fallback);
  return Number.isFinite(num) ? num.toFixed(2) : fallback;
}

function createOrderRecord({ userId, openid, payload, now = Date.now(), randomDigits } = {}) {
  if (!userId) throw new Error('userId is required');
  if (!openid) throw new Error('openid is required');
  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('items are required');
  }

  const items = payload.items.map(toItemSnapshot);
  const deliveryInfo = normalizeDeliveryInfo(payload.deliveryInfo);
  const finalPrice = normalizeMoneyString(payload.finalPrice || payload.memberPrice || payload.originalPrice);
  return {
    userId,
    openid,
    orderNo: buildOrderNo({ now, randomDigits }),
    status: 0,
    paymentStatus: 'pending',
    paymentTime: 0,
    shippingInfo: buildPendingShippingInfo(),
    createTime: now,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    originalPrice: String(payload.originalPrice || '0.00'),
    memberPrice: String(payload.memberPrice || payload.originalPrice || '0.00'),
    couponDiscount: String(payload.couponDiscount || '0.00'),
    finalPrice,
    pricingStatus: 'client_snapshot_unverified',
    walletDeduction: '0.00',
    payAmount: finalPrice,
    totalPrice: finalPrice,
    couponInfo: payload.couponInfo || null,
    deliveryInfo
  };
}

module.exports = {
  buildOrderNo,
  createOrderRecord
};
