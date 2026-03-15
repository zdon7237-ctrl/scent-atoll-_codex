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

function createOrderRecord({ userId, openid, payload, now = Date.now(), randomDigits } = {}) {
  if (!userId) throw new Error('userId is required');
  if (!openid) throw new Error('openid is required');
  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('items are required');
  }

  const items = payload.items.map(toItemSnapshot);
  return {
    userId,
    openid,
    orderNo: buildOrderNo({ now, randomDigits }),
    status: 0,
    createTime: now,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    originalPrice: String(payload.originalPrice || '0.00'),
    memberPrice: String(payload.memberPrice || payload.originalPrice || '0.00'),
    couponDiscount: String(payload.couponDiscount || '0.00'),
    finalPrice: String(payload.finalPrice || payload.memberPrice || payload.originalPrice || '0.00'),
    walletDeduction: String(payload.walletDeduction || '0.00'),
    payAmount: String(payload.payAmount || payload.finalPrice || payload.memberPrice || payload.originalPrice || '0.00'),
    totalPrice: String(payload.finalPrice || payload.memberPrice || payload.originalPrice || '0.00'),
    couponInfo: payload.couponInfo || null
  };
}

module.exports = {
  buildOrderNo,
  createOrderRecord
};