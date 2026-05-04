const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const LEVEL_RULES = [
  { level: 6, threshold: 200000, pointRatio: 2 },
  { level: 5, threshold: 50000, pointRatio: 2 },
  { level: 4, threshold: 20000, pointRatio: 1.5 },
  { level: 3, threshold: 10000, pointRatio: 1.2 },
  { level: 2, threshold: 1000, pointRatio: 1.1 },
  { level: 1, threshold: 0, pointRatio: 1 }
];

function toMoneyNumber(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? Number(num.toFixed(2)) : 0;
}

function resolveMemberRule(totalSpend) {
  const spend = toMoneyNumber(totalSpend);
  return LEVEL_RULES.find((rule) => spend >= rule.threshold) || LEVEL_RULES[LEVEL_RULES.length - 1];
}

function resolveMemberLevel(totalSpend) {
  return resolveMemberRule(totalSpend).level;
}

function calculateEarnedPoints(payAmount, totalSpendBeforePayment) {
  const rule = resolveMemberRule(totalSpendBeforePayment);
  return Math.floor(toMoneyNumber(payAmount) * rule.pointRatio);
}

function applyPaidOrderToAccount({ user, order, idempotencyKey, now = Date.now } = {}) {
  if (!user || !user._id) {
    return { ok: false, code: 'USER_NOT_FOUND', userPatch: {}, pointLedger: null, earnedPoints: 0 };
  }
  if (!order || !order._id) {
    return { ok: false, code: 'ORDER_NOT_FOUND', userPatch: {}, pointLedger: null, earnedPoints: 0 };
  }
  if (!idempotencyKey) {
    return { ok: false, code: 'IDEMPOTENCY_KEY_REQUIRED', userPatch: {}, pointLedger: null, earnedPoints: 0 };
  }

  const timestamp = now();
  const currentPoints = Number(user.points || 0);
  const currentSpend = toMoneyNumber(user.totalSpend);
  const paidAmount = toMoneyNumber(order.payAmount);
  const earnedPoints = calculateEarnedPoints(paidAmount, currentSpend);
  const nextPoints = currentPoints + earnedPoints;
  const nextSpend = toMoneyNumber(currentSpend + paidAmount);
  const nextLevel = resolveMemberLevel(nextSpend);

  return {
    ok: true,
    earnedPoints,
    userPatch: {
      points: nextPoints,
      totalSpend: nextSpend,
      memberLevel: nextLevel,
      updatedAt: timestamp
    },
    pointLedger: {
      userId: user._id,
      openid: user.openid,
      type: 'gain',
      amount: earnedPoints,
      balanceAfter: nextPoints,
      orderId: order._id,
      source: 'order_payment',
      idempotencyKey,
      desc: '订单支付获得积分',
      createdAt: timestamp,
      expireAt: timestamp + ONE_YEAR_MS
    }
  };
}

function redeemPoints({ user, cost, source, sourceId, idempotencyKey, now = Date.now } = {}) {
  if (!user || !user._id) {
    return { ok: false, code: 'USER_NOT_FOUND', userPatch: {}, pointLedger: null };
  }
  const pointCost = Number(cost || 0);
  if (!Number.isFinite(pointCost) || pointCost <= 0) {
    return { ok: false, code: 'POINT_COST_INVALID', userPatch: {}, pointLedger: null };
  }
  if (!idempotencyKey) {
    return { ok: false, code: 'IDEMPOTENCY_KEY_REQUIRED', userPatch: {}, pointLedger: null };
  }

  const currentPoints = Number(user.points || 0);
  if (currentPoints < pointCost) {
    return { ok: false, code: 'POINTS_NOT_ENOUGH', userPatch: {}, pointLedger: null };
  }

  const timestamp = now();
  const nextPoints = currentPoints - pointCost;
  return {
    ok: true,
    userPatch: {
      points: nextPoints,
      updatedAt: timestamp
    },
    pointLedger: {
      userId: user._id,
      openid: user.openid,
      type: 'use',
      amount: -pointCost,
      balanceAfter: nextPoints,
      source,
      sourceId,
      idempotencyKey,
      desc: '积分兑换',
      createdAt: timestamp
    }
  };
}

function buildAccountSummary({ user, pointLedger = [], couponCount = 0 } = {}) {
  const sourceUser = user || {};
  return {
    userId: sourceUser._id || '',
    openid: sourceUser.openid || '',
    points: Number(sourceUser.points || 0),
    totalSpend: toMoneyNumber(sourceUser.totalSpend),
    memberLevel: Number(sourceUser.memberLevel || resolveMemberLevel(sourceUser.totalSpend)),
    couponCount: Number(couponCount || 0),
    pointHistory: (Array.isArray(pointLedger) ? pointLedger : []).map((record) => ({
      id: record._id || record.id || record.idempotencyKey,
      type: record.type,
      amount: Number(record.amount || 0),
      desc: record.desc || '',
      time: Number(record.createdAt || record.time || 0),
      expireAt: record.expireAt
    }))
  };
}

module.exports = {
  applyPaidOrderToAccount,
  buildAccountSummary,
  calculateEarnedPoints,
  redeemPoints,
  resolveMemberLevel,
  resolveMemberRule
};
