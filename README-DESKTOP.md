# RedNote AutoGen 桌面应用打包说明

本文档说明如何将 RedNote AutoGen 打包成桌面应用程序。

## 前提条件

确保你已安装以下软件：

- Node.js (推荐 v16 或更高版本)
- npm (通常随 Node.js 一起安装)
- Windows 上需要 Visual Studio Build Tools (用于某些本地模块的编译)

## 打包步骤

### 1. 安装依赖

首先确保你已安装所有依赖：

```bash
npm install
```

### 2. 打包成桌面应用

运行以下命令之一来打包应用：

```bash
# 生成安装包（推荐）
npm run desktop-app

# 生成便携版(不需要安装)
npm run make-portable

# 仅打包（不生成安装程序）
npm run pack
```

### 3. 打包结果

打包完成后，你可以在 `dist` 目录下找到生成的文件：

- `RedNote AutoGen Setup.exe`: 安装程序
- `RedNote AutoGen.exe`: 便携版程序（如果使用 make-portable）

## 注意事项

### Windows 系统权限问题

- 应用使用 `asInvoker` 权限级别运行，这意味着它将以启动它的用户权限运行
- 如果需要更高权限，可以在 `electron-builder.json` 中修改 `requestedExecutionLevel` 为 `highestAvailable` 或 `requireAdministrator`
- 安装程序默认不要求管理员权限，可以选择安装到用户目录

### 窗口样式

- 应用使用无边框窗口（`frame: false`），没有标准的系统菜单栏
- 可以在 `electron/main.js` 中修改 `frame` 属性来启用标准窗口

### 开发与调试

- 使用 `npm run electron-dev` 在开发模式下运行 Electron 应用（加载本地开发服务器）
- 使用 `npm run electron-prod` 在生产模式下测试 Electron 应用（加载已构建的静态文件）

### 自定义图标

- 将你的应用图标放在 `resources` 目录下，命名为 `icon.ico`（Windows）
- 如需更改图标路径，请修改 `electron-builder.json` 文件 