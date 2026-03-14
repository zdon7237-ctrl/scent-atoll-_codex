// miniprogram/pages/brands/brands.ts
import { BrandItem, CategoryData } from '../../data/brands';
import { DbManager } from '../../utils/db';

Page({
  data: {
    categories: [] as CategoryData[],
    curIndex: 0,
    currentList: [] as BrandItem[],
    scrollTop: 0,
    searchQuery: '',
    isSearching: false,
    isLoading: true
  },

  onLoad() {
    this.loadBrands();
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadBrands(false);
    wx.stopPullDownRefresh();
  },

  // 从云数据库加载品牌数据
  async loadBrands(useCache: boolean = true) {
    this.setData({ isLoading: true });
    try {
      const categories = await DbManager.getBrands(useCache);
      this.setData({ categories });
      if (categories.length > 0) {
        this.updateRightList(0);
      }
    } catch (e) {
      console.error('加载品牌数据失败', e);
    } finally {
      this.setData({ isLoading: false });
    }
  },

  // 切换左侧分类
  switchCategory(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index;

    // 如果处于搜索状态，先退出搜索状态
    if (this.data.isSearching) {
      this.setData({
        isSearching: false,
        searchQuery: '',
        curIndex: index,
        scrollTop: 0
      });
      this.updateRightList(index);
      return;
    }

    if (this.data.curIndex === index) return;

    this.setData({
      curIndex: index,
      scrollTop: 0
    });

    this.updateRightList(index);
  },

  // 更新右侧数据：显示指定分类下的品牌
  updateRightList(index: number) {
    if (this.data.categories[index]) {
      const rawItems = this.data.categories[index].items;
      this.setData({ currentList: rawItems });
    }
  },

  // 搜索输入监听
  onSearchInput(e: WechatMiniprogram.Input) {
    const query = e.detail.value.trim();

    this.setData({ searchQuery: query });

    if (!query) {
      this.setData({ isSearching: false });
      this.updateRightList(this.data.curIndex);
      return;
    }

    this.setData({ isSearching: true, scrollTop: 0 });
    this.doLocalSearch(query);
  },

  // 执行本地搜索
  doLocalSearch(keyword: string) {
    const lowerKey = keyword.toLowerCase();
    let results: BrandItem[] = [];

    this.data.categories.forEach(cat => {
      const matches = cat.items.filter(item =>
        item.name.toLowerCase().includes(lowerKey)
      );
      results = results.concat(matches);
    });

    // 去重
    const uniqueResults = Array.from(new Set(results.map(b => b.name)))
      .map(name => results.find(b => b.name === name)!);

    this.setData({ currentList: uniqueResults });
  },

  // 清空搜索
  onClearSearch() {
    this.setData({
      searchQuery: '',
      isSearching: false
    });
    this.updateRightList(this.data.curIndex);
  },

  // 点击品牌跳转
  onBrandClick(e: WechatMiniprogram.TouchEvent) {
    const brandName = e.currentTarget.dataset.name;
    const realName = brandName.split('(')[0].trim();

    wx.setStorageSync('tempSearchFilter', realName);
    wx.switchTab({
      url: '/pages/category/category'
    });
  },

  goToCart() {
    wx.switchTab({ url: '/pages/cart/cart' });
  }
});