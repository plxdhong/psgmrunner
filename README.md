# psgmrunner

`psgmrunner` 是一个面向 CMake C++ 项目的 VS Code 扩展，核心目标是把“选择 Preset -> 配置项目 -> 找到可执行目标 -> 构建 -> 运行/调试”这条链路放进一个更直接的侧边栏工作流里。

它适合已经使用 `CMakePresets.json` 管理构建目录、并希望按“当前源码文件对应哪个可执行程序”来工作的人群。

详细实现与架构说明已移动到 `doc/architecture.zh-CN.md`。

## 插件能做什么

- 自动识别工作区中的 `CMakePresets.json`
- 在侧边栏展示可用的 configure preset
- 基于 CMake File API 识别可执行目标及其源码文件
- 建立“源文件 -> 可执行目标”的映射关系
- 根据当前编辑器中的源码文件自动定位对应目标
- 直接在 VS Code 中执行 preset configure、target build、run、debug
- 支持目标过滤，方便项目较大时快速定位目标
- 支持通过 `settings.json` 自定义 configure / build / run 命令模板

## 适用场景

### 1. 使用 CMake Presets 管理多套构建目录
例如 `debug`、`release`、`clang-debug`、`msvc-debug` 等配置。你可以先选中一个 preset，再基于该 preset 的构建目录查看目标和执行任务。

### 2. 一个仓库里有多个可执行程序
当项目里有多个 demo、tool、test 或主程序时，插件会在 **Targets** 视图中列出可执行目标，减少手动查找构建命令的成本。

### 3. 希望从当前源码快速反查归属目标
打开 `main.cpp`、`app.cpp`、`demo.cpp` 之类文件时，插件会尝试自动定位对应 target，适合多目标工程日常开发。

### 4. 希望保留 VS Code 原生任务与调试体验
插件使用 VS Code 的 Tasks API 和调试接口，不强依赖额外的工作流面板，便于融入现有开发习惯。

## 工作方式

插件围绕两块侧边栏视图工作：

- `Presets`：展示并选择 CMake configure preset
- `Targets`：展示当前 preset 下识别到的可执行目标及其源文件

典型流程如下：

1. 打开包含 `CMakePresets.json` 的工作区
2. 在 `Presets` 视图选择一个 preset
3. 触发 `Build` 对 preset 先执行 configure
4. 插件读取构建目录中的元数据并刷新 `Targets`
5. 在 `Targets` 视图对目标执行 Build / Run / Debug
6. 打开某个源码文件时，插件自动尝试在树中定位它所属的 target

## 使用前提

使用前请确认项目环境满足以下条件：

1. 工作区根目录包含有效的 `CMakePresets.json`
2. 项目本身是可正常 configure / build 的 CMake C++ 工程
3. VS Code 中可用 C/C++ 调试环境
   - Windows 通常为 `cppvsdbg`
   - Linux / macOS 通常为 `cppdbg`
4. 需要先成功执行一次 configure，让构建目录中生成 CMake File API reply 数据

默认情况下，插件在执行 preset configure 时会主动写入 `.cmake/api/v1/query/codemodel-v2` 查询文件，并附带 `-DCMAKE_EXPORT_COMPILE_COMMANDS=ON`。当前目标发现和源码映射主要依赖 File API；开启 `compile_commands.json` 仍然是推荐做法，但不再是当前实现的必要条件。

## 安装方式

### 通过 VSIX 安装

1. 在 VS Code 中打开命令面板
2. 执行 `Extensions: Install from VSIX...`
3. 选择仓库中的 `psgmrunner-0.0.1.vsix`

### 通过命令行安装

```bash
code --install-extension psgmrunner-0.0.1.vsix
```

## 快速上手

### 1. 打开项目

打开包含 `CMakePresets.json` 的 CMake 项目目录。插件会自动激活。

### 2. 选择 Preset

在活动栏打开 `psgmrunner`，进入 **Presets** 视图并选择一个 configure preset。

### 3. 配置并发现目标

对选中的 preset 执行 `Build`。插件会先运行 configure，然后从以下位置读取元数据：

```text
<binaryDir>/CMakeCache.txt
<binaryDir>/.cmake/api/v1/reply/
```

如果 configure 成功，**Targets** 视图中会显示该 preset 下识别到的可执行目标。

