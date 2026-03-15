const cloud = require('wx-server-sdk');
const { ensureUserByOpenId, toPublicUserProfile } = require('./_shared/auth-core');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const users = db.collection('users');

  const result = await ensureUserByOpenId(
    {
      openid,
      nickName: event.nickName || '',
      avatarUrl: event.avatarUrl || ''
    },
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

  return {
    openid,
    userId: result.user._id,
    isNewUser: result.isNewUser,
    profile: toPublicUserProfile(result.user)
  };
};