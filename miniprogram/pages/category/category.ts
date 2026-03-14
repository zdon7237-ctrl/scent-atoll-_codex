import { IAppOption } from '../../app';
import { MemberManager } from '../../utils/memberManager';
import { DbManager } from '../../utils/db';
import { PerfumeItem } from '../../data/perfumes';
import { CouponManager } from '../../utils/couponManager';

const app = getApp<IAppOption>();

Page({
  data: {
    perfumes: [] as any[],
    allPerfumes: [] as PerfumeItem[],
    activeTab: 0,
    searchQuery: '',
    sortAsc: false,
    coupons: [] as any[],
    isLoading: false
  },

  onLoad() {
    this.loadPerfumes();
  },

  onShow() {
    const tempFilter = wx.getStorageSync('tempSearchFilter');
    if (tempFilter) {
      this.setData({ searchQuery: tempFilter });
      wx.removeStorageSync('tempSearchFilter');
    }

    const myCoupons = CouponManager.getUserCoupons();
    const validCoupons = myCoupons.filter(c => CouponManager.getCouponStatus(c) === 0);
    this.setData({ coupons: validCoupons });

    this.filterAndSort();
  },

  async onPullDownRefresh() {
    await this.loadPerfumes(false);
    wx.stopPullDownRefresh();
  },

  async loadPerfumes(useCache: boolean = true) {
    this.setData({ isLoading: true });
    try {
      const perfumes = await DbManager.getPerfumes(useCache);
      this.setData({ allPerfumes: perfumes });
      this.filterAndSort();
    } catch (e) {
      console.error('加载商品失败', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  resetSearch() {
    this.setData({ searchQuery: '' });
    this.filterAndSort();
  },

  goToDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
    }
  },

  addToCart(e: any) {
    const item = e.currentTarget.dataset.item;
    let cart = wx.getStorageSync('myCart') || [];
    const index = cart.findIndex((p: any) => p.id === item.id);

    if (index > -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1, selected: true, spec: '标准装' });
    }

    wx.setStorageSync('myCart', cart);
    wx.showToast({ title: '已加入', icon: 'success', duration: 800 });
  },

  onSearchInput(e: any) {
    this.setData({ searchQuery: e.detail.value });
    this.filterAndSort();
  },

  onTabClick(e: any) {
    const index = Number(e.currentTarget.dataset.index);
    if (index === 2 && this.data.activeTab === 2) {
      this.setData({ sortAsc: !this.data.sortAsc });
    } else {
      this.setData({ sortAsc: false });
    }

    this.setData({ activeTab: index });
    this.filterAndSort();
  },

  filterAndSort() {
    let list = [...this.data.allPerfumes];
    const { searchQuery, activeTab, sortAsc, coupons } = this.data;

    const totalSpend = app.globalData.totalSpend || wx.getStorageSync('totalSpend') || 0;
    const currentLevel = MemberManager.getCurrentLevel(totalSpend);
    const isVip = currentLevel.discount < 1.0;

    if (searchQuery) {
      const key = searchQuery.toLowerCase();
      list = list.filter(item =>
        item.name.toLowerCase().includes(key) ||
        item.brand.toLowerCase().includes(key) ||
        (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(key)))
      );
    }

    switch (activeTab) {
      case 0:
        list.sort((a, b) => a.id - b.id);
        break;
      case 1:
        list.sort((a, b) => b.sales - a.sales);
        break;
      case 2:
        if (sortAsc) {
          list.sort((a, b) => a.price - b.price);
        } else {
          list.sort((a, b) => b.price - a.price);
        }
        break;
      case 3:
        list = list.filter(item => item.isNew);
        break;
    }

    const displayList = list.map(item => {
      const canUseMemberPrice = item.allowMemberDiscount !== false;
      const isMemberMatched = isVip && canUseMemberPrice;
      let currentPriceVal = item.price;

      if (isMemberMatched) {
        currentPriceVal = MemberManager.calculateDiscountPrice(item.price, totalSpend);
      }

      let bestPriceVal = currentPriceVal;
      coupons.forEach((coupon: any) => {
        if (currentPriceVal < coupon.min) return;

        if (coupon.limitBrands && coupon.limitBrands.length > 0) {
          const match = coupon.limitBrands.some((brandKey: string) => item.brand.includes(brandKey));
          if (!match) return;
        }

        let tempPrice = currentPriceVal;
        if (coupon.type === 'cash') {
          tempPrice = currentPriceVal - coupon.value;
        } else if (coupon.type === 'discount') {
          tempPrice = currentPriceVal * coupon.value;
        }

        if (tempPrice < bestPriceVal) {
          bestPriceVal = tempPrice;
        }
      });

      return {
        ...item,
        originalPrice: item.price.toFixed(0),
        currentPrice: currentPriceVal.toFixed(0),
        lowestPrice: bestPriceVal.toFixed(0),
        isMember: isMemberMatched,
        canUseMemberPrice,
        hasDiscount: bestPriceVal < currentPriceVal
      };
    });

    this.setData({ perfumes: displayList });
  }
});
