const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createOrderRecord,
  buildOrderNo
} = require('../cloudbaserc.json/cloud1-8gknss58137b61a2/functions/_shared/order-core.js');

test('buildOrderNo uses AT prefix and 4-digit random suffix', () => {
  const orderNo = buildOrderNo({
    now: 1710000000123,
    randomDigits: '4821'
  });

  assert.equal(orderNo, 'AT17100000001234821');
});

test('createOrderRecord creates a pending order and keeps wallet/coupon as snapshots', () => {
  const record = createOrderRecord({
    userId: 'user-1',
    openid: 'openid-1',
    payload: {
      items: [
        {
          id: 1,
          name: 'Diaghilev',
          brand: 'Roja Dove',
          price: 7480,
          originalPrice: 8500,
          quantity: 1,
          spec: '标准装',
          image: '',
          allowMemberDiscount: true
        }
      ],
      originalPrice: '8500.00',
      memberPrice: '7480.00',
      couponDiscount: '50.00',
      finalPrice: '7430.00',
      walletDeduction: '200.00',
      payAmount: '7230.00',
      couponInfo: {
        id: 9001,
        name: '测试券'
      }
    },
    now: 1710000000123,
    randomDigits: '4821'
  });

  assert.equal(record.status, 0);
  assert.equal(record.userId, 'user-1');
  assert.equal(record.openid, 'openid-1');
  assert.equal(record.orderNo, 'AT17100000001234821');
  assert.equal(record.itemCount, 1);
  assert.equal(record.walletDeduction, '200.00');
  assert.deepEqual(record.couponInfo, { id: 9001, name: '测试券' });
});

test('createOrderRecord rejects empty item payloads', () => {
  assert.throws(() => {
    createOrderRecord({
      userId: 'user-1',
      openid: 'openid-1',
      payload: {
        items: [],
        originalPrice: '0.00',
        memberPrice: '0.00',
        couponDiscount: '0.00',
        finalPrice: '0.00'
      },
      now: 1710000000123,
      randomDigits: '4821'
    });
  }, /items/i);
});
