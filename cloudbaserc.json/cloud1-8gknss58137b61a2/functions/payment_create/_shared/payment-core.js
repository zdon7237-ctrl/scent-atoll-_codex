const { applyPaidOrderToAccount } = require('./account-core');

function failure(code, message, extra = {}) {
  return {
    ok: false,
    code,
    message,
    ...extra
  };
}

function toCents(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
}

function hasPaymentConfig(config = {}) {
  return Boolean(config.appId && config.merchantId && config.prepayId && config.paySign);
}

function hasVerifiedPricing(order) {
  return order && order.pricingStatus === 'server_verified';
}

async function createPaymentRequest({ order, openid, config = {}, now = Date.now } = {}) {
  if (!order) {
    return failure('ORDER_NOT_FOUND', 'order not found');
  }
  if (order.openid !== openid) {
    return failure('ORDER_NOT_FOUND', 'order not found');
  }
  if (Number(order.status) !== 0 || order.paymentStatus !== 'pending') {
    return failure('ORDER_NOT_PAYABLE', 'order is not payable', { orderId: order._id });
  }

  const payAmountCents = toCents(order.payAmount);
  if (payAmountCents <= 0) {
    return failure('PAY_AMOUNT_INVALID', 'pay amount must be greater than zero', { orderId: order._id });
  }
  if (!hasVerifiedPricing(order)) {
    return failure('ORDER_PRICING_UNVERIFIED', 'order pricing must be verified on the server before payment', { orderId: order._id });
  }

  if (!hasPaymentConfig(config)) {
    return failure('PAY_CONFIG_MISSING', 'wechat pay config is missing', {
      orderId: order._id,
      orderNo: order.orderNo
    });
  }

  const timestamp = Math.floor(now() / 1000);
  return {
    ok: true,
    orderId: order._id,
    orderNo: order.orderNo,
    paymentParams: {
      timeStamp: String(timestamp),
      nonceStr: config.nonceStr || `nonce-${timestamp}`,
      package: `prepay_id=${config.prepayId}`,
      signType: config.signType || 'RSA',
      paySign: config.paySign
    }
  };
}

function isSamePaidNotification(order, payment) {
  if (!order || order.paymentStatus !== 'paid') return false;
  return Boolean(
    (payment.idempotencyKey && order.paymentFinalizeKey === payment.idempotencyKey) ||
    (payment.transactionId && order.paymentTransactionId === payment.transactionId)
  );
}

function finalizePaidOrder({ order, user, payment = {}, now = Date.now } = {}) {
  if (!order) {
    return failure('ORDER_NOT_FOUND', 'order not found', { orderPatch: {}, userPatch: {}, pointLedger: null });
  }
  if (isSamePaidNotification(order, payment)) {
    return {
      ok: true,
      alreadyFinalized: true,
      orderPatch: {},
      userPatch: {},
      pointLedger: null
    };
  }
  if (Number(order.status) !== 0 || order.paymentStatus !== 'pending') {
    return failure('ORDER_NOT_PAYABLE', 'order is not payable', { orderPatch: {}, userPatch: {}, pointLedger: null });
  }
  if (!hasVerifiedPricing(order)) {
    return failure('ORDER_PRICING_UNVERIFIED', 'order pricing must be verified on the server before finalize', { orderPatch: {}, userPatch: {}, pointLedger: null });
  }
  if (!payment.transactionId) {
    return failure('PAY_TRANSACTION_REQUIRED', 'payment transaction is required', { orderPatch: {}, userPatch: {}, pointLedger: null });
  }
  if (!payment.idempotencyKey) {
    return failure('PAY_IDEMPOTENCY_REQUIRED', 'payment idempotency key is required', { orderPatch: {}, userPatch: {}, pointLedger: null });
  }
  if (toCents(payment.paidAmount) !== toCents(order.payAmount)) {
    return failure('PAY_AMOUNT_MISMATCH', 'paid amount does not match order amount', { orderPatch: {}, userPatch: {}, pointLedger: null });
  }

  const timestamp = now();
  const accountResult = applyPaidOrderToAccount({
    user,
    order,
    idempotencyKey: payment.idempotencyKey,
    now: () => timestamp
  });

  if (!accountResult.ok) {
    return failure(accountResult.code, 'account ledger update failed', { orderPatch: {}, userPatch: {}, pointLedger: null });
  }

  return {
    ok: true,
    alreadyFinalized: false,
    orderPatch: {
      status: 1,
      paymentStatus: 'paid',
      paymentTime: payment.paidAt || timestamp,
      paymentTransactionId: payment.transactionId,
      paymentFinalizeKey: payment.idempotencyKey,
      updatedAt: timestamp
    },
    userPatch: accountResult.userPatch,
    pointLedger: accountResult.pointLedger
  };
}

function readPaymentConfig(env = {}) {
  return {
    appId: env.WECHAT_PAY_APP_ID || env.WECHAT_APP_ID || '',
    merchantId: env.WECHAT_PAY_MCH_ID || '',
    prepayId: env.WECHAT_PAY_PREPAY_ID || '',
    nonceStr: env.WECHAT_PAY_NONCE_STR || '',
    paySign: env.WECHAT_PAY_SIGN || '',
    signType: env.WECHAT_PAY_SIGN_TYPE || 'RSA'
  };
}

module.exports = {
  createPaymentRequest,
  finalizePaidOrder,
  hasVerifiedPricing,
  readPaymentConfig,
  toCents
};
