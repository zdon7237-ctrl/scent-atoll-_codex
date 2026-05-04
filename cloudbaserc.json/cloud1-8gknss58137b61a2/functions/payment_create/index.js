const cloud = require('wx-server-sdk');
const { createPaymentRequest, readPaymentConfig } = require('./_shared/payment-core');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const orderId = String(event.orderId || '');

  if (!orderId) {
    return {
      ok: false,
      code: 'ORDER_ID_REQUIRED',
      message: 'orderId is required'
    };
  }

  const res = await db.collection('orders').where({ _id: orderId, openid }).limit(1).get();
  const order = res.data[0] || null;

  return createPaymentRequest({
    order,
    openid,
    config: readPaymentConfig(process.env),
    now: Date.now
  });
};
