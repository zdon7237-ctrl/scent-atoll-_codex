const { copyConfig } = require('./lib/devtools-isolation');

const result = copyConfig('release', process.cwd());
console.log(`Switched app.json to release profile from ${result.source}`);
