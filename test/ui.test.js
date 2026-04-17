"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const presetTreeDataProvider_1 = require("../src/ui/presetTreeDataProvider");
const targetTreeDataProvider_1 = require("../src/ui/targetTreeDataProvider");
describe('ui', () => {
    describe('PresetTreeDataProvider', () => {
        it('should create tree data provider', () => {
            const provider = new presetTreeDataProvider_1.PresetTreeDataProvider();
            assert.ok(provider);
        });
        it('should set presets and fire change event', () => {
            const provider = new presetTreeDataProvider_1.PresetTreeDataProvider();
            let changed = false;
            provider.onDidChangeTreeData(() => {
                changed = true;
            });
            provider.setPresets([], undefined);
            assert.strictEqual(changed, true);
        });
        it('should find item by preset name', () => {
            const provider = new presetTreeDataProvider_1.PresetTreeDataProvider();
            provider.setPresets([
                {
                    name: 'debug',
                    displayName: 'Debug',
                    binaryDir: '/build/debug',
                    sourceDir: '/src',
                },
            ], 'debug');
            const item = provider.findItem('debug');
            assert.ok(item instanceof presetTreeDataProvider_1.PresetTreeItem);
        });
        it('should return undefined for unknown preset', () => {
            const provider = new presetTreeDataProvider_1.PresetTreeDataProvider();
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
            const item = new presetTreeDataProvider_1.PresetTreeItem(preset, false);
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
            const item = new presetTreeDataProvider_1.PresetTreeItem(preset, true);
            assert.strictEqual(item.description, 'Current');
        });
    });
    describe('TargetTreeDataProvider', () => {
        it('should create target tree data provider', () => {
            const provider = new targetTreeDataProvider_1.TargetTreeDataProvider();
            assert.ok(provider);
        });
        it('should set targets and fire change event', () => {
            const provider = new targetTreeDataProvider_1.TargetTreeDataProvider();
            let changed = false;
            provider.onDidChangeTreeData(() => {
                changed = true;
            });
            provider.setTargets([], '/src', undefined);
            assert.strictEqual(changed, true);
        });
        it('should return zero visible targets when empty', () => {
            const provider = new targetTreeDataProvider_1.TargetTreeDataProvider();
            provider.setTargets([], '/src', undefined);
            assert.strictEqual(provider.getVisibleTargetCount(), 0);
        });
        it('should filter targets by name', () => {
            const provider = new targetTreeDataProvider_1.TargetTreeDataProvider();
            const targets = [
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
            const provider = new targetTreeDataProvider_1.TargetTreeDataProvider();
            const targets = [
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
            const provider = new targetTreeDataProvider_1.TargetTreeDataProvider();
            const targets = [
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
            const provider = new targetTreeDataProvider_1.TargetTreeDataProvider();
            const targets = [
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
            assert.ok(item instanceof targetTreeDataProvider_1.TargetTreeItem);
        });
        it('should find first source item by file path', () => {
            const provider = new targetTreeDataProvider_1.TargetTreeDataProvider();
            const targets = [
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
            assert.ok(item instanceof targetTreeDataProvider_1.SourceTreeItem);
        });
        it('should return parent for source item', () => {
            const provider = new targetTreeDataProvider_1.TargetTreeDataProvider();
            const targets = [
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
            const parent = provider.getParent(sourceItem);
            assert.ok(parent instanceof targetTreeDataProvider_1.TargetTreeItem);
        });
        it('should track active source path', () => {
            const provider = new targetTreeDataProvider_1.TargetTreeDataProvider();
            const targets = [
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
            const target = {
                id: 'myapp',
                name: 'myapp',
                displayName: 'My App',
                sourceFiles: ['/src/main.cpp'],
                guessedExecutablePath: '/build/myapp',
            };
            const item = new targetTreeDataProvider_1.TargetTreeItem(target);
            assert.strictEqual(item.label, 'My App');
            assert.strictEqual(item.contextValue, 'target');
        });
    });
    describe('SourceTreeItem', () => {
        it('should create source tree item', () => {
            const item = new targetTreeDataProvider_1.SourceTreeItem('/src/main.cpp', 'myapp', '/src', false);
            assert.ok(item.label);
            assert.strictEqual(item.contextValue, 'source');
        });
        it('should show current indicator when active', () => {
            const item = new targetTreeDataProvider_1.SourceTreeItem('/src/main.cpp', 'myapp', '/src', true);
            assert.strictEqual(item.description, 'Current');
        });
    });
});
//# sourceMappingURL=ui.test.js.map