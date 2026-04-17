import * as assert from 'assert';
import { PresetInfo, TargetInfo, MappingIndex, TaskVariables, TaskExecutionResult } from '../src/models';

describe('models', () => {
  describe('PresetInfo', () => {
    it('should create valid preset info object', () => {
      const preset: PresetInfo = {
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
      const preset: PresetInfo = {
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
      const target: TargetInfo = {
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
      const targetsMap = new Map<string, TargetInfo>();
      const sourceMap = new Map<string, string[]>();
      const index: MappingIndex = {
        targets: targetsMap,
        sourceToTargets: sourceMap,
      };
      assert.ok(index.targets instanceof Map);
      assert.ok(index.sourceToTargets instanceof Map);
    });
  });

  describe('TaskVariables', () => {
    it('should create valid task variables', () => {
      const vars: TaskVariables = {
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
      const vars: TaskVariables = {
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
      const result: TaskExecutionResult = { exitCode: 0 };
      assert.strictEqual(result.exitCode, 0);
    });

    it('should allow undefined exit code', () => {
      const result: TaskExecutionResult = { exitCode: undefined };
      assert.strictEqual(result.exitCode, undefined);
    });
  });
});