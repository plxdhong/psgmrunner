#!/usr/bin/env node
const Module = require('module');
const path = require('path');
const projectRoot = process.cwd();

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  if (request === 'vscode' || request.startsWith('vscode/')) {
    console.log('[shim] Redirecting vscode request');
    return originalResolve.call(Module, path.join(projectRoot, 'test/vscode-shim.js'), parent, isMain, options);
  }
  return originalResolve.call(Module, request, parent, isMain, options);
};

console.log('[shim-register] VS Code shim loaded for:', projectRoot);