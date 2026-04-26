# React + Vite + CRXJS

此模板帮助您快速使用 React、TypeScript 和 Vite 开发 Chrome 扩展。它包含 CRXJS Vite 插件，可实现无缝的 Chrome 扩展开发。

## 特性

- React with TypeScript
- TypeScript 支持
- Vite 构建工具
- CRXJS Vite 插件集成
- Chrome 扩展清单配置

## 快速开始

1. 安装依赖：

```bash
npm install
```

2. 启动开发服务器：

```bash
npm run dev
```

3. 打开 Chrome 并导航到 `chrome://extensions/`，启用"开发者模式"，然后从 `dist` 目录加载未打包的扩展。

4. 构建生产版本：

```bash
npm run build
```

## 项目结构

- `src/popup/` - 扩展弹出 UI
- `src/content/` - 内容脚本
- `manifest.config.ts` - Chrome 扩展清单配置

## 文档

- [React 文档](https://reactjs.org/)
- [Vite 文档](https://vitejs.dev/)
- [CRXJS 文档](https://crxjs.dev/vite-plugin)

## Chrome 扩展开发说明

- 使用 `manifest.config.ts` 配置您的扩展
- CRXJS 插件自动处理清单生成
- 内容脚本应放置在 `src/content/` 中
- 弹出 UI 应放置在 `src/popup/` 中
