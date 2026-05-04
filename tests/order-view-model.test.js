const test = require('node:test');
const assert = require('node:assert/strict');

const {
  shouldShowOrdersEmptyState,
  mapOrdersForDisplay,
  mapOrderDetailForDisplay
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

test('mapOrderDetailForDisplay formats delivery payment and shipping snapshots', () => {
  const detail = mapOrderDetailForDisplay({
    _id: 'order-1',
    orderNo: 'AT17100000001230001',
    status: 0,
    createTime: 1710000000123,
    originalPrice: '120.00',
    memberPrice: '100.00',
    couponDiscount: '10.00',
    walletDeduction: '5.00',
    payAmount: '85.00',
    totalPrice: '90.00',
    paymentStatus: 'pending',
    paymentTime: 0,
    deliveryInfo: {
      receiverName: 'Ada',
      phone: '13800000000',
      address: 'Shanghai Road 1',
      note: 'Leave at front desk'
    },
    shippingInfo: {
      status: 'pending',
      company: '',
      trackingNo: '',
      shippedAt: 0
    },
    items: [
      {
        id: 1,
        name: 'Test',
        brand: 'Brand',
        price: 100,
        originalPrice: 120,
        quantity: 1,
        image: ''
      }
    ]
  });

  assert.equal(detail.statusText, '待付款');
  assert.equal(detail.paymentStatusText, '待付款');
  assert.equal(detail.shippingStatusText, '待发货');
  assert.equal(detail.deliveryText, 'Ada 13800000000 Shanghai Road 1');
  assert.equal(detail.deliveryNoteText, 'Leave at front desk');
  assert.equal(detail.payAmountText, '85.00');
  assert.equal(detail.items[0].priceText, '100.00');
});
