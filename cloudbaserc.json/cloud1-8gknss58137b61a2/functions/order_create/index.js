const cloud = require('wx-server-sdk');
const { ensureUserByOpenId } = require('./_shared/auth-core');
const { createOrderRecord } = require('./_shared/order-core');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const users = db.collection('users');
  const orders = db.collection('orders');

  const userResult = await ensureUserByOpenId(
    { openid, nickName: '', avatarUrl: '' },
    {
      findByOpenId: async (targetOpenId) => {
        const res = await users.where({ openid: targetOpenId }).limit(1).get();
        return res.data[0] || null;
      },
      createUser: async (doc) => {
        const addRes = await users.add({ data: doc });
        return { _id: addRes._id, ...doc };
      },
      now: () => Date.now()
    }
  );

  const orderDoc = createOrderRecord({
    userId: userResult.user._id,
    openid,
    payload: event,
    now: Date.now()
  });

  const addRes = await orders.add({ data: orderDoc });

  return {
    orderId: addRes._id,
    orderNo: orderDoc.orderNo,
    status: orderDoc.status
  };
};