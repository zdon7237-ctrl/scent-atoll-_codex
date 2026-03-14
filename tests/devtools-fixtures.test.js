const test = require('node:test');
const assert = require('node:assert/strict');

const { getMemberSpendPreset, createDevtoolOrders, createDevtoolCoupons } = require('../miniprogram/utils/devtoolsFixtures.js');

test('member spend presets cover normal gold and diamond users', () => {
  assert.equal(getMemberSpendPreset('normal'), 0);
  assert.equal(getMemberSpendPreset('gold'), 1500);
  assert.equal(getMemberSpendPreset('diamond'), 25000);
});

test('devtools order fixtures include multiple lifecycle statuses', () => {
  const orders = createDevtoolOrders();
  assert.ok(Array.isArray(orders));
  assert.ok(orders.length >= 3);
  assert.deepEqual(new Set(orders.map(order => order.status)), new Set([1, 2, 3]));
});

test('devtools coupon fixtures provide usable and historical coupons', () => {
  const coupons = createDevtoolCoupons();
  assert.ok(Array.isArray(coupons));
  assert.ok(coupons.some(coupon => coupon.status === 0));
  assert.ok(coupons.some(coupon => coupon.status !== 0));
});
