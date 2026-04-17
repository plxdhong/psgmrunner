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
describe('models', () => {
    describe('PresetInfo', () => {
        it('should create valid preset info object', () => {
            const preset = {
                name: 'debug',
                displayName: 'Debug',
                binaryDir: '/build/debug',
                sourceDir: '/src',
                buildPresetName: 'debug',
                configuration: 'Debug',
                description: 'Debug build',
            };
            assert.strictEqual(preset.name, 'debug');
            assert.strictEqual(preset.binaryDir, '/build/debug');
        });
        it('should allow optional fields to be undefined', () => {
            const preset = {
                name: 'debug',
                displayName: 'Debug',
                binaryDir: '/build/debug',
                sourceDir: '/src',
            };
            assert.strictEqual(preset.buildPresetName, undefined);
            assert.strictEqual(preset.description, undefined);
        });
    });
    describe('TargetInfo', () => {
        it('should create valid target info object', () => {
            const target = {
                id: 'myapp',
                name: 'myapp',
                displayName: 'My App',
                configuration: 'Debug',
                sourceFiles: ['/src/main.cpp'],
                guessedExecutablePath: '/build/myapp',
            };
            assert.strictEqual(target.name, 'myapp');
            assert.strictEqual(target.sourceFiles.length, 1);
        });
    });
    describe('MappingIndex', () => {
        it('should create valid mapping index', () => {
            const targetsMap = new Map();
            const sourceMap = new Map();
            const index = {
                targets: targetsMap,
                sourceToTargets: sourceMap,
            };
            assert.ok(index.targets instanceof Map);
            assert.ok(index.sourceToTargets instanceof Map);
        });
    });
    describe('TaskVariables', () => {
        it('should create valid task variables', () => {
            const vars = {
                buildDir: '/build',
                preset: 'debug',
                target: 'myapp',
                sourceDir: '/src',
                buildPreset: 'debug',
                configuration: 'Debug',
                configurationArgument: ' --config Debug',
                executablePath: '/build/myapp',
                quotedExecutablePath: '"/build/myapp"',
                executableCommand: '"/build/myapp"',
                buildPresetArgument: ' --preset debug',
            };
            assert.strictEqual(vars.buildDir, '/build');
            assert.strictEqual(vars.configurationArgument, ' --config Debug');
        });
        it('should allow optional fields to be undefined', () => {
            const vars = {
                buildDir: '/build',
                preset: 'debug',
                target: 'myapp',
                sourceDir: '/src',
                configurationArgument: '',
                quotedExecutablePath: '"/build/myapp"',
                executableCommand: '"/build/myapp"',
                buildPresetArgument: '',
            };
            assert.strictEqual(vars.executablePath, undefined);
            assert.strictEqual(vars.buildPreset, undefined);
        });
    });
    describe('TaskExecutionResult', () => {
        it('should create result with exit code', () => {
            const result = { exitCode: 0 };
            assert.strictEqual(result.exitCode, 0);
        });
        it('should allow undefined exit code', () => {
            const result = { exitCode: undefined };
            assert.strictEqual(result.exitCode, undefined);
        });
    });
});
//# sourceMappingURL=models.test.js.map