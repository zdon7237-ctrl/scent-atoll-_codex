const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('cloud functions only require shared helpers from inside their own function folders', () => {
  const authLogin = fs.readFileSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/auth_login/index.js', 'utf8');
  const orderCreate = fs.readFileSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/order_create/index.js', 'utf8');

  assert.ok(authLogin.includes("require('./_shared/auth-core')"));
  assert.ok(orderCreate.includes("require('./_shared/auth-core')"));
  assert.ok(orderCreate.includes("require('./_shared/order-core')"));
  assert.ok(fs.existsSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/auth_login/_shared/auth-core.js'));
  assert.ok(fs.existsSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/order_create/_shared/auth-core.js'));
  assert.ok(fs.existsSync('cloudbaserc.json/cloud1-8gknss58137b61a2/functions/order_create/_shared/order-core.js'));
});