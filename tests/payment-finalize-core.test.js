const test = require('node:test');
const assert = require('node:assert/strict');

const {
  finalizePaidOrder
} = require('../cloudbaserc.json/cloud1-8gknss58137b61a2/functions/_shared/payment-core.js');

const baseOrder = {
  _id: 'order-1',
  orderNo: 'AT17100000000000001',
  userId: 'user-1',
  openid: 'openid-1',
  status: 0,
  paymentStatus: 'pending',
  pricingStatus: 'server_verified',
  payAmount: '100.00'
};

const baseUser = {
  _id: 'user-1',
  openid: 'openid-1',
  points: 0,
  totalSpend: 900,
  memberLevel: 1
};

test('finalizePaidOrder marks a pending order paid and applies member points once', () => {
  const result = finalizePaidOrder({
    order: baseOrder,
    user: baseUser,
    payment: {
      transactionId: 'tx-1',
      paidAmount: '100.00',
      paidAt: 1710000000100,
      idempotencyKey: 'notify-1'
    },
    now: () => 1710000000200
  });

  assert.equal(result.ok, true);
  assert.equal(result.alreadyFinalized, false);
  assert.deepEqual(result.orderPatch, {
    status: 1,
    paymentStatus: 'paid',
    paymentTime: 1710000000100,
    paymentTransactionId: 'tx-1',
    paymentFinalizeKey: 'notify-1',
    updatedAt: 1710000000200
  });
  assert.deepEqual(result.userPatch, {
    points: 100,
    totalSpend: 1000,
    memberLevel: 2,
    updatedAt: 1710000000200
  });
  assert.equal(result.pointLedger.amount, 100);
  assert.equal(result.pointLedger.balanceAfter, 100);
});

test('finalizePaidOrder is idempotent for a repeated paid notification', () => {
  const result = finalizePaidOrder({
    order: {
      ...baseOrder,
      status: 1,
      paymentStatus: 'paid',
      paymentFinalizeKey: 'notify-1',
      paymentTransactionId: 'tx-1'
    },
    user: { ...baseUser, points: 100, totalSpend: 1000, memberLevel: 2 },
    payment: {
      transactionId: 'tx-1',
      paidAmount: '100.00',
      paidAt: 1710000000100,
      idempotencyKey: 'notify-1'
    },
    now: () => 1710000000200
  });

  assert.equal(result.ok, true);
  assert.equal(result.alreadyFinalized, true);
  assert.equal(result.pointLedger, null);
  assert.deepEqual(result.orderPatch, {});
  assert.deepEqual(result.userPatch, {});
});

test('finalizePaidOrder rejects mismatched amounts and closed orders', () => {
  const mismatch = finalizePaidOrder({
    order: baseOrder,
    user: baseUser,
    payment: {
      transactionId: 'tx-1',
      paidAmount: '99.99',
      paidAt: 1710000000100,
      idempotencyKey: 'notify-1'
    },
    now: () => 1710000000200
  });
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.code, 'PAY_AMOUNT_MISMATCH');

  const closed = finalizePaidOrder({
    order: { ...baseOrder, paymentStatus: 'closed' },
    user: baseUser,
    payment: {
      transactionId: 'tx-1',
      paidAmount: '100.00',
      paidAt: 1710000000100,
      idempotencyKey: 'notify-1'
    },
    now: () => 1710000000200
  });
  assert.equal(closed.ok, false);
  assert.equal(closed.code, 'ORDER_NOT_PAYABLE');
});

test('finalizePaidOrder rejects unverified client pricing snapshots', () => {
  const result = finalizePaidOrder({
    order: { ...baseOrder, pricingStatus: 'client_snapshot_unverified' },
    user: baseUser,
    payment: {
      transactionId: 'tx-1',
      paidAmount: '100.00',
      paidAt: 1710000000100,
      idempotencyKey: 'notify-1'
    },
    now: () => 1710000000200
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, 'ORDER_PRICING_UNVERIFIED');
});
