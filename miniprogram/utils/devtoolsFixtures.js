function getMemberSpendPreset(preset) {
  const presets = {
    normal: 0,
    gold: 1500,
    diamond: 25000,
    black: 60000
  };

  return presets[preset] ?? presets.normal;
}

function createDevtoolOrders(now = Date.now()) {
  return [
    {
      id: now - 3000,
      orderNo: `AT${now - 3000}`,
      createTime: now - 3000,
      items: [
        {
          id: 1,
          name: 'Diaghilev',
          brand: 'Roja Dove',
          price: 7480,
          originalPrice: 8500,
          quantity: 1,
          spec: '标准装',
          image: '',
          allowMemberDiscount: true
        }
      ],
      itemCount: 1,
      originalPrice: '8500.00',
      memberPrice: '7480.00',
      couponDiscount: '0.00',
      finalPrice: '7480.00',
      walletDeduction: '0.00',
      payAmount: '7480.00',
      totalPrice: '7480.00',
      couponInfo: null,
      status: 1
    },
    {
      id: now - 2000,
      orderNo: `AT${now - 2000}`,
      createTime: now - 2000,
      items: [
        {
          id: 4,
          name: "Passage d'Enfer",
          brand: "L'Artisan",
          price: 850,
          originalPrice: 850,
          quantity: 2,
          spec: '标准装',
          image: '',
          allowMemberDiscount: true
        }
      ],
      itemCount: 2,
      originalPrice: '1700.00',
      memberPrice: '1700.00',
      couponDiscount: '80.00',
      finalPrice: '1620.00',
      walletDeduction: '0.00',
      payAmount: '1620.00',
      totalPrice: '1620.00',
      couponInfo: {
        id: 91001,
        name: '测试可用券'
      },
      status: 2
    },
    {
      id: now - 1000,
      orderNo: `AT${now - 1000}`,
      createTime: now - 1000,
      items: [
        {
          id: 5,
          name: 'Portrait of a Lady',
          brand: 'Frederic Malle',
          price: 2680,
          originalPrice: 2680,
          quantity: 1,
          spec: '标准装',
          image: '',
          allowMemberDiscount: true
        }
      ],
      itemCount: 1,
      originalPrice: '2680.00',
      memberPrice: '2680.00',
      couponDiscount: '0.00',
      finalPrice: '2680.00',
      walletDeduction: '300.00',
      payAmount: '2380.00',
      totalPrice: '2680.00',
      couponInfo: null,
      status: 3
    }
  ];
}

function createDevtoolCoupons(now = Date.now()) {
  return [
    {
      _id: 'fixture-available',
      id: 91001,
      name: '测试可用券',
      value: 50,
      min: 299,
      type: 'cash',
      startTime: '2026-01-01 00:00:00',
      endTime: '2099-12-31 23:59:59',
      status: 0,
      limitBrands: [],
      desc: '开发版测试用可用优惠券',
      issueMode: 'code',
      receiveTime: now
    },
    {
      _id: 'fixture-used',
      id: 91002,
      name: '测试已使用券',
      value: 0.9,
      min: 399,
      type: 'discount',
      startTime: '2026-01-01 00:00:00',
      endTime: '2099-12-31 23:59:59',
      status: 1,
      limitBrands: [],
      desc: '开发版测试用已使用优惠券',
      issueMode: 'code',
      receiveTime: now - 10000
    },
    {
      _id: 'fixture-expired',
      id: 91003,
      name: '测试已过期券',
      value: 30,
      min: 199,
      type: 'cash',
      startTime: '2025-01-01 00:00:00',
      endTime: '2025-12-31 23:59:59',
      status: 2,
      limitBrands: [],
      desc: '开发版测试用已过期优惠券',
      issueMode: 'code',
      receiveTime: now - 20000
    }
  ];
}

function createDevtoolCartItems(perfumes) {
  return (Array.isArray(perfumes) ? perfumes.slice(0, 2) : []).map((item, index) => ({
    ...item,
    quantity: index === 0 ? 1 : 2,
    selected: true,
    spec: '标准装'
  }));
}

module.exports = {
  getMemberSpendPreset,
  createDevtoolOrders,
  createDevtoolCoupons,
  createDevtoolCartItems
};
