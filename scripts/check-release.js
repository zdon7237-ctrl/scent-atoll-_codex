const { findReleaseViolations } = require('./lib/devtools-isolation');

const violations = findReleaseViolations(process.cwd());
if (violations.length > 0) {
  console.error('Release guard failed:');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log('Release guard passed.');
