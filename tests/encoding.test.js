const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const files = [
  'package.json',
  'miniprogram/app.json',
  'miniprogram/app.dev.json',
  'miniprogram/app.release.json',
  'miniprogram/pages/devtools/devtools.json',
  'miniprogram/pages/devtools/devtools.ts',
  'miniprogram/pages/devtools/devtools.wxml',
  'miniprogram/pages/devtools/devtools.wxss',
  'miniprogram/pages/orders/orders.ts',
  'miniprogram/pages/orders/orders.wxml',
  'miniprogram/pages/user/user.ts',
  'miniprogram/pages/user/user.wxml',
  'scripts/lib/devtools-isolation.js',
  'scripts/use-dev-config.js',
  'scripts/use-release-config.js',
  'scripts/check-release.js',
  'tests/devtools-fixtures.test.js',
  'tests/release-guard.test.js'
];

test('devtools isolation files are saved as utf8 without bom', () => {
  for (const file of files) {
    const buffer = fs.readFileSync(file);
    const hasBom = buffer.length >= 3 && buffer[0] === 239 && buffer[1] === 187 && buffer[2] === 191;
    assert.equal(hasBom, false, `${file} should not include a UTF-8 BOM`);
  }
});
