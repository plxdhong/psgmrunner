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
exports.TargetTreeDataProvider = exports.SourceTreeItem = exports.TargetTreeItem = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const utils_1 = require("../utils");
class TargetTreeItem extends vscode.TreeItem {
    constructor(target) {
        super(target.displayName, vscode.TreeItemCollapsibleState.Collapsed);
        this.target = target;
        this.description = path.basename(target.guessedExecutablePath);
        this.tooltip = `${target.displayName}\n${target.guessedExecutablePath}`;
        this.contextValue = 'target';
        this.iconPath = new vscode.ThemeIcon('package');
    }
}
exports.TargetTreeItem = TargetTreeItem;
class SourceTreeItem extends vscode.TreeItem {
    constructor(sourcePath, targetId, sourceDir, isActive) {
        super((0, utils_1.relativeDisplayPath)(sourcePath, sourceDir), vscode.TreeItemCollapsibleState.None);
        this.sourcePath = sourcePath;
        this.targetId = targetId;
        this.sourceDir = sourceDir;
        this.description = isActive ? 'Current' : undefined;
        this.tooltip = sourcePath;
        this.contextValue = 'source';
        this.iconPath = new vscode.ThemeIcon(isActive ? 'circle-filled' : 'file-code');
        this.command = {
            command: 'vscode.open',
            title: 'Open Source File',
            arguments: [vscode.Uri.file(sourcePath)],
        };
    }
}
exports.SourceTreeItem = SourceTreeItem;
class TargetTreeDataProvider {
    constructor() {
        this.onDidChangeTreeDataEmitter = new vscode.EventEmitter();
        this.targets = [];
        this.filteredTargets = [];
        this.sourceDir = '';
        this.filterText = '';
        this.targetItems = new Map();
        this.sourceItems = new Map();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
    }
    setTargets(targets, sourceDir, activeSourcePath) {
        this.targets = targets;
        this.sourceDir = sourceDir;
        this.activeSourcePath = activeSourcePath;
        this.rebuildCache();
        this.onDidChangeTreeDataEmitter.fire();
    }
    setActiveSourcePath(activeSourcePath) {
        this.activeSourcePath = activeSourcePath;
        this.rebuildCache();
        this.onDidChangeTreeDataEmitter.fire();
    }
    setFilterText(filterText) {
        this.filterText = filterText.trim();
        this.rebuildCache();
        this.onDidChangeTreeDataEmitter.fire();
    }
    getFilterText() {
        return this.filterText;
    }
    getVisibleTargetCount() {
        return this.filteredTargets.length;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return Promise.resolve(this.filteredTargets.map((target) => this.targetItems.get(target.id)));
        }
        if (element instanceof TargetTreeItem) {
            const visibleSourceFiles = this.getVisibleSourceFiles(element.target);
            return Promise.resolve(visibleSourceFiles.map((sourcePath) => this.sourceItems.get(this.createSourceKey(element.target.id, sourcePath))));
        }
        return Promise.resolve([]);
    }
    getParent(element) {
        if (element instanceof SourceTreeItem) {
            return this.targetItems.get(element.targetId);
        }
        return undefined;
    }
    findTargetItem(targetId) {
        return this.targetItems.get(targetId);
    }
    findFirstSourceItemByFile(filePath) {
        const normalizedFilePath = (0, utils_1.normalizePath)(filePath);
        for (const target of this.targets) {
            for (const sourcePath of target.sourceFiles) {
                if ((0, utils_1.normalizePath)(sourcePath) === normalizedFilePath) {
                    return this.sourceItems.get(this.createSourceKey(target.id, sourcePath));
                }
            }
        }
        return undefined;
    }
    rebuildCache() {
        this.filteredTargets = this.targets.filter((target) => this.matchesTarget(target));
        this.targetItems = new Map(this.filteredTargets.map((target) => [target.id, new TargetTreeItem(target)]));
        this.sourceItems = new Map();
        const activeSource = this.activeSourcePath ? (0, utils_1.normalizePath)(this.activeSourcePath) : undefined;
        for (const target of this.filteredTargets) {
            for (const sourcePath of this.getVisibleSourceFiles(target)) {
                const key = this.createSourceKey(target.id, sourcePath);
                const isActive = !!activeSource && (0, utils_1.normalizePath)(sourcePath) === activeSource;
                this.sourceItems.set(key, new SourceTreeItem(sourcePath, target.id, this.sourceDir, isActive));
            }
        }
    }
    matchesTarget(target) {
        const query = this.filterText.toLowerCase();
        if (!query) {
            return true;
        }
        return this.matchesTargetName(target, query) || target.sourceFiles.some((sourcePath) => this.matchesSourcePath(sourcePath, query));
    }
    getVisibleSourceFiles(target) {
        const query = this.filterText.toLowerCase();
        if (!query || this.matchesTargetName(target, query)) {
            return target.sourceFiles;
        }
        return target.sourceFiles.filter((sourcePath) => this.matchesSourcePath(sourcePath, query));
    }
    matchesTargetName(target, query) {
        return target.displayName.toLowerCase().includes(query)
            || target.name.toLowerCase().includes(query)
            || path.basename(target.guessedExecutablePath).toLowerCase().includes(query);
    }
    matchesSourcePath(sourcePath, query) {
        return path.basename(sourcePath).toLowerCase().includes(query)
            || (0, utils_1.relativeDisplayPath)(sourcePath, this.sourceDir).toLowerCase().includes(query);
    }
    createSourceKey(targetId, sourcePath) {
        return `${targetId}::${(0, utils_1.normalizePath)(sourcePath)}`;
    }
}
exports.TargetTreeDataProvider = TargetTreeDataProvider;
//# sourceMappingURL=targetTreeDataProvider.js.map