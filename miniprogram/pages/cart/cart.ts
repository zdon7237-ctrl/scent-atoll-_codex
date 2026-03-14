// miniprogram/pages/cart/cart.ts
import { IAppOption } from '../../app';
import { MemberManager } from '../../utils/memberManager';
import { PointManager } from '../../utils/pointManager';
import { OrderManager } from '../../utils/orderManager';
import { CouponManager } from '../../utils/couponManager';
import { WalletManager } from '../../utils/walletManager';

const app = getApp<IAppOption>();

function formatMoney(value: number) {
  return Number(value.toFixed(2));
}

Page({
  data: {
    cartList: [] as any[],
    isAllSelected: false,
    isEditMode: false,
    originalPrice: '0.00',
    totalPrice: '0.00',
    discountAmount: '0.00',
    memberSavings: '0.00',
    finalPrice: '0.00',
    walletBalance: '0.00',
    walletDeduction: '0.00',
    payAmount: '0.00',
    useWallet: true,
    selectedCount: 0,
    selectedCoupon: null as any,
    hasDiscount: false
  },

  onShow() { this.initData(); },

  initData() {
    const cart = wx.getStorageSync('myCart') || [];
    const selectedCoupon = wx.getStorageSync('selectedCoupon') || null;
    const coupons = CouponManager.getUserCoupons();
    const coupon = selectedCoupon
      ? coupons.find(item => item.id === selectedCoupon.id && CouponManager.getCouponStatus(item) === 0) || null
      : null;
    if (!coupon && selectedCoupon) {
      wx.removeStorageSync('selectedCoupon');
    }

    const formattedCart = cart.map((item: any) => ({ ...item, x: 0 }));
    this.setData({
      cartList: formattedCart,
      selectedCoupon: coupon,
      walletBalance: WalletManager.getBalance().toFixed(2)
    });
    this.calculateTotal();
  },

  toggleEditMode() { this.setData({ isEditMode: !this.data.isEditMode }); },

  toggleSelect(e: any) {
    const index = e.currentTarget.dataset.index;
    const key = `cartList[${index}].selected`;
    this.setData({ [key]: !this.data.cartList[index].selected });
    this.calculateTotal();
  },

  toggleAll() {
    const isAll = !this.data.isAllSelected;
    const newList = this.data.cartList.map(item => ({ ...item, selected: isAll }));
    this.setData({ cartList: newList, isAllSelected: isAll });
    this.calculateTotal();
  },

  toggleWalletUsage() {
    this.setData({ useWallet: !this.data.useWallet });
    this.calculateTotal();
  },

  updateQuantity(e: any) {
    const { index, type } = e.currentTarget.dataset;
    const list = this.data.cartList;
    if (type === 'minus') {
      if (list[index].quantity > 1) list[index].quantity--;
      else return;
    } else {
      list[index].quantity++;
    }
    this.setData({ cartList: list });
    wx.setStorageSync('myCart', list);
    this.calculateTotal();
  },

  deleteItem(e: any) {
    const index = e.currentTarget.dataset.index;
    const list = this.data.cartList;
    list.splice(index, 1);
    this.setData({ cartList: list });
    wx.setStorageSync('myCart', list);
    this.calculateTotal();
    if (list.length === 0) this.setData({ isEditMode: false });
  },

  batchDelete() {
    const list = this.data.cartList.filter(item => !item.selected);
    this.setData({ cartList: list, isAllSelected: false });
    wx.setStorageSync('myCart', list);
    this.calculateTotal();
  },

  goToCoupons() { wx.navigateTo({ url: '/pages/coupons/coupons?source=cart' }); },

  calculateTotal() {
    const list = this.data.cartList;
    const coupon = this.data.selectedCoupon;
    const totalSpend = app.globalData.totalSpend || 0;
    const walletBalance = WalletManager.getBalance();

    let totalOrigin = 0;
    let totalMember = 0;
    let selectedCount = 0;
    let isAll = list.length > 0;
    let eligibleAmount = 0;

    list.forEach(item => {
      if (item.selected) {
        selectedCount++;
        totalOrigin += item.price * item.quantity;

        let unitPrice = item.price;
        if (item.allowMemberDiscount !== false) {
          unitPrice = MemberManager.calculateDiscountPrice(item.price, totalSpend);
        }

        totalMember += unitPrice * item.quantity;

        let isCouponEligible = true;
        if (coupon && coupon.limitBrands && coupon.limitBrands.length > 0) {
          const match = coupon.limitBrands.some((brandKey: string) => item.brand.includes(brandKey));
          if (!match) isCouponEligible = false;
        }

        if (isCouponEligible) {
          eligibleAmount += unitPrice * item.quantity;
        }
      } else {
        isAll = false;
      }
    });

    if (list.length === 0) isAll = false;

    let couponDiscount = 0;
    if (coupon && eligibleAmount >= coupon.min) {
      if (coupon.type === 'cash') {
        couponDiscount = coupon.value;
      } else if (coupon.type === 'discount' && coupon.value < 1) {
        couponDiscount = eligibleAmount * (1 - coupon.value);
      }
    }

    const finalBeforeWallet = Math.max(totalMember - couponDiscount, 0);
    const walletDeduction = this.data.useWallet ? Math.min(walletBalance, finalBeforeWallet) : 0;
    const payAmount = Math.max(finalBeforeWallet - walletDeduction, 0);

    this.setData({
      isAllSelected: isAll,
      selectedCount,
      originalPrice: totalOrigin.toFixed(2),
      totalPrice: totalMember.toFixed(2),
      discountAmount: couponDiscount.toFixed(2),
      memberSavings: (totalOrigin - totalMember).toFixed(2),
      finalPrice: finalBeforeWallet.toFixed(2),
      walletBalance: walletBalance.toFixed(2),
      walletDeduction: walletDeduction.toFixed(2),
      payAmount: payAmount.toFixed(2),
      hasDiscount: couponDiscount > 0
    });
  },

  onCheckout() {
    if (Number(this.data.finalPrice) <= 0 && this.data.selectedCount === 0) {
      wx.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }

    const checkedItems = this.data.cartList.filter(item => item.selected);
    if (checkedItems.length === 0) {
      wx.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }

    const latestWalletBalance = WalletManager.getBalance();
    const expectedFinalPrice = Number(this.data.finalPrice);
    const recalculatedWalletDeduction = this.data.useWallet
      ? formatMoney(Math.min(latestWalletBalance, expectedFinalPrice))
      : 0;
    const recalculatedPayAmount = formatMoney(Math.max(expectedFinalPrice - recalculatedWalletDeduction, 0));

    if (
      recalculatedWalletDeduction.toFixed(2) !== this.data.walletDeduction ||
      recalculatedPayAmount.toFixed(2) !== this.data.payAmount
    ) {
      this.setData({ walletBalance: latestWalletBalance.toFixed(2) });
      this.calculateTotal();
      wx.showToast({ title: '余额已变更，请重新确认订单', icon: 'none' });
      return;
    }

    const currentTotalSpend = app.globalData.totalSpend || 0;
    const checkoutItems = checkedItems.map(item => ({
      ...item,
      checkoutPrice: item.allowMemberDiscount !== false
        ? MemberManager.calculateDiscountPrice(item.price, currentTotalSpend)
        : item.price
    }));

    if (recalculatedWalletDeduction > 0) {
      const consumeResult = WalletManager.consume(recalculatedWalletDeduction, '购物消费');
      if (!consumeResult.ok) {
        this.setData({ walletBalance: consumeResult.balance.toFixed(2) });
        this.calculateTotal();
        wx.showToast({ title: '余额已变更，请重新确认订单', icon: 'none' });
        return;
      }
    }

    OrderManager.createOrderFromCheckout({
      items: checkoutItems,
      originalPrice: this.data.originalPrice,
      memberPrice: this.data.totalPrice,
      couponDiscount: this.data.discountAmount,
      finalPrice: this.data.finalPrice,
      walletDeduction: recalculatedWalletDeduction.toFixed(2),
      payAmount: recalculatedPayAmount.toFixed(2),
      couponInfo: this.data.selectedCoupon,
      status: 1
    });

    const points = MemberManager.calculatePoints(expectedFinalPrice, currentTotalSpend);
    if (points > 0) PointManager.addPoints(points, '购物获得');

    const newSpend = currentTotalSpend + expectedFinalPrice;
    app.globalData.totalSpend = newSpend;
    wx.setStorageSync('totalSpend', newSpend);

    if (this.data.selectedCoupon) {
      CouponManager.markCouponUsed(this.data.selectedCoupon.id);
      wx.removeStorageSync('selectedCoupon');
    }

    const remaining = this.data.cartList.filter(item => !item.selected);
    wx.setStorageSync('myCart', remaining);

    wx.showToast({ title: '支付成功', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' });
    }, 1500);
  }
});
