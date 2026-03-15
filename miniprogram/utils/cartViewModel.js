const CART_FALLBACK_IMAGE = '/images/home.png';
const LEGACY_CART_PLACEHOLDER = '/pages/cart/default.png';

function normalizeCartItems(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    image: !item.image || item.image === LEGACY_CART_PLACEHOLDER
      ? CART_FALLBACK_IMAGE
      : item.image
  }));
}

module.exports = {
  CART_FALLBACK_IMAGE,
  normalizeCartItems
};