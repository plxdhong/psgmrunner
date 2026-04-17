import * as assert from 'assert';
import * as vscode from 'vscode';

export { assert };

export function createMockOutputChannel(): vscode.OutputChannel {
  return {
    name: 'test',
    append: () => {},
    appendLine: () => {},
    clear: () => {},
    show: () => {},
    hide: () => {},
    dispose: () => {},
  } as unknown as vscode.OutputChannel;
}

export function createMockWorkspaceConfiguration(
  settings?: Record<string, unknown>,
): vscode.WorkspaceConfiguration {
  const config = new Map(Object.entries(settings ?? {}));
  return {
    get: <T>(key: string, defaultValue?: T): T => {
      const value = config.get(key);
      return (value !== undefined ? value : defaultValue) as T;
    },
    has: (key: string): boolean => config.has(key),
    update: async (): Promise<void> => {},
    inspect: (_key: string) => ({ key: _key, defaultValue: undefined, globalValue: undefined, workspaceValue: undefined }),
  } as unknown as vscode.WorkspaceConfiguration;
}