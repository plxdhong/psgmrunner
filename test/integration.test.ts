import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { PresetProvider } from '../src/services/presetProvider';
import { MappingEngine } from '../src/services/mappingEngine';
import { OutputLogger } from '../src/services/outputLogger';

describe('integration', () => {
  const testWorkspaceDir = path.join(__dirname, 'fixtures', 'workspace');
  const mockOutputChannel = {
    name: 'test',
    append: () => {},
    appendLine: () => {},
    clear: () => {},
    show: () => {},
    hide: () => {},
    dispose: () => {},
  } as unknown as vscode.OutputChannel;

  const logger = new OutputLogger(mockOutputChannel);

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
    fs.writeFileSync(
      path.join(testDir, 'CMakePresets.json'),
      JSON.stringify(cmakePresets, null, 2),
    );
  });

  describe('PresetProvider', () => {
    it('should load presets from CMakePresets.json', async () => {
      const provider = new PresetProvider(testWorkspaceDir, logger);
      const presets = await provider.loadPresets();
      assert.ok(presets.length > 0);
      const debugPreset = presets.find((p) => p.name === 'debug');
      assert.ok(debugPreset);
      assert.strictEqual(debugPreset.displayName, 'Debug');
    });

    it('should resolve binary directory with template variables', async () => {
      const provider = new PresetProvider(testWorkspaceDir, logger);
      const presets = await provider.loadPresets();
      const debugPreset = presets.find((p) => p.name === 'debug');
      assert.ok(debugPreset);
      assert.ok(debugPreset.binaryDir.includes('build'));
    });

    it('should filter hidden presets by default', async () => {
      const provider = new PresetProvider(testWorkspaceDir, logger);
      const presets = await provider.loadPresets();
      const hiddenPreset = presets.find((p) => p.name === 'release');
      assert.strictEqual(hiddenPreset, undefined);
    });
  });

  describe('MappingEngine', () => {
    it('should create empty index when no build directory exists', async () => {
      const engine = new MappingEngine(logger);
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
      const engine = new MappingEngine(logger);
      const targets = engine.findTargetsBySource('/nonexistent/file.cpp');
      assert.strictEqual(targets.length, 0);
    });
  });
});