### 4. 构建目标

在 **Targets** 视图中对目标执行 `Build`，或先打开某个已建立映射的源码文件，再触发构建命令。

### 5. 运行或调试

你可以直接对目标执行以下操作；`Run` 和 `Debug` 在默认流程下都会先触发一次构建：

- `Run`
- `Debug`

### 6. 过滤目标

如果目标较多，可在 **Targets** 视图中使用 `Filter`，按目标名或源码文件名快速筛选。

## 常见使用命令

插件当前提供以下主要命令：

- `psgmrunner.refresh`：刷新 preset 和 target 信息
- `psgmrunner.selectPreset`：选择 configure preset
- `psgmrunner.buildPreset`：对 preset 执行 configure / 刷新目标
- `psgmrunner.buildTarget`：构建目标
- `psgmrunner.runTarget`：运行目标
- `psgmrunner.debugTarget`：调试目标
- `psgmrunner.filterTargets`：筛选目标
- `psgmrunner.clearTargetFilter`：清除筛选条件

## 配置说明

插件通过 VS Code `settings.json` 提供以下配置项：

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `psgmrunner.tasks.presetConfigureCommandTemplate` | `cmake --preset ${preset} -DCMAKE_EXPORT_COMPILE_COMMANDS=ON` | 配置 preset 时执行的命令模板 |
| `psgmrunner.tasks.buildCommandTemplate` | `cmake --build ${buildDir}${configurationArgument} --target ${target}` | 构建目标时执行的命令模板 |
| `psgmrunner.tasks.runCommandTemplate` | `${executableCommand}` | 运行目标时执行的命令模板 |
| `psgmrunner.tasks.clearTerminalBeforeRun` | `true` | 构建或运行前是否清理共享终端 |

### 支持的变量

#### configure 模板支持

- `${buildDir}`
- `${preset}`
- `${sourceDir}`

#### build / run 模板支持

- `${buildDir}`
- `${preset}`
- `${target}`
- `${sourceDir}`
- `${buildPreset}`
- `${configuration}`
- `${configurationArgument}`
- `${buildPresetArgument}`
- `${executablePath}`
- `${quotedExecutablePath}`
- `${executableCommand}`

### 配置示例

```json
{
  "psgmrunner.tasks.presetConfigureCommandTemplate": "cmake --preset ${preset} -DCMAKE_EXPORT_COMPILE_COMMANDS=ON",
  "psgmrunner.tasks.buildCommandTemplate": "cmake --build ${buildDir}${configurationArgument} --target ${target}",
  "psgmrunner.tasks.runCommandTemplate": "${executableCommand}",
  "psgmrunner.tasks.clearTerminalBeforeRun": true
}
```

### Windows 自定义运行命令示例

如果你希望显式指定运行方式，可以按需覆盖为 PowerShell 风格命令：

```json
{
  "psgmrunner.tasks.runCommandTemplate": "& ${quotedExecutablePath}"
}
```

## 推荐的 CMake Presets 写法

建议在 preset 中显式启用 `CMAKE_EXPORT_COMPILE_COMMANDS`，这样有助于与其他 C++ 工具链保持兼容；但就当前插件实现而言，目标发现和源码映射主要依赖 CMake File API：

```json
{
  "version": 3,
  "configurePresets": [
    {
      "name": "debug",
      "binaryDir": "${sourceDir}/build/debug",
      "cacheVariables": {
        "CMAKE_EXPORT_COMPILE_COMMANDS": true
      }
    }
  ]
}
```

## 已知限制

- 目标发现和源码映射依赖 CMake File API reply；如果项目尚未成功 configure，则不会显示目标列表
- 当前主要聚焦 configure 后的 target discovery、build、run、debug，不负责完整的 CMake 项目管理
- 调试配置为运行时动态创建，默认依赖系统中已安装可用的 C/C++ 调试后端

## 开发与打包

### 本地开发

```bash
npm install
npm run compile
```

在 VS Code 中打开本仓库后按 `F5`，会启动 Extension Development Host 进行调试。

### 打包 VSIX

```bash
npx @vscode/vsce package --allow-missing-repository
```

## 文档

- 使用说明：`README.md`
- 架构说明：`doc/architecture.zh-CN.md`

## License

项目当前使用 `MIT` 许可证，具体以 `package.json` 中声明为准。
