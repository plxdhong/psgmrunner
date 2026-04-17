import * as assert from 'assert';
import { PresetTreeDataProvider, PresetTreeItem } from '../src/ui/presetTreeDataProvider';
import { TargetTreeDataProvider, TargetTreeItem, SourceTreeItem } from '../src/ui/targetTreeDataProvider';
import { TargetInfo } from '../src/models';

describe('ui', () => {
  describe('PresetTreeDataProvider', () => {
    it('should create tree data provider', () => {
      const provider = new PresetTreeDataProvider();
      assert.ok(provider);
    });

    it('should set presets and fire change event', () => {
      const provider = new PresetTreeDataProvider();
      let changed = false;
      provider.onDidChangeTreeData(() => {
        changed = true;
      });

      provider.setPresets([], undefined);
      assert.strictEqual(changed, true);
    });

    it('should find item by preset name', () => {
      const provider = new PresetTreeDataProvider();
      provider.setPresets([
        {
          name: 'debug',
          displayName: 'Debug',
          binaryDir: '/build/debug',
          sourceDir: '/src',
        },
      ], 'debug');

      const item = provider.findItem('debug');
      assert.ok(item instanceof PresetTreeItem);
    });

    it('should return undefined for unknown preset', () => {
      const provider = new PresetTreeDataProvider();
      provider.setPresets([], undefined);
      const item = provider.findItem('unknown');
      assert.strictEqual(item, undefined);
    });
  });

  describe('PresetTreeItem', () => {
    it('should create tree item with preset info', () => {
      const preset = {
        name: 'debug',
        displayName: 'Debug',
        binaryDir: '/build/debug',
        sourceDir: '/src',
      };
      const item = new PresetTreeItem(preset, false);
      assert.strictEqual(item.label, 'Debug');
      assert.strictEqual(item.contextValue, 'preset');
    });

    it('should show check icon when selected', () => {
      const preset = {
        name: 'debug',
        displayName: 'Debug',
        binaryDir: '/build/debug',
        sourceDir: '/src',
      };
      const item = new PresetTreeItem(preset, true);
      assert.strictEqual(item.description, 'Current');
    });
  });

  describe('TargetTreeDataProvider', () => {
    it('should create target tree data provider', () => {
      const provider = new TargetTreeDataProvider();
      assert.ok(provider);
    });

    it('should set targets and fire change event', () => {
      const provider = new TargetTreeDataProvider();
      let changed = false;
      provider.onDidChangeTreeData(() => {
        changed = true;
      });

      provider.setTargets([], '/src', undefined);
      assert.strictEqual(changed, true);
    });

    it('should return zero visible targets when empty', () => {
      const provider = new TargetTreeDataProvider();
      provider.setTargets([], '/src', undefined);
      assert.strictEqual(provider.getVisibleTargetCount(), 0);
    });

    it('should filter targets by name', () => {
      const provider = new TargetTreeDataProvider();
      const targets: TargetInfo[] = [
        {
          id: 'myapp',
          name: 'myapp',
          displayName: 'My App',
          sourceFiles: ['/src/main.cpp'],
          guessedExecutablePath: '/build/myapp',
        },
        {
          id: 'other',
          name: 'other',
          displayName: 'Other',
          sourceFiles: ['/src/other.cpp'],
          guessedExecutablePath: '/build/other',
        },
      ];

      provider.setTargets(targets, '/src', undefined);
      provider.setFilterText('myapp');
      assert.strictEqual(provider.getVisibleTargetCount(), 1);
    });

    it('should filter targets by source file', () => {
      const provider = new TargetTreeDataProvider();
      const targets: TargetInfo[] = [
        {
          id: 'myapp',
          name: 'myapp',
          displayName: 'My App',
          sourceFiles: ['/src/main.cpp'],
          guessedExecutablePath: '/build/myapp',
        },
      ];

      provider.setTargets(targets, '/src', undefined);
      provider.setFilterText('main');
      assert.strictEqual(provider.getVisibleTargetCount(), 1);
    });

    it('should clear filter', () => {
      const provider = new TargetTreeDataProvider();
      const targets: TargetInfo[] = [
        {
          id: 'myapp',
          name: 'myapp',
          displayName: 'My App',
          sourceFiles: ['/src/main.cpp'],
          guessedExecutablePath: '/build/myapp',
        },
      ];

      provider.setTargets(targets, '/src', undefined);
      provider.setFilterText('myapp');
      provider.setFilterText('');
      assert.strictEqual(provider.getVisibleTargetCount(), 1);
    });

    it('should find target item by id', () => {
      const provider = new TargetTreeDataProvider();
      const targets: TargetInfo[] = [
        {
          id: 'myapp',
          name: 'myapp',
          displayName: 'My App',
          sourceFiles: ['/src/main.cpp'],
          guessedExecutablePath: '/build/myapp',
        },
      ];

      provider.setTargets(targets, '/src', undefined);
      const item = provider.findTargetItem('myapp');
      assert.ok(item instanceof TargetTreeItem);
    });

    it('should find first source item by file path', () => {
      const provider = new TargetTreeDataProvider();
      const targets: TargetInfo[] = [
        {
          id: 'myapp',
          name: 'myapp',
          displayName: 'My App',
          sourceFiles: ['/src/main.cpp'],
          guessedExecutablePath: '/build/myapp',
        },
      ];

      provider.setTargets(targets, '/src', undefined);
      const item = provider.findFirstSourceItemByFile('/src/main.cpp');
      assert.ok(item instanceof SourceTreeItem);
    });

    it('should return parent for source item', () => {
      const provider = new TargetTreeDataProvider();
      const targets: TargetInfo[] = [
        {
          id: 'myapp',
          name: 'myapp',
          displayName: 'My App',
          sourceFiles: ['/src/main.cpp'],
          guessedExecutablePath: '/build/myapp',
        },
      ];

      provider.setTargets(targets, '/src', undefined);
      const sourceItem = provider.findFirstSourceItemByFile('/src/main.cpp');
      const parent = provider.getParent(sourceItem as SourceTreeItem);
      assert.ok(parent instanceof TargetTreeItem);
    });

    it('should track active source path', () => {
      const provider = new TargetTreeDataProvider();
      const targets: TargetInfo[] = [
        {
          id: 'myapp',
          name: 'myapp',
          displayName: 'My App',
          sourceFiles: ['/src/main.cpp'],
          guessedExecutablePath: '/build/myapp',
        },
      ];

      provider.setTargets(targets, '/src', '/src/main.cpp');
      const children = provider.getChildren();
      assert.ok(children);
    });
  });

  describe('TargetTreeItem', () => {
    it('should create target tree item', () => {
      const target: TargetInfo = {
        id: 'myapp',
        name: 'myapp',
        displayName: 'My App',
        sourceFiles: ['/src/main.cpp'],
        guessedExecutablePath: '/build/myapp',
      };
      const item = new TargetTreeItem(target);
      assert.strictEqual(item.label, 'My App');
      assert.strictEqual(item.contextValue, 'target');
    });
  });

  describe('SourceTreeItem', () => {
    it('should create source tree item', () => {
      const item = new SourceTreeItem('/src/main.cpp', 'myapp', '/src', false);
      assert.ok(item.label);
      assert.strictEqual(item.contextValue, 'source');
    });

    it('should show current indicator when active', () => {
      const item = new SourceTreeItem('/src/main.cpp', 'myapp', '/src', true);
      assert.strictEqual(item.description, 'Current');
    });
  });
});