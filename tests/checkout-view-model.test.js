const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeDeliveryInfo,
  validateDeliveryInfo,
  buildCheckoutSuccessState
} = require('../miniprogram/utils/checkoutViewModel.js');

test('normalizeDeliveryInfo trims delivery fields and keeps optional note', () => {
  assert.deepEqual(normalizeDeliveryInfo({
    receiverName: ' Ada ',
    phone: ' 13800000000 ',
    address: ' Shanghai Road 1 ',
    note: ' Front desk '
  }), {
    receiverName: 'Ada',
    phone: '13800000000',
    address: 'Shanghai Road 1',
    note: 'Front desk'
  });
});

test('buildCheckoutSuccessState removes checked items from page state', () => {
  const state = buildCheckoutSuccessState([
    { id: 1, selected: true, quantity: 1 },
    { id: 2, selected: false, quantity: 2 }
  ]);

  assert.deepEqual(state, {
    cartList: [{ id: 2, selected: false, quantity: 2 }],
    isAllSelected: false,
    selectedCount: 0
  });
});

test('validateDeliveryInfo requires receiver phone and address', () => {
  assert.deepEqual(validateDeliveryInfo({
    receiverName: '',
    phone: '13800000000',
    address: 'Shanghai Road 1'
  }), {
    ok: false,
    message: '请填写收货人姓名',
    deliveryInfo: null
  });

  assert.deepEqual(validateDeliveryInfo({
    receiverName: 'Ada',
    phone: '13800000000',
    address: 'Shanghai Road 1'
  }), {
    ok: true,
    message: '',
    deliveryInfo: {
      receiverName: 'Ada',
      phone: '13800000000',
      address: 'Shanghai Road 1',
      note: ''
    }
  });
});
