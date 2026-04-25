const vscode = {
  workspace: {
    getConfiguration: () => ({
      get: (_key, defaultValue) => defaultValue,
      has: () => false,
      update: async () => {},
      inspect: (_key) => ({ key: _key, defaultValue: undefined, globalValue: undefined, workspaceValue: undefined }),
    }),
    workspaceFolders: [],
    fs: {
      readFile: async () => new Uint8Array(),
      readDirectory: async () => [],
      createDirectory: async () => {},
      writeFile: async () => {},
      stat: async () => ({ ctime: 0, mtime: 0, size: 0, type: 0 }),
    },
  },
  window: {
    createOutputChannel: () => ({
      name: '',
      append: () => {},
      appendLine: () => {},
      clear: () => {},
      show: () => {},
      hide: () => {},
      dispose: () => {},
    }),
    showInformationMessage: async () => undefined,
    showWarningMessage: async () => undefined,
    showErrorMessage: async () => undefined,
    showQuickPick: async () => undefined,
    showInputBox: async () => undefined,
    activeTextEditor: undefined,
    onDidChangeActiveTextEditor: () => ({ dispose: () => {} }),
  },
  commands: {
    registerCommand: () => ({ dispose: () => {} }),
    executeCommand: async () => undefined,
  },
  TreeItem: class TreeItem {},
  TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
  TreeDataProvider: class TreeDataProvider {},
  FileType: { Unknown: 0, File: 1, Directory: 2, SymbolicLink: 64 },
  Uri: { file: (path) => ({ fsPath: path }) },
  EventEmitter: class EventEmitter {
    constructor() { this.event = undefined; }
    fire() { }
    dispose() { }
  },
  debug: {
    startDebugging: async () => false,
  },
  tasks: {
    executeTask: async () => ({}),
    onDidEndTaskProcess: () => ({ dispose: () => {} }),
    onDidEndTask: () => ({ dispose: () => {} }),
    TaskRevealKind: { Never: 1, Always: 2, Silent: 3 },
    TaskPanelKind: { Dedicated: 1, Shared: 2, Silent: 3, NewWindow: 4 },
    TaskGroup: { Build: 'build', Clean: 'clean', Test: 'test' },
    TaskScope: { Workspace: 2 },
  },
  ConfigurationTarget: { Global: 1, Workspace: 2, WorkspaceFolder: 3 },
  ShellExecution: class ShellExecution {},
  ThemeIcon: class ThemeIcon {
    constructor(_id) { }
  },
};

module.exports = vscode;
module.exports.default = vscode;
