const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createPaymentRequest
} = require('../cloudbaserc.json/cloud1-8gknss58137b61a2/functions/_shared/payment-core.js');

const pendingOrder = {
  _id: 'order-1',
  orderNo: 'AT17100000000000001',
  openid: 'openid-1',
  status: 0,
  paymentStatus: 'pending',
  pricingStatus: 'server_verified',
  payAmount: '128.50'
};

test('createPaymentRequest returns PAY_CONFIG_MISSING when payment config is absent', async () => {
  const result = await createPaymentRequest({
    order: pendingOrder,
    openid: 'openid-1',
    config: {},
    now: () => 1710000000000
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, 'PAY_CONFIG_MISSING');
  assert.equal(result.orderId, 'order-1');
});

test('createPaymentRequest rejects missing orders and orders owned by another user', async () => {
  const missing = await createPaymentRequest({
    order: null,
    openid: 'openid-1',
    config: {},
    now: () => 1710000000000
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.code, 'ORDER_NOT_FOUND');

  const forbidden = await createPaymentRequest({
    order: pendingOrder,
    openid: 'openid-2',
    config: {},
    now: () => 1710000000000
  });
  assert.equal(forbidden.ok, false);
  assert.equal(forbidden.code, 'ORDER_NOT_FOUND');
});

test('createPaymentRequest rejects orders that are already paid or have no payable amount', async () => {
  const paid = await createPaymentRequest({
    order: { ...pendingOrder, status: 1, paymentStatus: 'paid' },
    openid: 'openid-1',
    config: {},
    now: () => 1710000000000
  });
  assert.equal(paid.ok, false);
  assert.equal(paid.code, 'ORDER_NOT_PAYABLE');

  const zero = await createPaymentRequest({
    order: { ...pendingOrder, payAmount: '0.00' },
    openid: 'openid-1',
    config: {},
    now: () => 1710000000000
  });
  assert.equal(zero.ok, false);
  assert.equal(zero.code, 'PAY_AMOUNT_INVALID');
});

test('createPaymentRequest rejects orders whose pricing was only a client snapshot', async () => {
  const result = await createPaymentRequest({
    order: { ...pendingOrder, pricingStatus: 'client_snapshot_unverified' },
    openid: 'openid-1',
    config: {
      appId: 'wx-app',
      merchantId: 'mch-1',
      prepayId: 'wx-prepay-1',
      paySign: 'signed-value'
    },
    now: () => 1710000000000
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, 'ORDER_PRICING_UNVERIFIED');
});

test('createPaymentRequest builds requestPayment params when config includes a prepay package', async () => {
  const result = await createPaymentRequest({
    order: pendingOrder,
    openid: 'openid-1',
    config: {
      appId: 'wx-app',
      merchantId: 'mch-1',
      prepayId: 'wx-prepay-1',
      nonceStr: 'nonce-1',
      paySign: 'signed-value'
    },
    now: () => 1710000000000
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.paymentParams, {
    timeStamp: '1710000000',
    nonceStr: 'nonce-1',
    package: 'prepay_id=wx-prepay-1',
    signType: 'RSA',
    paySign: 'signed-value'
  });
});
