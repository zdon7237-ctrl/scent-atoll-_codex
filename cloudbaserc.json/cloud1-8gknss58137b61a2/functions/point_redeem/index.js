const cloud = require('wx-server-sdk');
const { redeemPoints } = require('./_shared/account-core');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async () => {
  void redeemPoints;
  return {
    ok: false,
    code: 'POINT_REDEEM_NOT_READY',
    message: '积分兑换服务端履约将在支付和账户账本稳定后接入'
  };
};
