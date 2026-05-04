const cloud = require('wx-server-sdk');
const { ensureUserByOpenId } = require('./_shared/auth-core');
const { buildAccountSummary } = require('./_shared/account-core');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

async function countUsableCoupons(openid) {
  try {
    const res = await db.collection('user_coupons').where({ openid, status: 0 }).count();
    return res.total || 0;
  } catch (e) {
    return 0;
  }
}

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const users = db.collection('users');

  const result = await ensureUserByOpenId(
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

  const ledgerRes = await db.collection('point_ledger')
    .where({ openid })
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  const couponCount = await countUsableCoupons(openid);
  return {
    summary: buildAccountSummary({
      user: result.user,
      pointLedger: ledgerRes.data || [],
      couponCount
    })
  };
};
