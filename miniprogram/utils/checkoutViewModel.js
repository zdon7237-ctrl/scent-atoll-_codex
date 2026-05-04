function normalizeDeliveryInfo(input) {
  const source = input && typeof input === 'object' ? input : {};
  return {
    receiverName: String(source.receiverName || '').trim(),
    phone: String(source.phone || '').trim(),
    address: String(source.address || '').trim(),
    note: String(source.note || '').trim()
  };
}

function validateDeliveryInfo(input) {
  const deliveryInfo = normalizeDeliveryInfo(input);

  if (!deliveryInfo.receiverName) {
    return { ok: false, message: '请填写收货人姓名', deliveryInfo: null };
  }
  if (!deliveryInfo.phone) {
    return { ok: false, message: '请填写手机号码', deliveryInfo: null };
  }
  if (!deliveryInfo.address) {
    return { ok: false, message: '请填写收货地址', deliveryInfo: null };
  }

  return { ok: true, message: '', deliveryInfo };
}

function buildCheckoutSuccessState(cartList) {
  return {
    cartList: (Array.isArray(cartList) ? cartList : []).filter((item) => !item.selected),
    isAllSelected: false,
    selectedCount: 0
  };
}

module.exports = {
  normalizeDeliveryInfo,
  validateDeliveryInfo,
  buildCheckoutSuccessState
};
