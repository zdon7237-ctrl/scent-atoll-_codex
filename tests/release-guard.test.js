const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { copyConfig, findReleaseViolations } = require('../scripts/lib/devtools-isolation.js');

test('release guard ignores app.dev.json and markdown files', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'devtools-guard-'));
  fs.mkdirSync(path.join(root, 'miniprogram', 'pages', 'user'), { recursive: true });
  fs.writeFileSync(path.join(root, 'miniprogram', 'app.json'), JSON.stringify({ pages: ['pages/index/index'] }, null, 2));
  fs.writeFileSync(path.join(root, 'miniprogram', 'app.dev.json'), JSON.stringify({ pages: ['pages/devtools/devtools'] }, null, 2));
  fs.writeFileSync(path.join(root, 'miniprogram', 'pages', 'user', 'user.wxml'), '<view>normal page</view>');
  fs.writeFileSync(path.join(root, 'README.md'), '后台管理 (Dev)');

  const violations = findReleaseViolations(root);
  assert.deepEqual(violations, []);
});

test('release guard reports banned runtime tokens and page registrations', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'devtools-guard-'));
  fs.mkdirSync(path.join(root, 'miniprogram', 'pages', 'orders'), { recursive: true });
  fs.writeFileSync(path.join(root, 'miniprogram', 'app.json'), JSON.stringify({ pages: ['pages/index/index', 'pages/orders/orders', 'pages/devtools/devtools'] }, null, 2));
  fs.writeFileSync(path.join(root, 'miniprogram', 'pages', 'orders', 'orders.wxml'), '<button>模拟发货</button>');
  fs.writeFileSync(path.join(root, 'miniprogram', 'pages', 'orders', 'orders.ts'), 'function onMarkShipped() {}');

  const violations = findReleaseViolations(root);
  assert.ok(violations.some(message => message.includes('pages/devtools/devtools')));
  assert.ok(violations.some(message => message.includes('模拟发货')));
  assert.ok(violations.some(message => message.includes('onMarkShipped')));
});

test('release guard can read app.json written with utf8 bom', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'devtools-guard-'));
  fs.mkdirSync(path.join(root, 'miniprogram'), { recursive: true });
  fs.writeFileSync(path.join(root, 'miniprogram', 'app.json'), '\uFEFF' + JSON.stringify({ pages: ['pages/index/index'] }, null, 2), 'utf8');

  const violations = findReleaseViolations(root);
  assert.deepEqual(violations, []);
});

test('copyConfig writes bom-free app.json even when source contains bom', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'devtools-copy-'));
  fs.mkdirSync(path.join(root, 'miniprogram'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'miniprogram', 'app.dev.json'),
    '\uFEFF' + JSON.stringify({ pages: ['pages/devtools/devtools'] }, null, 2),
    'utf8'
  );

  copyConfig('dev', root);

  const output = fs.readFileSync(path.join(root, 'miniprogram', 'app.json'));
  assert.notDeepEqual(Array.from(output.slice(0, 3)), [239, 187, 191]);
});
