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
const vscode = __importStar(require("vscode"));
const outputLogger_1 = require("../src/services/outputLogger");
const configurationManager_1 = require("../src/services/configurationManager");
describe('services', () => {
    describe('OutputLogger', () => {
        it('should create output logger', () => {
            const channel = {
                name: 'test',
                append: () => { },
                appendLine: (line) => {
                    // captured
                },
                clear: () => { },
                show: () => { },
                hide: () => { },
                dispose: () => { },
            };
            const logger = new outputLogger_1.OutputLogger(channel);
            assert.ok(logger);
        });
        it('should call appendLine for info level', () => {
            let lastLine = '';
            const channel = {
                name: 'test',
                append: () => { },
                appendLine: (line) => { lastLine = line; },
                clear: () => { },
                show: () => { },
                hide: () => { },
                dispose: () => { },
            };
            const logger = new outputLogger_1.OutputLogger(channel);
            logger.info('test message');
            assert.ok(lastLine.includes('[INFO]'));
            assert.ok(lastLine.includes('test message'));
        });
        it('should call appendLine for warn level', () => {
            let lastLine = '';
            const channel = {
                name: 'test',
                append: () => { },
                appendLine: (line) => {
                    lastLine = line;
                },
                clear: () => { },
                show: () => { },
                hide: () => { },
                dispose: () => { },
            };
            const logger = new outputLogger_1.OutputLogger(channel);
            logger.warn('warning message');
            assert.ok(lastLine.includes('[WARN]'));
        });
        it('should call appendLine for error level', () => {
            let lastLine = '';
            const channel = {
                name: 'test',
                append: () => { },
                appendLine: (line) => {
                    lastLine = line;
                },
                clear: () => { },
                show: () => { },
                hide: () => { },
                dispose: () => { },
            };
            const logger = new outputLogger_1.OutputLogger(channel);
            logger.error('error message');
            assert.ok(lastLine.includes('[ERROR]'));
        });
    });
    describe('ConfigurationManager', () => {
        const createMockConfig = (settings) => {
            const config = new Map(Object.entries(settings));
            return {
                get: (key, defaultValue) => {
                    const value = config.get(key);
                    return (value !== undefined ? value : defaultValue);
                },
                has: (_key) => config.size > 0,
                update: async () => { },
                inspect: () => ({ key: '', defaultValue: undefined, globalValue: undefined, workspaceValue: undefined }),
            };
        };
        it('should get preset configure command with variables', () => {
            const mockConfig = createMockConfig({
                'tasks.presetConfigureCommandTemplate': 'cmake --preset ${preset} -DCMAKE_EXPORT_COMPILE_COMMANDS=ON',
            });
            // Mock vscode.workspace.getConfiguration
            const originalGetConfig = vscode.workspace.getConfiguration;
            vscode.workspace.getConfiguration = () => mockConfig;
            const manager = new configurationManager_1.ConfigurationManager();
            const result = manager.getPresetConfigureCommand({
                buildDir: '/build/debug',
                preset: 'debug',
                sourceDir: '/src',
            });
            assert.strictEqual(result, 'cmake --preset debug -DCMAKE_EXPORT_COMPILE_COMMANDS=ON');
            vscode.workspace.getConfiguration = originalGetConfig;
        });
        it('should get build command with all variables', () => {
            const mockConfig = createMockConfig({
                'tasks.buildCommandTemplate': 'cmake --build ${buildDir}${configurationArgument} --target ${target}',
            });
            const originalGetConfig = vscode.workspace.getConfiguration;
            vscode.workspace.getConfiguration = () => mockConfig;
            const manager = new configurationManager_1.ConfigurationManager();
            const result = manager.getBuildCommand({
                buildDir: '/build/debug',
                preset: 'debug',
                target: 'myapp',
                sourceDir: '/src',
                buildPreset: 'debug',
                configuration: 'Debug',
                configurationArgument: ' --config Debug',
                executablePath: '/build/debug/myapp',
                quotedExecutablePath: '"/build/debug/myapp"',
                executableCommand: '"/build/debug/myapp"',
                buildPresetArgument: ' --preset debug',
            });
            assert.strictEqual(result, 'cmake --build /build/debug --config Debug --target myapp');
            vscode.workspace.getConfiguration = originalGetConfig;
        });
        it('should get run command', () => {
            const mockConfig = createMockConfig({
                'tasks.runCommandTemplate': '${executableCommand}',
            });
            const originalGetConfig = vscode.workspace.getConfiguration;
            vscode.workspace.getConfiguration = () => mockConfig;
            const manager = new configurationManager_1.ConfigurationManager();
            const result = manager.getRunCommand({
                buildDir: '/build/debug',
                preset: 'debug',
                target: 'myapp',
                sourceDir: '/src',
                configurationArgument: '',
                quotedExecutablePath: '"/build/debug/myapp"',
                executableCommand: '"/build/debug/myapp"',
                buildPresetArgument: '',
            });
            assert.strictEqual(result, '"/build/debug/myapp"');
            vscode.workspace.getConfiguration = originalGetConfig;
        });
        it('should check clear terminal setting', () => {
            const mockConfig = createMockConfig({
                'tasks.clearTerminalBeforeRun': true,
            });
            const originalGetConfig = vscode.workspace.getConfiguration;
            vscode.workspace.getConfiguration = () => mockConfig;
            const manager = new configurationManager_1.ConfigurationManager();
            const result = manager.shouldClearTerminalBeforeRun();
            assert.strictEqual(result, true);
            vscode.workspace.getConfiguration = originalGetConfig;
        });
        it('should resolve debug program from run command', () => {
            const mockConfig = createMockConfig({
                'tasks.runCommandTemplate': '${executableCommand}',
            });
            const originalGetConfig = vscode.workspace.getConfiguration;
            vscode.workspace.getConfiguration = () => mockConfig;
            const manager = new configurationManager_1.ConfigurationManager();
            const result = manager.resolveDebugProgram({
                buildDir: '/build/debug',
                preset: 'debug',
                target: 'myapp',
                sourceDir: '/src',
                configurationArgument: '',
                executablePath: '/build/debug/myapp',
                quotedExecutablePath: '"/build/debug/myapp"',
                executableCommand: '"/build/debug/myapp"',
                buildPresetArgument: '',
            });
            assert.strictEqual(result, '/build/debug/myapp');
            vscode.workspace.getConfiguration = originalGetConfig;
        });
    });
});
//# sourceMappingURL=services.test.js.map