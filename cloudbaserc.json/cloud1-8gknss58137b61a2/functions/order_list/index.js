const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const page = Math.max(Number(event.page || 1), 1);
  const size = Math.min(Math.max(Number(event.size || 20), 1), 50);
  const status = typeof event.status === 'number' ? event.status : undefined;

  let query = db.collection('orders').where(status === undefined ? { openid } : { openid, status });
  query = query.orderBy('createTime', 'desc').skip((page - 1) * size).limit(size);

  const res = await query.get();
  return {
    list: res.data || [],
    page,
    size,
    hasMore: Array.isArray(res.data) && res.data.length === size
  };
};