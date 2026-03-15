const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createDefaultUserDocument,
  ensureUserByOpenId
} = require('../cloudbaserc.json/cloud1-8gknss58137b61a2/functions/_shared/auth-core.js');

test('createDefaultUserDocument creates a default active member profile', () => {
  const now = 1710000000000;
  const doc = createDefaultUserDocument({
    openid: 'openid-1',
    nickName: '',
    avatarUrl: '',
    now
  });

  assert.deepEqual(doc, {
    openid: 'openid-1',
    nickName: '',
    avatarUrl: '',
    totalSpend: 0,
    memberLevel: 1,
    points: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now
  });
});

test('ensureUserByOpenId reuses existing user without creating duplicate', async () => {
  const existingUser = {
    _id: 'user-1',
    openid: 'openid-1',
    totalSpend: 300,
    memberLevel: 1,
    points: 30,
    status: 'active'
  };

  let created = 0;
  const result = await ensureUserByOpenId(
    {
      openid: 'openid-1',
      nickName: 'Demo',
      avatarUrl: ''
    },
    {
      findByOpenId: async (openid) => (openid === 'openid-1' ? existingUser : null),
      createUser: async () => {
        created += 1;
        return { _id: 'new-user' };
      },
      now: () => 1710000000000
    }
  );

  assert.equal(created, 0);
  assert.equal(result.isNewUser, false);
  assert.equal(result.user, existingUser);
});

test('ensureUserByOpenId creates new user when openid is unknown', async () => {
  const createdDocs = [];
  const result = await ensureUserByOpenId(
    {
      openid: 'openid-new',
      nickName: 'New User',
      avatarUrl: 'avatar.png'
    },
    {
      findByOpenId: async () => null,
      createUser: async (doc) => {
        createdDocs.push(doc);
        return { _id: 'user-new', ...doc };
      },
      now: () => 1710000000000
    }
  );

  assert.equal(createdDocs.length, 1);
  assert.equal(result.isNewUser, true);
  assert.equal(result.user._id, 'user-new');
  assert.equal(result.user.openid, 'openid-new');
  assert.equal(result.user.memberLevel, 1);
});
