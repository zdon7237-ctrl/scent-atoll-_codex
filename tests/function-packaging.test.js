const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('cloud functions only require shared helpers from inside their own function folders', () => {
  const authLogin = fs.readFileSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/auth_login/index.js', 'utf8');
  const orderCreate = fs.readFileSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/order_create/index.js', 'utf8');
  const paymentCreate = fs.readFileSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/payment_create/index.js', 'utf8');
  const paymentFinalize = fs.readFileSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/payment_finalize/index.js', 'utf8');
  const accountSummary = fs.readFileSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/account_summary/index.js', 'utf8');
  const pointRedeem = fs.readFileSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/point_redeem/index.js', 'utf8');

  assert.ok(authLogin.includes("require('./_shared/auth-core')"));
  assert.ok(orderCreate.includes("require('./_shared/auth-core')"));
  assert.ok(orderCreate.includes("require('./_shared/order-core')"));
  assert.ok(paymentCreate.includes("require('./_shared/payment-core')"));
  assert.ok(paymentFinalize.includes("require('./_shared/payment-core')"));
  assert.ok(accountSummary.includes("require('./_shared/auth-core')"));
  assert.ok(accountSummary.includes("require('./_shared/account-core')"));
  assert.ok(pointRedeem.includes("require('./_shared/account-core')"));
  assert.ok(fs.existsSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/auth_login/_shared/auth-core.js'));
  assert.ok(fs.existsSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/order_create/_shared/auth-core.js'));
  assert.ok(fs.existsSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/order_create/_shared/order-core.js'));
  assert.ok(fs.existsSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/payment_create/_shared/payment-core.js'));
  assert.ok(fs.existsSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/payment_create/_shared/account-core.js'));
  assert.ok(fs.existsSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/payment_finalize/_shared/payment-core.js'));
  assert.ok(fs.existsSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/payment_finalize/_shared/account-core.js'));
  assert.ok(fs.existsSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/account_summary/_shared/auth-core.js'));
  assert.ok(fs.existsSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/account_summary/_shared/account-core.js'));
  assert.ok(fs.existsSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/point_redeem/_shared/account-core.js'));
});
