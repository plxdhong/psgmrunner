const Module = require('module');
const path = require('path');
const projectRoot = path.join(__dirname, '..');

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  if (request === 'vscode' || request.startsWith('vscode/')) {
    return originalResolve.call(Module, path.join(projectRoot, 'test/vscode-shim.js'), parent, isMain, options);
  }
  return originalResolve.call(Module, request, parent, isMain, options);
};

const { spawn } = require('child_process');

const testFiles = [
  'out/test/utils.test.js',
  'out/test/models.test.js',
];

const child = spawn('node', ['node_modules/c8/bin/c8.js', '--reporter=text', 'node_modules/mocha/bin/mocha', '--timeout', '10000', ...testFiles], {
  stdio: 'inherit',
  cwd: projectRoot,
  env: { ...process.env, NODE_PATH: projectRoot + '/node_modules' }
});

child.on('exit', (code) => {
  process.exit(code || 0);
});