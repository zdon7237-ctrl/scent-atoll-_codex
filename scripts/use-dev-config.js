const { copyConfig } = require('./lib/devtools-isolation');

const result = copyConfig('dev', process.cwd());
console.log(`Switched app.json to dev profile from ${result.source}`);
