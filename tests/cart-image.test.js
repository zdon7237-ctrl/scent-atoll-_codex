const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeCartItems } = require('../miniprogram/utils/cartViewModel.js');

test('normalizeCartItems replaces missing or legacy cart placeholder images', () => {
  const items = normalizeCartItems([
    { id: 1, image: '', quantity: 1 },
    { id: 2, image: '/pages/cart/default.png', quantity: 1 },
    { id: 3, image: '/images/home.png', quantity: 1 }
  ]);

  assert.equal(items[0].image, '/images/home.png');
  assert.equal(items[1].image, '/images/home.png');
  assert.equal(items[2].image, '/images/home.png');
});