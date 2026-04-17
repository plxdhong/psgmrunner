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
exports.PresetProvider = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const util_1 = require("util");
const vscode = __importStar(require("vscode"));
const utils_1 = require("../utils");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
class PresetProvider {
    constructor(workspaceRoot, logger) {
        this.workspaceRoot = workspaceRoot;
        this.logger = logger;
    }
    async loadPresets() {
        const [listedConfigurePresets, listedBuildPresets, loadedPresetFiles] = await Promise.all([
            this.listPresetsFromCMake('configure'),
            this.listPresetsFromCMake('build'),
            this.loadPresetFiles(),
        ]);
        const configurePresets = loadedPresetFiles.configurePresets;
        const buildPresets = loadedPresetFiles.buildPresets;
        if (configurePresets.length === 0 && listedConfigurePresets.length === 0) {
            return [];
        }
        const presetMap = new Map(configurePresets.filter((preset) => preset.name).map((preset) => [preset.name, preset]));
        const buildPresetMap = new Map(buildPresets.filter((preset) => preset.name).map((preset) => [preset.name, preset]));
        const listedConfigurePresetMap = new Map(listedConfigurePresets.map((preset) => [preset.name, preset]));
        const listedBuildPresetNames = new Set(listedBuildPresets.map((preset) => preset.name));
        const resolvePreset = (presetName, trail) => {
            const preset = presetMap.get(presetName);
            if (!preset) {
                return {};
            }
            if (trail.has(presetName)) {
                return preset;
            }
            const nextTrail = new Set(trail);
            nextTrail.add(presetName);
            const inheritedPresets = Array.isArray(preset.inherits)
                ? preset.inherits
                : preset.inherits
                    ? [preset.inherits]
                    : [];
            const mergedParent = inheritedPresets.reduce((accumulator, inheritedName) => {
                return { ...accumulator, ...resolvePreset(inheritedName, nextTrail) };
            }, {});
            return { ...mergedParent, ...preset };
        };
        const resolveBuildPreset = (presetName, trail) => {
            const preset = buildPresetMap.get(presetName);
            if (!preset) {
                return {};
            }
            if (trail.has(presetName)) {
                return preset;
            }
            const nextTrail = new Set(trail);
            nextTrail.add(presetName);
            const inheritedPresets = Array.isArray(preset.inherits)
                ? preset.inherits
                : preset.inherits
                    ? [preset.inherits]
                    : [];
            const mergedParent = inheritedPresets.reduce((accumulator, inheritedName) => {
                return { ...accumulator, ...resolveBuildPreset(inheritedName, nextTrail) };
            }, {});
            return { ...mergedParent, ...preset };
        };
        const resolvedBuildPresets = buildPresets
            .filter((preset) => preset.name)
            .map((preset) => resolveBuildPreset(preset.name, new Set()))
            .filter((preset) => {
            if (!preset.name || !preset.configurePreset) {
                return false;
            }
            if (listedBuildPresetNames.size > 0) {
                return listedBuildPresetNames.has(preset.name);
            }
            return !preset.hidden;
        });
        const buildPresetByConfigurePreset = new Map();
        for (const buildPreset of resolvedBuildPresets) {
            const configurePresetName = buildPreset.configurePreset;
            const existing = buildPresetByConfigurePreset.get(configurePresetName);
            if (!existing || buildPreset.name === configurePresetName) {
                buildPresetByConfigurePreset.set(configurePresetName, buildPreset);
            }
        }
        const presets = configurePresets
            .filter((preset) => preset.name)
            .map((preset) => resolvePreset(preset.name, new Set()))
            .filter((preset) => {
            if (!preset.name || !preset.binaryDir) {
                return false;
            }
            if (listedConfigurePresetMap.size > 0) {
                return listedConfigurePresetMap.has(preset.name);
            }
            return !preset.hidden;
        })
            .map((preset) => {
            const matchingBuildPreset = buildPresetByConfigurePreset.get(preset.name);
            const variables = {
                presetName: preset.name,
                sourceDir: this.workspaceRoot,
                workspaceFolder: this.workspaceRoot,
            };
            const resolvedBinaryDir = (0, utils_1.replaceTemplateVariables)(preset.binaryDir, variables);
            return {
                name: preset.name,
                displayName: listedConfigurePresetMap.get(preset.name)?.displayName ?? preset.displayName ?? preset.name,
                binaryDir: (0, utils_1.toAbsolutePath)(resolvedBinaryDir, this.workspaceRoot),
                sourceDir: this.workspaceRoot,
                buildPresetName: matchingBuildPreset?.name,
                configuration: matchingBuildPreset?.configuration,
                description: preset.description,
            };
        })
            .sort((left, right) => left.displayName.localeCompare(right.displayName));
        // this.logger.info(`Loaded ${presets.length} visible configure preset(s)`);
        return presets;
    }
    async listPresetsFromCMake(type) {
        try {
            const { stdout } = await execFileAsync('cmake', ['-S', this.workspaceRoot, `--list-presets=${type}`], {
                cwd: this.workspaceRoot,
                windowsHide: true,
            });
            const presets = [];
            for (const line of stdout.split(/\r?\n/).map((item) => item.trim())) {
                const match = line.match(/^"([^"]+)"(?:\s+-\s+(.+))?$/);
                if (!match) {
                    continue;
                }
                presets.push({
                    name: match[1],
                    displayName: match[2],
                });
            }
            return presets;
        }
        catch (error) {
            this.logger.warn(`Unable to query ${type} presets from CMake: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    async loadPresetFiles() {
        const configurePresets = [];
        const buildPresets = [];
        const visitedFiles = new Set();
        for (const rootFileName of ['CMakePresets.json', 'CMakeUserPresets.json']) {
            const rootFilePath = path.join(this.workspaceRoot, rootFileName);
            const presetFile = await this.readPresetFile(rootFilePath, visitedFiles);
            if (!presetFile) {
                continue;
            }
            configurePresets.push(...presetFile.configurePresets);
            buildPresets.push(...presetFile.buildPresets);
        }
        return { configurePresets, buildPresets };
    }
    async readPresetFile(filePath, visitedFiles) {
        const normalizedFilePath = path.normalize(filePath);
        if (visitedFiles.has(normalizedFilePath)) {
            return {
                configurePresets: [],
                buildPresets: [],
            };
        }
        const uri = vscode.Uri.file(filePath);
        let rawPresetFile;
        try {
            const content = await vscode.workspace.fs.readFile(uri);
            rawPresetFile = (0, utils_1.parseJsonBuffer)(content).value;
        }
        catch (error) {
            if (error?.code !== 'FileNotFound') {
                this.logger.warn(`Unable to read presets file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
            }
            return undefined;
        }
        visitedFiles.add(normalizedFilePath);
        const configurePresets = [];
        const buildPresets = [];
        const includes = Array.isArray(rawPresetFile.include) ? rawPresetFile.include : [];
        for (const includePath of includes) {
            const nestedFilePath = path.isAbsolute(includePath)
                ? includePath
                : path.resolve(path.dirname(filePath), includePath);
            const nestedPresetFile = await this.readPresetFile(nestedFilePath, visitedFiles);
            if (!nestedPresetFile) {
                continue;
            }
            configurePresets.push(...nestedPresetFile.configurePresets);
            buildPresets.push(...nestedPresetFile.buildPresets);
        }
        configurePresets.push(...(Array.isArray(rawPresetFile.configurePresets) ? rawPresetFile.configurePresets : []));
        buildPresets.push(...(Array.isArray(rawPresetFile.buildPresets) ? rawPresetFile.buildPresets : []));
        return { configurePresets, buildPresets };
    }
}
exports.PresetProvider = PresetProvider;
//# sourceMappingURL=presetProvider.js.map