function createDefaultUserDocument({ openid, nickName = '', avatarUrl = '', now = Date.now() }) {
  return {
    openid,
    nickName,
    avatarUrl,
    totalSpend: 0,
    memberLevel: 1,
    points: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now
  };
}

async function ensureUserByOpenId(input, deps) {
  const { openid, nickName = '', avatarUrl = '' } = input || {};
  if (!openid) {
    throw new Error('openid is required');
  }

  const existingUser = await deps.findByOpenId(openid);
  if (existingUser) {
    return { user: existingUser, isNewUser: false };
  }

  const now = deps.now();
  const doc = createDefaultUserDocument({ openid, nickName, avatarUrl, now });
  const createdUser = await deps.createUser(doc);
  return { user: createdUser, isNewUser: true };
}

function toPublicUserProfile(user) {
  return {
    _id: user._id,
    openid: user.openid,
    nickName: user.nickName || '',
    avatarUrl: user.avatarUrl || '',
    totalSpend: Number(user.totalSpend || 0),
    memberLevel: Number(user.memberLevel || 1),
    points: Number(user.points || 0),
    status: user.status || 'active',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

module.exports = {
  createDefaultUserDocument,
  ensureUserByOpenId,
  toPublicUserProfile
};