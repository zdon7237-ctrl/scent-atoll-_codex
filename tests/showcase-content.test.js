const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function imageExists(imagePath) {
  const normalized = imagePath.replace(/^\//, '');
  return fs.existsSync(path.join(root, 'miniprogram', normalized));
}

test('home page is a complete storefront instead of a price fragment', () => {
  const wxml = readText('miniprogram/pages/index/index.wxml');

  assert.match(wxml, /class="storefront/);
  assert.match(wxml, /精选香水/);
  assert.match(wxml, /wx:for="{{perfumeList}}"/);
  assert.match(wxml, /bindtap="goToDetail"/);
  assert.match(wxml, /bindtap="goToCategory"/);
  assert.match(wxml, /会员权益/);
  assert.ok(wxml.split(/\r?\n/).length >= 60);
});

test('local perfume catalog has project-local images and detail content', () => {
  const source = readText('miniprogram/data/perfumes.ts');

  const imageMatches = Array.from(source.matchAll(/image:\s*['"]([^'"]+)['"]/g)).map(match => match[1]);
  assert.equal(imageMatches.length, 5);
  for (const imagePath of imageMatches) {
    assert.notEqual(imagePath, '');
    assert.ok(imageExists(imagePath), `${imagePath} should exist`);
  }

  assert.equal((source.match(/notes:\s*\{/g) || []).length, 5);
  assert.equal((source.match(/story:\s*['"`]/g) || []).length, 5);
  assert.equal((source.match(/volume:\s*['"]/g) || []).length, 5);
});

test('tab bar uses distinct local icons for each entry', () => {
  const appJson = JSON.parse(readText('miniprogram/app.json'));
  const iconPaths = appJson.tabBar.list.map(item => item.iconPath);
  const selectedIconPaths = appJson.tabBar.list.map(item => item.selectedIconPath);

  assert.equal(new Set(iconPaths).size, iconPaths.length);
  assert.equal(new Set(selectedIconPaths).size, selectedIconPaths.length);

  for (const iconPath of [...iconPaths, ...selectedIconPaths]) {
    assert.ok(imageExists(iconPath), `${iconPath} should exist`);
  }
});

test('brand page logo references point to project-local assets', () => {
  const source = readText('miniprogram/data/brands.ts');
  const logoMatches = Array.from(source.matchAll(/logo:\s*['"]([^'"]*)['"]/g)).map(match => match[1]).filter(Boolean);

  assert.ok(logoMatches.length >= 4);
  for (const logoPath of logoMatches) {
    assert.ok(imageExists(logoPath), `${logoPath} should exist`);
  }
});

test('point shop gifts have project-local images even while redemption is disabled', () => {
  const source = readText('miniprogram/pages/pointShop/pointShop.ts');
  const imageMatches = Array.from(source.matchAll(/image:\s*['"]([^'"]+)['"]/g)).map(match => match[1]);

  assert.equal(imageMatches.length, 3);
  for (const imagePath of imageMatches) {
    assert.ok(imageExists(imagePath), `${imagePath} should exist`);
  }
});

test('order detail explains unavailable payment as a merchant setup state', () => {
  const source = readText('miniprogram/pages/orderDetail/orderDetail.ts');

  assert.match(source, /支付暂未开通，请联系商家/);
  assert.doesNotMatch(source, /订单金额待服务端/);
});
