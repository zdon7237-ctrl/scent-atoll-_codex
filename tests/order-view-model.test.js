const test = require('node:test');
const assert = require('node:assert/strict');

const {
  shouldShowOrdersEmptyState,
  mapOrdersForDisplay
} = require('../miniprogram/utils/orderViewModel.js');

test('shouldShowOrdersEmptyState hides empty state while loading', () => {
  assert.equal(shouldShowOrdersEmptyState(true, []), false);
  assert.equal(shouldShowOrdersEmptyState(false, []), true);
  assert.equal(shouldShowOrdersEmptyState(false, [{ _id: '1' }]), false);
});

test('mapOrdersForDisplay formats cloud orders for the orders page', () => {
  const list = mapOrdersForDisplay([
    {
      _id: 'order-1',
      status: 0,
      createTime: 1710000000123,
      totalPrice: '100.00',
      finalPrice: '100.00',
      couponDiscount: '0.00',
      items: [
        {
          id: 1,
          name: 'Test',
          price: 100,
          originalPrice: 120,
          quantity: 1,
          image: ''
        }
      ]
    }
  ]);

  assert.equal(list[0].createTimeText, '2024.03.09 16:00');
  assert.equal(list[0].totalPriceText, '100.00');
  assert.equal(list[0].items[0].showOriginalPrice, true);
});
