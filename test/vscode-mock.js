// Comprehensive Mock for VS Code Extension Testing
// Works with mocha --require flag

const Module = require('module');
const path = require('path');
const projectRoot = process.cwd();

// Fully mock VS Code module
const vscode = {
  // Workspace APIs
  workspace: {
    getConfiguration: (section = '') => ({
      get: (key, defaultValue) => {
        const defaults = {
          'tasks.presetConfigureCommandTemplate': 'cmake --preset ${preset}',
          'tasks.buildCommandTemplate': 'cmake --build ${buildDir}${configurationArgument} --target ${target}',
          'tasks.runCommandTemplate': '${executableCommand}',
          'tasks.clearTerminalBeforeRun': true
        };
        return defaults[key] ?? defaultValue;
      },
      has: () => true,
      update: async () => {},
      inspect: (key) => ({ key, defaultValue: undefined, globalValue: undefined, workspaceValue: undefined }),
    }),
    workspaceFolders: [{ uri: { fsPath: projectRoot } }],
    fs: {
      readFile: async () => new Uint8Array(),
      readDirectory: async () => [],
      createDirectory: async () => {},
      writeFile: async () => {},
      stat: async () => ({ ctime: 0, mtime: 0, size: 0, type: 1 }),
    },
  },
  
  // Window APIs  
  window: {
    createOutputChannel: (name) => ({
      name, append: () => {}, appendLine: () => {}, clear: () => {}, show: () => {}, hide: () => {}, dispose: () => {},
    }),
    showInformationMessage: async (msg) => undefined,
    showWarningMessage: async (msg) => undefined,
    showErrorMessage: async (msg) => undefined,
    showQuickPick: async (items) => items?.[0],
    showInputBox: async () => undefined,
    activeTextEditor: undefined,
    onDidChangeActiveTextEditor: () => ({ dispose: () => {} }),
  },
  
  // Commands
  commands: {
    registerCommand: () => ({ dispose: () => {} }),
    executeCommand: async () => undefined,
  },
  
  // Tree Views
  TreeItem: class {
    constructor(label, collapsibleState = 0) {
      this.label = label;
      this.collapsibleState = collapsibleState;
      this.contextValue = '';
    }
  },
  TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
  TreeDataProvider: class {},
  
  // File System
  FileType: { Unknown: 0, File: 1, Directory: 2, SymbolicLink: 64 },
  Uri: {
    file: (fsPath) => ({ fsPath }),
    parse: (uri) => ({ fsPath: uri }),
  },
  
  // Events
  EventEmitter: class {
    constructor() { this.event = () => {}; }
    fire(data) { this.event(data); }
    dispose() { }
  },
  
  // Debug
  debug: {
    startDebugging: async () => false,
  },
  
  // Tasks
  tasks: {
    executeTask: async () => ({}),
    onDidEndTaskProcess: () => ({ dispose: () => {} }),
    onDidEndTask: () => ({ dispose: () => {} }),
    TaskRevealKind: { Never: 1, Always: 2, Silent: 3 },
    TaskPanelKind: { Dedicated: 1, Shared: 2, Silent: 3, NewWindow: 4 },
    TaskGroup: { Build: {}, Clean: {}, Test: {} },
    TaskScope: { Workspace: 2 },
  },
  
  // Shell
  ShellExecution: class {
    constructor(cmd, opts = {}) { this.command = cmd; this.options = opts; }
  },
  
  // Theme
  ThemeIcon: class {
    constructor(id) { this.id = id; }
  },
};

// Install mock BEFORE mocha loads test files
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'vscode' || request.startsWith('vscode/')) {
    return originalLoad.call(this, path.join(projectRoot, 'test/vscode-mock.js'), parent, isMain);
  }
  return originalLoad.call(this, request, parent, isMain);
};

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  if (request === 'vscode' || request.startsWith('vscode/')) {
    return originalResolve.call(Module, path.join(projectRoot, 'test/vscode-mock.js'), parent, isMain, options);
  }
  return originalResolve.call(Module, request, parent, isMain, options);
};

// Export for direct require
module.exports = vscode;
module.exports.default = vscode;