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
exports.MappingEngine = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const utils_1 = require("../utils");
class MappingEngine {
    constructor(logger) {
        this.logger = logger;
        this.currentIndex = {
            targets: new Map(),
            sourceToTargets: new Map(),
        };
    }
    async rebuild(preset) {
        // this.logger.info(`Rebuilding source-to-target mapping for preset ${preset.name}`);
        try {
            const fileApiIndex = await this.buildIndexFromFileApi(preset);
            if (fileApiIndex.targets.size > 0) {
                this.logger.info(`Mapping rebuilt from CMake File API with ${fileApiIndex.targets.size} executable target(s)`);
                this.currentIndex = fileApiIndex;
                return;
            }
            this.logger.warn(`CMake File API returned no executable targets for preset ${preset.name}, falling back to compile_commands.json`);
        }
        catch (error) {
            this.logger.warn(`Failed to rebuild mapping from CMake File API for preset ${preset.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    getTargets() {
        return Array.from(this.currentIndex.targets.values()).sort((left, right) => left.displayName.localeCompare(right.displayName));
    }
    findTargetsBySource(sourcePath) {
        const targetIds = this.currentIndex.sourceToTargets.get((0, utils_1.normalizePath)(sourcePath)) ?? [];
        return targetIds
            .map((targetId) => this.currentIndex.targets.get(targetId))
            .filter((target) => !!target);
    }
    async buildIndexFromFileApi(preset) {
        // const cachePath = vscode.Uri.file(path.join(preset.binaryDir, 'CMakeCache.txt'));
        // await vscode.workspace.fs.stat(cachePath);
        const replyDir = vscode.Uri.file(path.join(preset.binaryDir, '.cmake', 'api', 'v1', 'reply'));
        const directoryEntries = await vscode.workspace.fs.readDirectory(replyDir);
        const indexFileNames = directoryEntries
            .filter(([name, type]) => type === vscode.FileType.File && /^index-.*\.json$/i.test(name))
            .map(([name]) => name)
            .sort((left, right) => right.localeCompare(left));
        const latestIndexFileName = indexFileNames[0];
        if (!latestIndexFileName) {
            return this.createEmptyIndex();
        }
        const indexPath = vscode.Uri.file(path.join(replyDir.fsPath, latestIndexFileName));
        const indexContent = await vscode.workspace.fs.readFile(indexPath);
        const parsedIndex = (0, utils_1.parseJsonBuffer)(indexContent).value;
        const replyEntries = Array.isArray(parsedIndex.reply)
            ? parsedIndex.reply
            : Object.values(parsedIndex.reply ?? {});
        const codemodelRef = parsedIndex.objects?.find((entry) => entry.kind === 'codemodel')
            ?? replyEntries.find((entry) => entry.kind === 'codemodel');
        if (!codemodelRef?.jsonFile) {
            return this.createEmptyIndex();
        }
        const codemodelPath = vscode.Uri.file(path.join(replyDir.fsPath, codemodelRef.jsonFile));
        const codemodelContent = await vscode.workspace.fs.readFile(codemodelPath);
        const codemodel = (0, utils_1.parseJsonBuffer)(codemodelContent).value;
        const targets = new Map();
        const sourceToTargets = new Map();
        // this.logger.info(`Reading CMake File API index ${indexPath.fsPath}`);
        // this.logger.info(`Reading CMake File API codemodel ${codemodelPath.fsPath}`);
        const configurations = codemodel.configurations ?? [];
        const hasMultipleConfigurations = configurations.length > 1;
        for (const configuration of configurations) {
            for (const targetRef of configuration.targets ?? []) {
                if (!targetRef.jsonFile) {
                    continue;
                }
                const targetPath = vscode.Uri.file(path.join(replyDir.fsPath, targetRef.jsonFile));
                const targetContent = await vscode.workspace.fs.readFile(targetPath);
                const target = (0, utils_1.parseJsonBuffer)(targetContent).value;
                if (target.type !== 'EXECUTABLE' || !target.name) {
                    continue;
                }
                const executablePath = this.resolveExecutablePath(target, preset);
                const sourceFiles = (0, utils_1.uniqueSorted)((target.sources ?? [])
                    .filter((source) => !!source.path && !source.isGenerated)
                    .map((source) => (0, utils_1.toAbsolutePath)(source.path, preset.sourceDir)));
                const configurationName = configuration.name?.trim();
                const targetDisplayName = hasMultipleConfigurations && configurationName
                    ? `${target.name} [${configurationName}]`
                    : target.name;
                const targetKey = (0, utils_1.normalizePath)(hasMultipleConfigurations && configurationName
                    ? `${target.name}::${configurationName}`
                    : target.name);
                targets.set(targetKey, {
                    id: targetKey,
                    name: target.name,
                    displayName: targetDisplayName,
                    configuration: configurationName,
                    sourceFiles,
                    guessedExecutablePath: executablePath,
                });
                // this.logger.info(`Mapped executable target ${target.name} with ${sourceFiles.length} source file(s)`);
                for (const sourceFile of sourceFiles) {
                    const sourceKey = (0, utils_1.normalizePath)(sourceFile);
                    const mappedTargets = sourceToTargets.get(sourceKey) ?? [];
                    if (!mappedTargets.includes(targetKey)) {
                        mappedTargets.push(targetKey);
                    }
                    sourceToTargets.set(sourceKey, mappedTargets);
                }
            }
        }
        return { targets, sourceToTargets };
    }
    resolveExecutablePath(target, preset) {
        const artifactPath = target.artifacts?.find((artifact) => !!artifact.path)?.path;
        if (artifactPath) {
            return (0, utils_1.toAbsolutePath)(artifactPath, preset.binaryDir);
        }
        return (0, utils_1.getDefaultExecutablePath)(preset.binaryDir, target.name);
    }
    createEmptyIndex() {
        return {
            targets: new Map(),
            sourceToTargets: new Map(),
        };
    }
}
exports.MappingEngine = MappingEngine;
//# sourceMappingURL=mappingEngine.js.map