const test = require('node:test');
const assert = require('node:assert/strict');

const {
  applyPaidOrderToAccount,
  buildAccountSummary,
  redeemPoints
} = require('../cloudbaserc.json/cloud1-8gknss58137b61a2/functions/_shared/account-core.js');

test('applyPaidOrderToAccount adds points and upgrades membership from paid spend', () => {
  const result = applyPaidOrderToAccount({
    user: {
      _id: 'user-1',
      openid: 'openid-1',
      points: 10,
      totalSpend: 900,
      memberLevel: 1
    },
    order: {
      _id: 'order-1',
      orderNo: 'AT17100000000000001',
      payAmount: '100.00'
    },
    idempotencyKey: 'notify-1',
    now: () => 1710000000000
  });

  assert.equal(result.earnedPoints, 100);
  assert.deepEqual(result.userPatch, {
    points: 110,
    totalSpend: 1000,
    memberLevel: 2,
    updatedAt: 1710000000000
  });
  assert.deepEqual(result.pointLedger, {
    userId: 'user-1',
    openid: 'openid-1',
    type: 'gain',
    amount: 100,
    balanceAfter: 110,
    orderId: 'order-1',
    source: 'order_payment',
    idempotencyKey: 'notify-1',
    desc: '订单支付获得积分',
    createdAt: 1710000000000,
    expireAt: 1741536000000
  });
});

test('redeemPoints rejects insufficient point balance without creating a ledger record', () => {
  const result = redeemPoints({
    user: {
      _id: 'user-1',
      openid: 'openid-1',
      points: 90
    },
    cost: 100,
    source: 'point_gift',
    sourceId: 'gift-1',
    idempotencyKey: 'redeem-1',
    now: () => 1710000000000
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, 'POINTS_NOT_ENOUGH');
  assert.equal(result.pointLedger, null);
});

test('redeemPoints deducts points and creates a use ledger record', () => {
  const result = redeemPoints({
    user: {
      _id: 'user-1',
      openid: 'openid-1',
      points: 150
    },
    cost: 100,
    source: 'point_gift',
    sourceId: 'gift-1',
    idempotencyKey: 'redeem-1',
    now: () => 1710000000000
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.userPatch, {
    points: 50,
    updatedAt: 1710000000000
  });
  assert.deepEqual(result.pointLedger, {
    userId: 'user-1',
    openid: 'openid-1',
    type: 'use',
    amount: -100,
    balanceAfter: 50,
    source: 'point_gift',
    sourceId: 'gift-1',
    idempotencyKey: 'redeem-1',
    desc: '积分兑换',
    createdAt: 1710000000000
  });
});

test('buildAccountSummary returns server owned points spend level and history', () => {
  const summary = buildAccountSummary({
    user: {
      _id: 'user-1',
      openid: 'openid-1',
      points: 120,
      totalSpend: 1000,
      memberLevel: 2
    },
    pointLedger: [
      {
        _id: 'ledger-1',
        type: 'gain',
        amount: 100,
        desc: '订单支付获得积分',
        createdAt: 1710000000000,
        expireAt: 1741536000000
      }
    ],
    couponCount: 3
  });

  assert.deepEqual(summary, {
    userId: 'user-1',
    openid: 'openid-1',
    points: 120,
    totalSpend: 1000,
    memberLevel: 2,
    couponCount: 3,
    pointHistory: [
      {
        id: 'ledger-1',
        type: 'gain',
        amount: 100,
        desc: '订单支付获得积分',
        time: 1710000000000,
        expireAt: 1741536000000
      }
    ]
  });
});
