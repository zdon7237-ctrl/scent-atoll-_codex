const fs = require('node:fs');
const path = require('node:path');

const CONFIG_FILES = {
  dev: path.join('miniprogram', 'app.dev.json'),
  release: path.join('miniprogram', 'app.release.json')
};

const BANNED_TOKENS = [
  '后台管理 (Dev)',
  '模拟发货',
  'onGoToAdmin',
  'onMarkShipped'
];

const RUNTIME_EXTENSIONS = new Set(['.ts', '.json', '.wxml']);

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function copyConfig(profile, root = process.cwd()) {
  const sourceRelative = CONFIG_FILES[profile];
  if (!sourceRelative) {
    throw new Error(`Unknown profile: ${profile}`);
  }

  const source = path.join(root, sourceRelative);
  const target = path.join(root, 'miniprogram', 'app.json');

  if (!fs.existsSync(source)) {
    throw new Error(`Missing config source: ${source}`);
  }

  fs.writeFileSync(target, readText(source), 'utf8');
  return { source, target };
}

function getRegisteredPages(root = process.cwd()) {
  const appJsonPath = path.join(root, 'miniprogram', 'app.json');
  const appJson = readJson(appJsonPath);
  return Array.isArray(appJson.pages) ? appJson.pages : [];
}

function collectRuntimeFiles(root = process.cwd()) {
  const files = [path.join(root, 'miniprogram', 'app.json')];
  const pages = getRegisteredPages(root);

  for (const page of pages) {
    const basePath = path.join(root, 'miniprogram', page);
    for (const ext of RUNTIME_EXTENSIONS) {
      const filePath = `${basePath}${ext}`;
      if (fs.existsSync(filePath)) {
        files.push(filePath);
      }
    }
  }

  return files;
}

function findReleaseViolations(root = process.cwd()) {
  const violations = [];
  const pages = getRegisteredPages(root);

  if (pages.includes('pages/devtools/devtools')) {
    violations.push('app.json must not register pages/devtools/devtools in release profile');
  }

  if (pages.includes('pages/admin/admin')) {
    violations.push('app.json must not register pages/admin/admin in release profile');
  }

  for (const filePath of collectRuntimeFiles(root)) {
    const content = readText(filePath);
    for (const token of BANNED_TOKENS) {
      if (content.includes(token)) {
        violations.push(`${path.relative(root, filePath)} contains banned token: ${token}`);
      }
    }
  }

  return violations;
}

module.exports = {
  copyConfig,
  findReleaseViolations
};