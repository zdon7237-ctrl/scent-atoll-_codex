const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createOrderRecord,
  buildOrderNo
} = require('../cloudbaserc.json/cloud1-8gknss58137b61a2/functions/_shared/order-core.js');

function buildValidPayload(overrides = {}) {
  return {
    items: [
      {
        id: 1,
        name: 'Diaghilev',
        brand: 'Roja Dove',
        price: 7480,
        originalPrice: 8500,
        quantity: 1,
        spec: 'standard',
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
      name: 'test coupon'
    },
    deliveryInfo: {
      receiverName: 'Ada Lovelace',
      phone: '13800138000',
      address: '12 Fragrance Lane',
      note: 'Leave at front desk'
    },
    ...overrides
  };
}

test('buildOrderNo uses AT prefix and 4-digit random suffix', () => {
  const orderNo = buildOrderNo({
    now: 1710000000123,
    randomDigits: '4821'
  });

  assert.equal(orderNo, 'AT17100000001234821');
});

test('createOrderRecord creates a pending order with delivery and payment placeholders', () => {
  const record = createOrderRecord({
    userId: 'user-1',
    openid: 'openid-1',
    payload: buildValidPayload(),
    now: 1710000000123,
    randomDigits: '4821'
  });

  assert.equal(record.status, 0);
  assert.equal(record.userId, 'user-1');
  assert.equal(record.openid, 'openid-1');
  assert.equal(record.orderNo, 'AT17100000001234821');
  assert.equal(record.itemCount, 1);
  assert.equal(record.walletDeduction, '0.00');
  assert.equal(record.payAmount, '7430.00');
  assert.equal(record.pricingStatus, 'client_snapshot_unverified');
  assert.deepEqual(record.couponInfo, { id: 9001, name: 'test coupon' });
  assert.deepEqual(record.deliveryInfo, {
    receiverName: 'Ada Lovelace',
    phone: '13800138000',
    address: '12 Fragrance Lane',
    note: 'Leave at front desk'
  });
  assert.equal(record.paymentStatus, 'pending');
  assert.equal(record.paymentTime, 0);
  assert.deepEqual(record.shippingInfo, {
    status: 'pending',
    company: '',
    trackingNo: '',
    shippedAt: 0
  });
});

test('createOrderRecord ignores client supplied wallet deduction and pay amount', () => {
  const record = createOrderRecord({
    userId: 'user-1',
    openid: 'openid-1',
    payload: buildValidPayload({
      walletDeduction: '9999.00',
      payAmount: '0.01'
    }),
    now: 1710000000123,
    randomDigits: '4821'
  });

  assert.equal(record.walletDeduction, '0.00');
  assert.equal(record.payAmount, '7430.00');
  assert.equal(record.totalPrice, '7430.00');
});

test('createOrderRecord ignores client supplied payment and shipping state', () => {
  const record = createOrderRecord({
    userId: 'user-1',
    openid: 'openid-1',
    payload: buildValidPayload({
      paymentStatus: 'paid',
      paymentTime: 1710000000999,
      shippingInfo: {
        status: 'shipped',
        company: 'SF',
        trackingNo: 'SF123',
        shippedAt: 1710000000999
      }
    }),
    now: 1710000000123,
    randomDigits: '4821'
  });

  assert.equal(record.paymentStatus, 'pending');
  assert.equal(record.paymentTime, 0);
  assert.deepEqual(record.shippingInfo, {
    status: 'pending',
    company: '',
    trackingNo: '',
    shippedAt: 0
  });
});

test('createOrderRecord rejects empty item payloads', () => {
  assert.throws(() => {
    createOrderRecord({
      userId: 'user-1',
      openid: 'openid-1',
      payload: buildValidPayload({ items: [] }),
      now: 1710000000123,
      randomDigits: '4821'
    });
  }, /items/i);
});

test('createOrderRecord rejects delivery info missing receiverName, phone, or address', () => {
  for (const deliveryInfo of [
    { phone: '13800138000', address: '12 Fragrance Lane' },
    { receiverName: 'Ada Lovelace', address: '12 Fragrance Lane' },
    { receiverName: 'Ada Lovelace', phone: '13800138000' }
  ]) {
    assert.throws(() => {
      createOrderRecord({
        userId: 'user-1',
        openid: 'openid-1',
        payload: buildValidPayload({ deliveryInfo }),
        now: 1710000000123,
        randomDigits: '4821'
      });
    }, /deliveryInfo/i);
  }
});
