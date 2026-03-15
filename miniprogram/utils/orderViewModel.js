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

function mapOrdersForDisplay(orders) {
  return (Array.isArray(orders) ? orders : []).map((order) => ({
    ...order,
    createTimeText: formatOrderTime(order.createTime),
    totalPriceText: formatMoney(order.totalPrice ?? order.finalPrice),
    couponDiscountText: formatMoney(order.couponDiscount),
    showCouponDiscount: Number(order.couponDiscount) > 0,
    items: Array.isArray(order.items)
      ? order.items.map((goods) => ({
          ...goods,
          image: goods.image || '',
          priceText: formatMoney(goods.price),
          showOriginalPrice: Number(goods.originalPrice) > Number(goods.price),
          originalPriceText: formatMoney(goods.originalPrice)
        }))
      : []
  }));
}

function shouldShowOrdersEmptyState(isLoading, orders) {
  return !isLoading && Array.isArray(orders) && orders.length === 0;
}

module.exports = {
  mapOrdersForDisplay,
  shouldShowOrdersEmptyState
};