const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const orderId = String(event.orderId || '');

  if (!orderId) {
    throw new Error('orderId is required');
  }

  const res = await db.collection('orders').where({ _id: orderId, openid }).limit(1).get();
  const order = res.data[0];
  if (!order) {
    throw new Error('order not found');
  }

  return { order };
};