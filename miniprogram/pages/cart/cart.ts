// miniprogram/pages/cart/cart.ts
import { IAppOption } from '../../app';
import { MemberManager } from '../../utils/memberManager';
import { CouponManager } from '../../utils/couponManager';
import { AuthService } from '../../utils/authService';
import { OrderService } from '../../utils/orderService';

const { normalizeCartItems } = require('../../utils/cartViewModel.js') as {
  normalizeCartItems: (items: any[]) => any[];
};
const { validateDeliveryInfo, buildCheckoutSuccessState } = require('../../utils/checkoutViewModel.js') as {
  validateDeliveryInfo: (input: any) => {
    ok: boolean;
    message: string;
    deliveryInfo: {
      receiverName: string;
      phone: string;
      address: string;
      note: string;
    } | null;
  };
  buildCheckoutSuccessState: (items: any[]) => {
    cartList: any[];
    isAllSelected: boolean;
    selectedCount: number;
  };
};

const app = getApp<IAppOption>();

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
    payAmount: '0.00',
    selectedCount: 0,
    selectedCoupon: null as any,
    hasDiscount: false,
    isSubmitting: false,
    deliveryInfo: {
      receiverName: '',
      phone: '',
      address: '',
      note: ''
    }
  },

  onShow() { this.initData(); },

  initData() {
    const cart = normalizeCartItems(wx.getStorageSync('myCart') || []);
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
      selectedCoupon: coupon
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

  onDeliveryInput(e: WechatMiniprogram.Input) {
    const field = e.currentTarget.dataset.field;
    if (!field) return;
    this.setData({ [`deliveryInfo.${field}`]: e.detail.value });
  },

  calculateTotal() {
    const list = this.data.cartList;
    const coupon = this.data.selectedCoupon;
    const totalSpend = app.globalData.totalSpend || 0;

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

    const finalPrice = Math.max(totalMember - couponDiscount, 0);

    this.setData({
      isAllSelected: isAll,
      selectedCount,
      originalPrice: totalOrigin.toFixed(2),
      totalPrice: totalMember.toFixed(2),
      discountAmount: couponDiscount.toFixed(2),
      memberSavings: (totalOrigin - totalMember).toFixed(2),
      finalPrice: finalPrice.toFixed(2),
      payAmount: finalPrice.toFixed(2),
      hasDiscount: couponDiscount > 0
    });
  },

  async onCheckout() {
    if (this.data.isSubmitting) return;

    const checkedItems = this.data.cartList.filter(item => item.selected);
    if (checkedItems.length === 0) {
      wx.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }

    const deliveryValidation = validateDeliveryInfo(this.data.deliveryInfo);
    if (!deliveryValidation.ok || !deliveryValidation.deliveryInfo) {
      wx.showToast({ title: deliveryValidation.message, icon: 'none' });
      return;
    }

    this.setData({ isSubmitting: true });
    try {
      const authResult = await AuthService.ensureLogin();
      app.globalData.openid = authResult.openid;
      app.globalData.userId = authResult.userId;
      app.globalData.currentUser = authResult.profile;
      app.globalData.totalSpend = authResult.profile.totalSpend;
      wx.setStorageSync('totalSpend', authResult.profile.totalSpend);

      const currentTotalSpend = authResult.profile.totalSpend || 0;
      const checkoutItems = checkedItems.map(item => ({
        ...item,
        checkoutPrice: item.allowMemberDiscount !== false
          ? MemberManager.calculateDiscountPrice(item.price, currentTotalSpend)
          : item.price
      }));

      const createdOrder = await OrderService.createOrder({
        items: checkoutItems,
        originalPrice: this.data.originalPrice,
        memberPrice: this.data.totalPrice,
        couponDiscount: this.data.discountAmount,
        finalPrice: this.data.finalPrice,
        walletDeduction: '0.00',
        payAmount: this.data.payAmount,
        couponInfo: this.data.selectedCoupon,
        deliveryInfo: deliveryValidation.deliveryInfo
      });

      const checkoutSuccessState = buildCheckoutSuccessState(this.data.cartList);
      const remaining = normalizeCartItems(checkoutSuccessState.cartList);
      wx.setStorageSync('myCart', remaining);
      wx.removeStorageSync('selectedCoupon');
      this.setData({
        ...checkoutSuccessState,
        cartList: remaining,
        selectedCoupon: null
      });

      wx.showToast({ title: '订单已创建', icon: 'success' });
      setTimeout(() => {
        wx.navigateTo({ url: `/pages/orderDetail/orderDetail?orderId=${createdOrder.orderId}` });
      }, 400);
    } catch (e) {
      console.error('创建订单失败', e);
      wx.showToast({ title: '订单创建失败', icon: 'none' });
    } finally {
      this.setData({ isSubmitting: false });
    }
  }
});
