const cloud = require('wx-server-sdk');
const { finalizePaidOrder } = require('./_shared/payment-core');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function canFinalize(event) {
  const secret = process.env.PAYMENT_FINALIZE_SECRET || '';
  const allowUnverifiedFinalize = process.env.PAYMENT_FINALIZE_ALLOW_UNVERIFIED === 'true';
  return Boolean(allowUnverifiedFinalize && secret && event.finalizeSecret === secret);
}

exports.main = async (event = {}) => {
  if (!canFinalize(event)) {
    return {
      ok: false,
      code: 'PAY_FINALIZE_FORBIDDEN',
      message: 'payment finalize requires a verified WeChat Pay notify/query integration'
    };
  }

  const orderId = String(event.orderId || '');
  if (!orderId) {
    return {
      ok: false,
      code: 'ORDER_ID_REQUIRED',
      message: 'orderId is required'
    };
  }

  const orderRes = await db.collection('orders').doc(orderId).get();
  const order = orderRes.data;
  if (!order) {
    return { ok: false, code: 'ORDER_NOT_FOUND', message: 'order not found' };
  }

  const userRes = await db.collection('users').doc(order.userId).get();
  const user = userRes.data;

  const result = finalizePaidOrder({
    order,
    user,
    payment: {
      transactionId: String(event.transactionId || ''),
      paidAmount: String(event.paidAmount || ''),
      paidAt: Number(event.paidAt || Date.now()),
      idempotencyKey: String(event.idempotencyKey || event.transactionId || '')
    },
    now: Date.now
  });

  if (!result.ok || result.alreadyFinalized) {
    return result;
  }

  const claimRes = await db.collection('orders')
    .where({ _id: orderId, status: 0, paymentStatus: 'pending' })
    .update({ data: result.orderPatch });

  if (!claimRes.stats || claimRes.stats.updated !== 1) {
    return {
      ok: true,
      alreadyFinalized: true,
      orderId,
      orderPatch: {},
      userPatch: {},
      pointLedger: null
    };
  }

  await db.collection('users').doc(order.userId).update({ data: result.userPatch });
  await db.collection('point_ledger').add({ data: result.pointLedger });

  return {
    ok: true,
    orderId,
    status: result.orderPatch.status,
    paymentStatus: result.orderPatch.paymentStatus,
    points: result.userPatch.points,
    totalSpend: result.userPatch.totalSpend,
    memberLevel: result.userPatch.memberLevel
  };
};
