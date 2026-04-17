require('./vscode-shim');

const path = require('path');
const projectRoot = path.join(__dirname, '..');

const { spawn } = require('child_process');

const testFiles = [
  'out/test/utils.test.js',
  'out/test/models.test.js',
];

const child = spawn('node', ['node_modules/mocha/bin/mocha', '--timeout', '10000', ...testFiles], {
  stdio: 'inherit',
  cwd: projectRoot
});

child.on('exit', (code) => {
  process.exit(code || 0);
});