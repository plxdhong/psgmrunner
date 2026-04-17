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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const presetProvider_1 = require("../src/services/presetProvider");
const mappingEngine_1 = require("../src/services/mappingEngine");
const outputLogger_1 = require("../src/services/outputLogger");
describe('integration', () => {
    const testWorkspaceDir = path.join(__dirname, 'fixtures', 'workspace');
    const mockOutputChannel = {
        name: 'test',
        append: () => { },
        appendLine: () => { },
        clear: () => { },
        show: () => { },
        hide: () => { },
        dispose: () => { },
    };
    const logger = new outputLogger_1.OutputLogger(mockOutputChannel);
    before(() => {
        const fixturesDir = path.join(__dirname, 'fixtures');
        if (!fs.existsSync(fixturesDir)) {
            fs.mkdirSync(fixturesDir, { recursive: true });
        }
        const testDir = path.join(fixturesDir, 'workspace');
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        const cmakePresets = {
            version: 3,
            configurePresets: [
                {
                    name: 'debug',
                    displayName: 'Debug',
                    description: 'Debug build',
                    binaryDir: '${sourceDir}/build/debug',
                },
                {
                    name: 'release',
                    displayName: 'Release',
                    hidden: true,
                    binaryDir: '${sourceDir}/build/release',
                },
            ],
        };
        fs.writeFileSync(path.join(testDir, 'CMakePresets.json'), JSON.stringify(cmakePresets, null, 2));
    });
    describe('PresetProvider', () => {
        it('should load presets from CMakePresets.json', async () => {
            const provider = new presetProvider_1.PresetProvider(testWorkspaceDir, logger);
            const presets = await provider.loadPresets();
            assert.ok(presets.length > 0);
            const debugPreset = presets.find((p) => p.name === 'debug');
            assert.ok(debugPreset);
            assert.strictEqual(debugPreset.displayName, 'Debug');
        });
        it('should resolve binary directory with template variables', async () => {
            const provider = new presetProvider_1.PresetProvider(testWorkspaceDir, logger);
            const presets = await provider.loadPresets();
            const debugPreset = presets.find((p) => p.name === 'debug');
            assert.ok(debugPreset);
            assert.ok(debugPreset.binaryDir.includes('build'));
        });
        it('should filter hidden presets by default', async () => {
            const provider = new presetProvider_1.PresetProvider(testWorkspaceDir, logger);
            const presets = await provider.loadPresets();
            const hiddenPreset = presets.find((p) => p.name === 'release');
            assert.strictEqual(hiddenPreset, undefined);
        });
    });
    describe('MappingEngine', () => {
        it('should create empty index when no build directory exists', async () => {
            const engine = new mappingEngine_1.MappingEngine(logger);
            const preset = {
                name: 'debug',
                displayName: 'Debug',
                binaryDir: '/nonexistent/build/debug',
                sourceDir: testWorkspaceDir,
            };
            await engine.rebuild(preset);
            const targets = engine.getTargets();
            assert.strictEqual(targets.length, 0);
        });
        it('should return empty array for non-existent source mapping', async () => {
            const engine = new mappingEngine_1.MappingEngine(logger);
            const targets = engine.findTargetsBySource('/nonexistent/file.cpp');
            assert.strictEqual(targets.length, 0);
        });
    });
});
//# sourceMappingURL=integration.test.js.map