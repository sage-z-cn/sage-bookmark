# Sage Bookmark — 开发设计文档

> 版本：1.0.0-draft  
> 日期：2026-04-26  
> 状态：设计阶段

---

## 目录

1. [项目概述与目标](#1-项目概述与目标)
2. [功能详细规格说明](#2-功能详细规格说明)
3. [用户界面设计与交互流程](#3-用户界面设计与交互流程)
4. [技术架构与实现方案](#4-技术架构与实现方案)
5. [数据模型设计](#5-数据模型设计)
6. [API 接口设计](#6-api-接口设计)
7. [浏览器兼容性处理方案](#7-浏览器兼容性处理方案)
8. [测试策略与验收标准](#8-测试策略与验收标准)
9. [部署与发布流程](#9-部署与发布流程)
10. [项目进度计划](#10-项目进度计划)

---

## 1. 项目概述与目标

### 1.1 项目简介

Sage Bookmark 是一款基于 Manifest V3 标准开发的浏览器扩展插件，提供类似 Windows 资源管理器的收藏夹管理体验。用户可以在侧边面板（Sidepanel）中以直观的图形界面管理浏览器书签，支持大图标/列表视图切换、拖拽移动、批量操作、框选等高级交互功能。

### 1.2 项目目标

| 目标维度     | 描述                                                        |
| ------------ | ----------------------------------------------------------- |
| **用户体验** | 提供桌面级文件管理器操作体验，降低收藏夹管理的学习成本      |
| **性能**     | 在 10,000+ 书签量级下保持流畅的 UI 响应（操作延迟 < 100ms） |
| **兼容性**   | 完全支持最新版 Microsoft Edge 和 Google Chrome              |
| **可维护性** | 模块化架构，清晰的职责分层，便于后续功能扩展                |
| **视觉品质** | 遵循 Genesis 设计规范，呈现专业、现代的编辑级界面           |

### 1.3 目标用户

- 浏览器重度用户，拥有大量书签需要组织管理
- 开发者和技术人员，习惯资源管理器式的文件操作
- 需要高效整理、搜索、批量操作书签的用户

### 1.4 核心约束

- 必须使用 Manifest V3 标准（Manifest V2 已废弃）
- 不依赖任何后端服务，所有数据通过 Chrome Bookmarks API 操作
- UI 框架限制为 React + Ant Design
- 设计风格遵循 genesis-DESIGN.md 规范

---

## 2. 功能详细规格说明

### 2.1 功能总览

```
Sage Bookmark
├── 侧边面板（Sidepanel）
│   ├── 顶部地址栏
│   │   ├── 导航按钮（后退/前进/刷新）
│   │   ├── 面包屑路径导航
│   │   └── 搜索栏（模糊匹配）
│   ├── 工具栏
│   │   ├── 新建（文件夹/书签）
│   │   ├── 剪切 / 复制 / 粘贴
│   │   ├── 重命名
│   │   ├── 分享
│   │   ├── 删除
│   │   └── 视图切换（大图标/列表）
│   ├── 主体内容区域
│   │   ├── 项目展示（大图标/列表视图）
│   │   ├── 排序（名称/日期/类型）
│   │   ├── 单选 / 多选 / 框选
│   │   ├── 拖拽移动
│   │   └── 双击打开
│   ├── 底部状态栏
│   │   ├── 项目总数统计
│   │   └── 选中数量统计
│   └── Dock 暂存栏（拖拽时自动显示）
│       ├── 暂存项目展示（水平滚动）
│       ├── 从暂存栏拖出取回
│       └── 一键全部取出到当前目录
├── 右键上下文菜单
│   ├── 打开 / 在新标签页打开
│   ├── 剪切 / 复制 / 粘贴
│   ├── 重命名
│   ├── 删除
│   └── 新建子文件夹
└── 浏览器扩展图标
    └── 点击直接打开侧边面板（Sidepanel）
```

### 2.2 功能模块详细说明

#### 2.2.1 导航与地址栏

| 功能项     | 说明                                                              |
| ---------- | ----------------------------------------------------------------- |
| 后退       | 返回上一个浏览的文件夹，维护浏览器历史栈                          |
| 前进       | 前往历史栈中的下一个文件夹                                        |
| 刷新       | 重新加载当前文件夹内容（从 Bookmarks API 获取最新数据）           |
| 面包屑路径 | 显示完整路径，如 `书签栏 > 开发 > 前端框架`，点击任意层级可跳转   |
| 搜索       | 在当前文件夹及其子文件夹中搜索，支持标题和 URL 模糊匹配，实时过滤 |

#### 2.2.2 工具栏操作

| 操作       | 触发方式                   | 说明                             |
| ---------- | -------------------------- | -------------------------------- |
| 新建文件夹 | 点击「新建」下拉菜单       | 在当前文件夹下创建子文件夹       |
| 新建书签   | 点击「新建」下拉菜单       | 弹出表单填写标题和 URL           |
| 剪切       | 工具栏按钮 / 快捷键 Ctrl+X | 标记选中项目为剪切状态           |
| 复制       | 工具栏按钮 / 快捷键 Ctrl+C | 复制选中项目到剪贴板             |
| 粘贴       | 工具栏按钮 / 快捷键 Ctrl+V | 在当前文件夹粘贴剪贴板内容       |
| 重命名     | 工具栏按钮 / F2            | 进入行内编辑模式修改标题         |
| 分享       | 工具栏按钮                 | 复制书签 URL 或导出选中项为 HTML |
| 删除       | 工具栏按钮 / Delete 键     | 删除选中项目，弹出确认对话框     |
| 视图切换   | 工具栏按钮                 | 切换大图标模式 / 详细列表模式    |

#### 2.2.3 内容区域交互

| 交互方式   | 行为                                             |
| ---------- | ------------------------------------------------ |
| 单击       | 选中单个项目（取消其他选中）                     |
| Ctrl+单击  | 切换单个项目的选中状态（多选）                   |
| Shift+单击 | 选中从上次选中项到当前项之间的所有项目（范围选） |
| 框选       | 按住鼠标左键拖动绘制选择框，框内项目全部选中     |
| 双击       | 打开书签（新标签页）或进入文件夹                 |
| 拖拽       | 拖动项目到目标文件夹或位置实现移动               |
| 右键       | 弹出上下文菜单                                   |

#### 2.2.4 排序功能

| 排序维度 | 说明                             |
| -------- | -------------------------------- |
| 名称     | 按标题字母序（支持中文拼音排序） |
| 日期     | 按添加时间排序                   |
| 类型     | 文件夹优先/书签优先              |
| URL      | 按域名排序                       |

排序支持升序/降序切换，排序状态持久化到 localStorage。

#### 2.2.5 Dock 暂存栏

Dock 暂存栏是一个悬浮在面板底部的临时收纳区域，用于解决跨文件夹移动书签的交互痛点。用户在整理书签时，经常需要将书签从 A 文件夹移动到 B 文件夹，而传统方式（剪切→导航→粘贴）操作步骤多、上下文容易丢失。Dock 暂存栏提供了一种更直观的「拾取→暂存→放置」模式。

| 功能项       | 说明                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| 自动显示     | 当用户开始拖拽项目时，Dock 栏从面板底部滑入显示；拖拽结束后若 Dock 栏为空则自动隐藏                   |
| 拖入暂存     | 将项目拖拽到 Dock 栏区域即可暂存，支持同时暂存多个项目，Dock 栏内项目水平排列并支持滚动               |
| 拖出取回     | 从 Dock 栏中拖出暂存项目到内容区域的任意位置，该操作将调用 `chrome.bookmarks.move` 移动书签到当前目录 |
| 一键全部取出 | 点击 Dock 栏右侧「全部取出」按钮，将所有暂存项目批量移动到当前目录，按暂存顺序排列                    |
| 单项移除     | 点击暂存项目上的 × 按钮可将其从 Dock 栏移除（不执行移动操作，仅取消暂存）                             |
| 状态持久化   | Dock 栏中的暂存项目在目录切换、面板关闭/重新打开后仍然保留，存储在 `chrome.storage.session` 中        |
| 视觉反馈     | 拖拽悬停在 Dock 栏上方时高亮边框，提示可以放入；Dock 栏非空时显示暂存数量角标                         |
| 文件夹暂存   | 文件夹也可以暂存到 Dock 栏，取出时以 `chrome.bookmarks.move` 整体移动（包含子内容）                   |

**交互约束：**

- Dock 栏中同一项目不可重复暂存（通过 bookmark ID 去重）
- 暂存的项目如果在外部被删除，Dock 栏中对应项自动移除并显示提示
- Dock 栏最大暂存数量建议限制为 50 项，超出时提示用户先清理

### 2.3 非功能性需求

| 需求     | 指标                                               |
| -------- | -------------------------------------------------- |
| 性能     | 10,000 条书签下页面首次渲染 < 2s，操作响应 < 100ms |
| 内存     | 空闲状态下内存占用 < 50MB                          |
| 数据安全 | 删除操作需二次确认，支持撤销（Undo）               |
| 响应式   | 适配 1024px ~ 2560px 宽度范围                      |
| 国际化   | 预留 i18n 接口，首版支持中文和英文                 |

---

## 3. 用户界面设计与交互流程

### 3.1 整体布局

```
┌──────────────────────────────────────────────────────────┐
│  [←] [→] [↻]  书签栏 > 开发 > 前端框架      [🔍 搜索...]  │  ← 地址栏 (56px)
├──────────────────────────────────────────────────────────┤
│  [+新建] [✂剪切] [📋复制] [📄重命名] [🔗分享] [🗑删除]   │  ← 工具栏 (44px)
│                                        [⊞大图标][≡列表]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   📁 React           📁 Vue            📁 Angular        │
│                      📁 Svelte                            │
│                                                          │
│   📁 Next.js         📁 Nuxt                             │
│                                                          │
│   🔗 React Docs      🔗 Vue Docs       🔗 MDN            │
│                                                          │
│                                                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  12 个项目                                    已选 3 项   │  ← 状态栏 (32px)
├──────────────────────────────────────────────────────────┤
│  📁 React  📁 Vue  🔗 Docs  📁 Next  ...  [全部取出]   │  ← Dock 暂存栏（拖拽时显示）
└──────────────────────────────────────────────────────────┘
```

### 3.2 Genesis 设计变量 → Ant Design Token 映射

根据 genesis-DESIGN.md 规范，将设计变量映射到 Ant Design 5.x 的 Design Token 体系：

#### 颜色映射

```typescript
// 伪代码：Ant Design Theme Token 配置
const genesisTheme = {
  token: {
    colorPrimary: "#6366F1", // Primary — CTAs, active states
    colorPrimaryHover: "#4F46E5", // Primary Hover
    colorBgContainer: "#FFFFFF", // Surface — Cards, panels
    colorBgLayout: "#FAFAFA", // Background — Page background
    colorText: "#0A0A0A", // Text Primary
    colorTextSecondary: "#6B6B6B", // Text Secondary
    colorTextQuaternary: "#9C9C9C", // Neutral — muted text
    colorBorder: "#E8E8EC", // Border
    colorSuccess: "#10B981", // Success
    colorWarning: "#F59E0B", // Warning
    colorError: "#EF4444", // Error
    borderRadius: 6, // Buttons, inputs
    borderRadiusLG: 12, // Cards, panels
    borderRadiusSM: 4, // Tags, chips
    fontSize: 15, // Body text
    fontSizeSM: 13, // Small text
    fontSizeXS: 12, // Caption
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    controlHeight: 38, // Medium button height
    controlHeightSM: 32, // Small button height
    controlHeightLG: 44, // Large button height
    spacingXS: 4, // Base unit
    spacingSM: 8,
    spacingMD: 12,
    spacingLG: 16,
    spacingXL: 24,
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 38,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 6,
      paddingInline: 14,
      paddingBlock: 10,
      fontSize: 14,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Tag: {
      borderRadiusSM: 4,
    },
  },
};
```

#### 字体加载

```
Display/Heading → General Sans (Fontshare) — 用于页面标题、区域标题
Body/UI        → DM Sans (Google Fonts)   — 用于正文、按钮、标签
Code           → JetBrains Mono (Google Fonts) — 用于 URL 显示
```

### 3.3 视图模式设计

#### 大图标模式（Grid View）

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   📁     │  │   📁     │  │   🔗     │  │   🔗     │
│          │  │          │  │          │  │          │
│ React    │  │ Vue      │  │ React Docs│  │ MDN      │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
     96×96px       96×96px       96×96px       96×96px
```

- 图标区域：96×96px，文件夹使用文件夹图标，书签使用网站 favicon（fallback 到通用书签图标）
- 图标下方显示标题，单行截断，hover 显示完整 tooltip
- Grid 布局：`grid-template-columns: repeat(auto-fill, minmax(120px, 1fr))`
- 间距：20px gap
- 选中状态：indigo 边框 + 浅 indigo 背景

#### 详细列表模式（List View）

```
┌──────┬──────────────────┬──────────────────────┬────────────┬──────────┐
│ [✓]  │ 名称             │ URL                  │ 类型       │ 添加日期 │
├──────┼──────────────────┼──────────────────────┼────────────┼──────────┤
│ [ ]  │ 📁 React         │ —                    │ 文件夹     │ —        │
│ [✓]  │ 🔗 React Docs   │ react.dev            │ 书签       │ 2026-04 │
│ [ ]  │ 🔗 MDN          │ developer.mozilla.org│ 书签       │ 2026-03 │
└──────┴──────────────────┴──────────────────────┴────────────┴──────────┘
```

- 表头可点击排序，显示排序方向指示器
- 行高：48px，hover 背景变化
- URL 列截断显示域名
- 使用 Ant Design `Table` 组件作为基础

### 3.4 关键交互流程

#### 流程 1：浏览文件夹

```
用户双击文件夹
    → 更新当前路径状态 (currentPath)
    → 调用 chrome.bookmarks.getChildren(folderId) 获取子项
    → 压入历史栈
    → 更新面包屑
    → 渲染子项列表
```

#### 流程 2：拖拽移动

```
用户拖起项目
    → 设置 dragData（包含被拖项目 ID 列表）
    → 显示拖拽预览（半透明副本）
    → 拖过目标文件夹时高亮目标
    → 松开
        → 调用 chrome.bookmarks.move(id, {parentId, index})
        → 刷新当前视图
        → 更新状态栏
```

#### 流程 3：批量删除

```
用户选中多个项目 → 点击删除/按 Delete
    → 弹出确认对话框：「确定删除选中的 N 个项目？」
    → 用户确认
        → 逐个调用 chrome.bookmarks.remove/removeTree
        → 从本地状态中移除
        → 显示成功提示
    → 用户取消 → 无操作
```

#### 流程 4：搜索

```
用户在搜索栏输入关键词
    → 防抖 300ms
    → 调用 chrome.bookmarks.search(query)
    → 过滤结果限定在当前路径下（或全局搜索模式）
    → 高亮匹配文本
    → 渲染搜索结果
```

#### 流程 5：框选

```
用户在空白区域按下鼠标左键
    → 记录起始坐标
    → mousemove 时绘制选择矩形（半透明 indigo 覆盖层）
    → 计算矩形与各项目的相交
    → 实时更新选中状态
    → mouseup 结束框选
```

#### 流程 6：Dock 暂存 — 拖入

```
用户拖起内容区的一个或多个项目
    → Dock 栏从底部滑入显示
    → 用户将项目拖到 Dock 栏区域
    → Dock 栏边框高亮（indigo），高度微膨胀
    → 松开鼠标
    → 校验：项目 ID 未在 Dock 列表中重复
    → 将项目信息加入 Dock 暂存状态（useDock.addItem）
    → 同步写入 chrome.storage.session
    → 内容区中已暂存项目显示为半透明
    → 若用户未进行其他拖拽且 Dock 栏非空，Dock 栏保持显示
```

#### 流程 7：Dock 暂存 — 拖出取回

```
用户从 Dock 栏中拖起一个暂存项目
    → 该项目在 Dock 栏中显示为拖拽中状态（半透明）
    → 用户拖到内容区的目标位置
    → 松开鼠标
    → 调用 chrome.bookmarks.move(id, {parentId: currentFolderId, index})
    → 从 Dock 暂存列表中移除该项目
    → 更新 chrome.storage.session
    → 内容区刷新显示
    → 若 Dock 栏为空且无拖拽进行中，Dock 栏自动隐藏
```

#### 流程 8：Dock 暂存 — 一键全部取出

```
用户点击 Dock 栏右侧「全部取出」按钮
    → 校验：当前目录不是任何暂存项目的后代（防止循环移动）
    → 校验失败 → message.warning：「当前目录是暂存文件夹的子目录，无法移入」
    → 校验通过 → 按暂存顺序依次调用 chrome.bookmarks.move
    → 清空 Dock 暂存列表
    → 清除 chrome.storage.session 中的暂存数据
    → 显示 message.success：「已将 N 个项目移动到 [当前目录名]」
    → 内容区刷新显示
    → Dock 栏自动隐藏
```

### 3.5 对话框与反馈设计

| 场景         | 组件             | 内容                                          |
| ------------ | ---------------- | --------------------------------------------- |
| 删除确认     | Modal.confirm    | 「确定删除选中的 N 个项目？此操作不可撤销。」 |
| 新建书签     | Modal + Form     | 标题输入框 + URL 输入框                       |
| 新建文件夹   | Modal + Input    | 文件夹名称输入框                              |
| 重命名       | 行内编辑 / Modal | 当前名称作为默认值                            |
| 操作成功     | message.success  | 顶部轻提示，2s 自动消失                       |
| 操作失败     | message.error    | 顶部红色提示，描述错误原因                    |
| 批量粘贴冲突 | Modal            | 「目标文件夹存在同名项目，是否覆盖？」        |

### 3.6 Dock 暂存栏设计

#### 整体外观

Dock 暂存栏是一个固定在面板底部（状态栏上方）的水平条状区域，采用毛玻璃（glassmorphism）效果与主内容区形成视觉分层。

```
┌──────────────────────────────────────────────────────────────┐
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                    │
│ │📁   │ │🔗   │ │📁   │ │🔗   │ │🔗   │    水平滚动 →      │
│ │React│ │Docs │ │Vue  │ │MDN  │ │Next │                    │
│ │  ×  │ │  ×  │ │  ×  │ │  ×  │ │  ×  │   [📥 全部取出]    │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                    │
└──────────────────────────────────────────────────────────────┘
     ↑ 72px 高度，距底部 44px（状态栏上方）
```

#### 尺寸与样式规格

| 属性       | 值                                                              |
| ---------- | --------------------------------------------------------------- |
| 高度       | 72px（折叠态）/ 80px（拖拽悬停态，微膨胀）                      |
| 水平内边距 | 16px                                                            |
| 垂直内边距 | 8px                                                             |
| 圆角       | 12px（顶部两角），底部紧贴面板边缘无圆角                        |
| 背景       | `rgba(255, 255, 255, 0.85)` + `backdrop-filter: blur(12px)`     |
| 边框       | `1px solid #E8E8EC`（常态）/ `2px solid #6366F1`（拖拽悬停态）  |
| 阴影       | `0 -4px 16px rgba(0, 0, 0, 0.08)`                               |
| 动画       | `transform: translateY(100%)` → `translateY(0)`，300ms ease-out |

#### 暂存项目卡片

每个暂存项目在 Dock 栏中显示为一个紧凑的卡片：

```
┌─────────┐
│    ×    │  ← 右上角移除按钮（hover 时显示）
│   📁    │  ← 图标（32×32px）
│  React  │  ← 标题（单行截断，max-width: 64px）
└─────────┘
   56×56px
```

| 属性     | 值                                                |
| -------- | ------------------------------------------------- |
| 卡片尺寸 | 56×56px                                           |
| 卡片间距 | 8px                                               |
| 图标尺寸 | 32×32px                                           |
| 标题字号 | 11px                                              |
| 背景色   | `#F5F5F7`（常态）/ `#EEF2FF`（选中/拖拽中）       |
| 圆角     | 8px                                               |
| 移除按钮 | `×` 图标，12px，`#9C9C9C`，hover 时变为 `#EF4444` |

#### 「全部取出」按钮

位于 Dock 栏右侧，始终可见（当 Dock 栏非空时）：

| 属性     | 值                                                       |
| -------- | -------------------------------------------------------- |
| 按钮样式 | Ant Design `Button` type="primary" size="small"          |
| 图标     | `📥` 或 `ArrowDownToLine` icon                           |
| 文案     | 「全部取出」                                             |
| 位置     | Dock 栏右侧，垂直居中，与暂存项目区域间隔 12px           |
| 禁用态   | 当前目录为 Dock 栏中某项目的子目录时禁用（防止循环移动） |

#### 显示/隐藏逻辑

```
显示条件（满足任一）：
  1. 用户正在拖拽项目（isDragging === true）
  2. Dock 栏中有暂存项目（dockItems.length > 0）

隐藏条件（同时满足）：
  1. 用户未在拖拽
  2. Dock 栏为空

动画：
  - 显示：从底部滑入，300ms ease-out
  - 隐藏：向底部滑出，200ms ease-in
  - 使用 CSS transition 实现，避免 JS 动画性能开销
```

#### Dock 栏的拖拽交互

```
场景 A — 拖入暂存：
  用户拖起内容区的项目
    → Dock 栏自动显示
    → 拖拽悬停到 Dock 栏区域
    → Dock 栏边框变为 indigo，高度微膨胀至 80px
    → 松开鼠标
    → 项目添加到 Dock 暂存列表
    → 内容区中该项目显示为半透明（表示已暂存/待移动状态）

场景 B — 拖出取回：
  用户从 Dock 栏中拖起暂存项目
    → 该项目跟随鼠标
    → 拖拽到内容区的目标位置
    → 松开鼠标
    → 调用 chrome.bookmarks.move(id, {parentId: currentFolderId, index})
    → 从 Dock 暂存列表中移除该项目
    → 内容区刷新显示

场景 C — 一键全部取出：
  用户点击「全部取出」按钮
    → 校验：当前目录不是任一暂存项目的后代目录
    → 按暂存顺序依次调用 chrome.bookmarks.move
    → 清空 Dock 暂存列表
    → 显示 message.success：「已将 N 个项目移动到当前目录」
    → 内容区刷新显示
```

---

## 4. 技术架构与实现方案

### 4.1 技术栈

| 层级      | 技术选型                       | 版本要求             | 说明                                   |
| --------- | ------------------------------ | -------------------- | -------------------------------------- |
| 运行时    | Chrome Extension Manifest V3   | —                    | 目标平台                               |
| 语言      | TypeScript                     | 5.9.x                | 严格模式，project references 分层配置  |
| UI 框架   | React                          | 19.x                 | 函数式组件 + Hooks                     |
| UI 组件库 | Ant Design                     | 5.x                  | 使用 Design Token 定制主题             |
| 状态管理  | React Context + useReducer     | —                    | 轻量级方案，避免过度引入依赖           |
| 构建      | Vite + @crxjs/vite-plugin      | Vite 8.x / CRXJS 2.x | CRXJS 提供 Chrome 扩展 HMR 支持        |
| 打包      | vite-plugin-zip-pack           | latest               | 构建产物打包为 zip 输出到 release 目录 |
| 样式      | CSS Modules + Ant Design Token | —                    | 作用域隔离 + 主题定制                  |
| 拖拽      | @dnd-kit/core                  | 6.x                  | 现代 React 拖拽库，无依赖冲突          |
| 虚拟滚动  | @tanstack/react-virtual        | 3.x                  | 大量书签场景下的性能保障               |

### 4.2 项目目录结构

```
sage-bookmark/
├── public/
│   └── logo.png                    # 扩展图标（用于所有尺寸）
├── src/
│   ├── assets/                     # 静态资源
│   │   └── *.svg
│   ├── components/                 # 共享 UI 组件
│   │   └── *.tsx
│   ├── sidepanel/                  # 侧边面板页面（主界面入口）
│   │   ├── index.html              # 入口 HTML
│   │   ├── main.tsx                # React 入口
│   │   ├── App.tsx                 # 根组件
│   │   ├── components/             # 面板专用 UI 组件
│   │   │   ├── AddressBar/         # 地址栏组件
│   │   │   │   ├── index.tsx
│   │   │   │   ├── Breadcrumb.tsx
│   │   │   │   └── SearchInput.tsx
│   │   │   ├── Toolbar/            # 工具栏组件
│   │   │   │   ├── index.tsx
│   │   │   │   └── ViewSwitch.tsx
│   │   │   ├── ContentArea/        # 内容区域
│   │   │   │   ├── index.tsx
│   │   │   │   ├── GridView.tsx    # 大图标模式
│   │   │   │   ├── ListView.tsx    # 列表模式
│   │   │   │   ├── BookmarkItem.tsx
│   │   │   │   ├── FolderItem.tsx
│   │   │   │   ├── SelectionBox.tsx  # 框选组件
│   │   │   │   └── ContextMenu.tsx   # 右键菜单
│   │   │   ├── StatusBar/          # 状态栏
│   │   │   │   └── index.tsx
│   │   │   ├── DockBar/            # Dock 暂存栏
│   │   │   │   ├── index.tsx       # Dock 栏主组件
│   │   │   │   ├── DockItem.tsx    # 暂存项目卡片
│   │   │   │   └── DockDropZone.tsx # 拖拽接收区域
│   │   │   └── Dialogs/            # 对话框集合
│   │   │       ├── CreateBookmark.tsx
│   │   │       ├── CreateFolder.tsx
│   │   │       ├── RenameItem.tsx
│   │   │       └── ConfirmDelete.tsx
│   │   ├── hooks/                  # 自定义 Hooks
│   │   │   ├── useBookmarks.ts     # 书签 CRUD 操作
│   │   │   ├── useNavigation.ts    # 导航历史管理
│   │   │   ├── useSelection.ts     # 选择状态管理
│   │   │   ├── useClipboard.ts     # 剪切板操作
│   │   │   ├── useDragDrop.ts      # 拖拽逻辑
│   │   │   ├── useMarquee.ts       # 框选逻辑
│   │   │   ├── useDock.ts          # Dock 暂存栏状态管理
│   │   │   └── useSort.ts          # 排序逻辑
│   │   ├── context/                # React Context
│   │   │   ├── BookmarkContext.tsx  # 书签状态上下文
│   │   │   └── SettingsContext.tsx  # 设置（视图模式、排序等）
│   │   ├── services/               # 服务层
│   │   │   ├── bookmarkService.ts  # Chrome Bookmarks API 封装
│   │   │   └── faviconService.ts   # Favicon 获取服务
│   │   ├── utils/                  # 工具函数
│   │   │   ├── tree.ts             # 树结构操作
│   │   │   └── search.ts           # 搜索/模糊匹配
│   │   └── styles/                 # 面板样式
│   │       ├── global.css
│   │       └── token.ts            # Genesis → Ant Design Token
│   ├── background/                # Service Worker
│   │   └── main.ts                # 侧边栏行为配置（openPanelOnActionClick）
│   ├── content/                    # Content Script
│   │   ├── main.tsx                # 内容脚本注入入口
│   │   └── views/
│   │       ├── App.tsx             # 内容脚本 UI
│   │       └── App.css
│   ├── types/                      # TypeScript 类型定义
│   │   ├── bookmark.ts
│   │   └── global.d.ts
│   └── shared/                     # 共享代码
│       └── constants.ts            # 常量定义
├── manifest.config.ts              # Manifest V3 配置（defineManifest）
├── vite.config.ts                  # Vite + CRXJS 配置（含 @/ 路径别名）
├── tsconfig.json                   # TypeScript 项目引用根配置
├── tsconfig.app.json               # 应用代码 TS 配置（src/）
├── tsconfig.node.json              # 构建脚本 TS 配置（vite.config.ts）
├── package.json
├── pnpm-lock.yaml
└── README.md
```

### 4.3 架构分层

```
┌─────────────────────────────────────────┐
│              UI 组件层 (Components)       │  React 组件，纯展示 + 事件触发
├─────────────────────────────────────────┤
│              Hooks 层 (Hooks)            │  封装交互逻辑（选择、拖拽、导航等）
├─────────────────────────────────────────┤
│           状态管理层 (Context/Store)      │  全局状态：书签树、选择集、视图模式
├─────────────────────────────────────────┤
│            服务层 (Services)             │  Chrome API 封装，业务逻辑
├─────────────────────────────────────────┤
│           Chrome Bookmarks API           │  浏览器原生 API
└─────────────────────────────────────────┘
```

**数据流向**：  
`Chrome API` → `Service` → `Context (state)` → `Hooks` → `Components` → 用户交互 → `Hooks` → `Service` → `Chrome API`

### 4.4 关键技术方案

#### 4.4.1 书签数据加载策略

```
初始化阶段：
  1. chrome.bookmarks.getTree() → 获取完整书签树
  2. 构建内存索引（id → node 映射、parentId → children 映射）
  3. 渲染根节点（书签栏）

浏览阶段：
  - 直接从内存索引读取，无需再次调用 API
  - 监听 chrome.bookmarks.onChanged / onRemoved / onChildrenReordered 事件同步更新索引

性能优化：
  - 大量书签场景使用虚拟滚动（@tanstack/react-virtual）
  - 仅渲染可视区域内的项目
```

#### 4.4.2 状态管理方案

采用 `Context + useReducer` 模式，避免引入 Redux 的额外复杂度：

```typescript
// 伪代码：核心状态结构
interface BookmarkState {
  currentNodeId: string; // 当前浏览的文件夹 ID
  items: BookmarkTreeNode[]; // 当前文件夹的子项列表
  selectedIds: Set<string>; // 选中项 ID 集合
  clipboard: {
    // 剪贴板
    mode: "cut" | "copy";
    items: BookmarkTreeNode[];
  } | null;
  viewMode: "grid" | "list"; // 视图模式
  sortField: "name" | "date" | "type" | "url";
  sortOrder: "asc" | "desc";
  searchQuery: string;
  searchResults: BookmarkTreeNode[] | null; // null 表示非搜索模式
}

type BookmarkAction =
  | { type: "NAVIGATE"; payload: { nodeId: string } }
  | {
      type: "SELECT";
      payload: { ids: string[]; mode: "set" | "toggle" | "range" };
    }
  | { type: "SET_VIEW_MODE"; payload: "grid" | "list" }
  | { type: "SET_SORT"; payload: { field: string; order: "asc" | "desc" } }
  | { type: "SEARCH"; payload: string }
  | { type: "CLIPBOARD_COPY" }
  | { type: "CLIPBOARD_CUT" }
  | { type: "REFRESH_ITEMS"; payload: BookmarkTreeNode[] };
// ...
```

#### 4.4.3 框选实现方案

```
1. 在 ContentArea 组件上监听 mousedown（排除已点击项目的情况）
2. mousedown → 记录起始坐标 (startX, startY)，设置 isSelecting = true
3. mousemove → 如果 isSelecting：
   a. 计算选择矩形 (x, y, width, height)
   b. 渲染半透明矩形覆盖层
   c. 遍历可见项目 DOM 元素，检测与矩形的相交
   d. 相交的项目标记为选中
4. mouseup → 结束框选，清除覆盖层
```

#### 4.4.4 拖拽实现方案

使用 `@dnd-kit` 库：

```
1. 使用 DndContext 包裹内容区域
2. 每个可拖拽项目包装为 useDraggable
3. 文件夹和空白区域作为 drop target（useDroppable）
4. onDragStart → 记录拖拽源，添加视觉效果
5. onDragOver → 高亮目标 drop zone
6. onDragEnd → 调用 chrome.bookmarks.move()，刷新视图
```

#### 4.4.5 撤销机制

```
维护操作历史栈（最多 50 步）：
  每次执行删除/移动/重命名操作前，记录操作的逆向信息
  Ctrl+Z 触发撤销：
    - 删除 → 重新创建（记录原始 parentId, index, title, url）
    - 移动 → 移回原位（记录原始 parentId, index）
    - 重命名 → 恢复原始名称
```

### 4.5 Vite 构建配置要点

```typescript
// 伪代码：vite.config.ts 关键配置
{
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // 路径别名
    },
  },
  plugins: [
    react(),
    crx({ manifest }),                       // CRXJS + defineManifest
    zip({ outDir: 'release', outFileName: `crx-${name}-${version}.zip` }),
  ],
  server: {
    cors: { origin: [/chrome-extension:\/\//] },
  },
}
```

---

## 5. 数据模型设计

### 5.1 Chrome Bookmarks API 原始模型

```typescript
// 浏览器原生类型（chrome.bookmarks.BookmarkTreeNode）
interface NativeBookmarkTreeNode {
  id: string; // 唯一标识
  parentId?: string; // 父节点 ID（根节点无此属性）
  index?: number; // 在父节点中的位置
  url?: string; // URL（文件夹无此属性）
  title: string; // 标题
  dateAdded?: number; // 添加时间（ms 时间戳）
  dateGroupModified?: number; // 最后修改时间
  children?: NativeBookmarkTreeNode[]; // 子节点（仅文件夹）
}
```

### 5.2 应用层扩展模型

```typescript
// 应用内部使用的增强类型
interface AppBookmarkNode {
  id: string;
  parentId: string | null;
  index: number;
  title: string;
  url?: string; // 存在则为书签，不存在则为文件夹
  type: "bookmark" | "folder";
  dateAdded: number;
  dateGroupModified?: number;
  faviconUrl?: string; // favicon 地址（异步加载）
  children?: AppBookmarkNode[];
}

// 用于列表展示的扁平化项目
interface DisplayItem {
  id: string;
  title: string;
  type: "bookmark" | "folder";
  url?: string;
  domain?: string; // 从 URL 提取的域名
  faviconUrl?: string;
  dateAdded: number;
  dateAddedFormatted: string; // 格式化后的日期字符串
}

// 内存索引结构（加速查询）
interface BookmarkIndex {
  nodeMap: Map<string, AppBookmarkNode>; // id → node
  childrenMap: Map<string, AppBookmarkNode[]>; // parentId → sorted children
  rootNodes: AppBookmarkNode[]; // 根节点列表
}
```

### 5.3 应用状态模型

```typescript
// 用户设置（持久化到 chrome.storage.local）
interface UserSettings {
  viewMode: "grid" | "list";
  sortField: "name" | "date" | "type" | "url";
  sortOrder: "asc" | "desc";
  lastVisitedFolderId: string; // 上次浏览的文件夹
  language: "zh-CN" | "en-US";
}

// 操作历史（用于撤销，存储在内存中）
interface HistoryEntry {
  type: "delete" | "move" | "rename" | "create";
  timestamp: number;
  data: UndoData; // 各类型操作的逆向数据
}

// 剪贴板数据
interface ClipboardData {
  mode: "cut" | "copy";
  items: DisplayItem[];
  timestamp: number;
}
```

---

## 6. API 接口设计

### 6.1 Chrome Bookmarks API 封装

所有浏览器 API 调用统一封装在 `bookmarkService.ts` 中，对外提供 Promise 化的异步接口：

| 方法               | 对应 Chrome API                     | 说明               |
| ------------------ | ----------------------------------- | ------------------ |
| `getTree()`        | `chrome.bookmarks.getTree()`        | 获取完整书签树     |
| `get(id)`          | `chrome.bookmarks.get(id)`          | 获取指定节点       |
| `getChildren(id)`  | `chrome.bookmarks.getChildren(id)`  | 获取子节点列表     |
| `create(opts)`     | `chrome.bookmarks.create(opts)`     | 创建书签/文件夹    |
| `move(id, opts)`   | `chrome.bookmarks.move(id, opts)`   | 移动书签           |
| `update(id, opts)` | `chrome.bookmarks.update(id, opts)` | 更新标题/URL       |
| `remove(id)`       | `chrome.bookmarks.remove(id)`       | 删除书签           |
| `removeTree(id)`   | `chrome.bookmarks.removeTree(id)`   | 删除文件夹（递归） |
| `search(query)`    | `chrome.bookmarks.search(query)`    | 搜索书签           |

### 6.2 事件监听

| 事件                                   | 用途                           |
| -------------------------------------- | ------------------------------ |
| `chrome.bookmarks.onCreated`           | 外部创建书签时同步更新内存索引 |
| `chrome.bookmarks.onRemoved`           | 外部删除书签时同步更新         |
| `chrome.bookmarks.onChanged`           | 外部修改书签时同步更新         |
| `chrome.bookmarks.onMoved`             | 外部移动书签时同步更新         |
| `chrome.bookmarks.onChildrenReordered` | 子节点排序变化时同步           |

### 6.3 Service 层接口设计

```typescript
// 伪代码：bookmarkService 核心接口
class BookmarkService {
  // 初始化：加载完整树并构建索引
  async initialize(): Promise<BookmarkIndex>;

  // 导航
  async getChildren(folderId: string): Promise<DisplayItem[]>;

  // CRUD
  async createBookmark(
    parentId: string,
    title: string,
    url: string,
  ): Promise<AppBookmarkNode>;
  async createFolder(parentId: string, title: string): Promise<AppBookmarkNode>;
  async rename(id: string, newTitle: string): Promise<void>;
  async deleteItems(ids: string[]): Promise<void>; // 批量删除
  async moveItems(
    ids: string[],
    targetParentId: string,
    targetIndex?: number,
  ): Promise<void>;

  // 剪贴板
  async pasteItems(
    clipboard: ClipboardData,
    targetParentId: string,
  ): Promise<void>;

  // 搜索
  search(query: string, scopeFolderId?: string): DisplayItem[];

  // Favicon
  getFaviconUrl(url: string): string; // 使用 chrome://favicon/ API

  // 事件监听注册
  onExternalChange(callback: () => void): () => void; // 返回取消监听函数
}
```

### 6.4 chrome.storage API 使用

| 存储区域               | 用途                   | 数据                           |
| ---------------------- | ---------------------- | ------------------------------ |
| `chrome.storage.local` | 用户设置               | UserSettings                   |
| `chrome.storage.sync`  | 跨设备同步设置（可选） | viewMode, sortField, sortOrder |

---

## 7. 浏览器兼容性处理方案

### 7.1 目标浏览器

| 浏览器         | 最低版本 | Manifest V3 支持 | Bookmarks API |
| -------------- | -------- | ---------------- | ------------- |
| Google Chrome  | 88+      | 完全支持         | 完全支持      |
| Microsoft Edge | 88+      | 完全支持         | 完全支持      |

### 7.2 兼容性策略

#### 7.2.1 API 命名空间

```typescript
// 伪代码：兼容层
const browserAPI = (() => {
  if (typeof chrome !== "undefined" && chrome.bookmarks) {
    return chrome; // Chrome / Edge
  }
  if (typeof browser !== "undefined" && browser.bookmarks) {
    return browser; // Firefox（预留，非当前目标）
  }
  throw new Error("Unsupported browser: Bookmarks API not available");
})();
```

#### 7.2.2 Favicon 获取兼容

```
Chrome: chrome://favicon/size/32/{url}
Edge:   chrome://favicon/size/32/{url}  (Edge 基于 Chromium，同样支持)

Fallback 方案：
  1. 优先使用 Google Favicon API: https://www.google.com/s2/favicons?domain={domain}&sz=32
  2. 最终 fallback 使用内置默认图标
```

#### 7.2.3 CSS 兼容性

- 使用 Ant Design 5.x 内置的浏览器兼容处理
- Vite 构建配置 `@vitejs/plugin-legacy` 作为备选（如需支持旧版浏览器）
- 不使用 Firefox 独有的 CSS 特性

#### 7.2.4 Manifest 差异

```typescript
// manifest.config.ts 中的关键配置（使用 defineManifest）
export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: "public/logo.png",
  },
  action: {
    default_icon: { 48: "public/logo.png" },
  },
  background: {
    service_worker: "src/background/main.ts",
  },
  permissions: ["bookmarks", "storage", "sidePanel"],
  side_panel: {
    default_path: "src/sidepanel/index.html",
  },
  content_scripts: [
    {
      js: ["src/content/main.tsx"],
      matches: ["https://*/*"],
    },
  ],
});
```

> **注意**：`sidePanel` 权限用于启用浏览器侧边面板功能。Manifest 配置通过 `defineManifest()` 函数在 `manifest.config.ts` 中声明，CRXJS 插件自动处理 manifest 生成。

### 7.3 已知兼容性风险

| 风险                                   | 影响         | 应对方案                              |
| -------------------------------------- | ------------ | ------------------------------------- |
| `chrome://favicon/` 在未来版本可能受限 | Favicon 显示 | 预备 Google Favicon API 作为 fallback |
| Service Worker 生命周期限制            | 后台事件处理 | Sidepanel 是持久页面，不受影响        |
| Edge 扩展商店发布流程与 Chrome 不同    | 发布         | 分别准备两个商店的发布流程            |

---

## 8. 测试策略与验收标准

### 8.1 测试层级

| 层级     | 工具                           | 覆盖目标                            |
| -------- | ------------------------------ | ----------------------------------- |
| 单元测试 | Vitest                         | Services、Utils、Hooks 的逻辑正确性 |
| 组件测试 | React Testing Library + Vitest | 组件渲染、交互、状态变更            |
| 集成测试 | Playwright (Chromium)          | 完整用户流程（导航、CRUD、拖拽等）  |
| 手动测试 | —                              | 视觉还原度、动画流畅度、Edge 兼容性 |

### 8.2 单元测试覆盖范围

| 模块              | 测试要点                                               |
| ----------------- | ------------------------------------------------------ |
| `bookmarkService` | CRUD 操作正确调用 Chrome API，错误处理                 |
| `tree utils`      | 树遍历、节点查找、路径计算                             |
| `search utils`    | 模糊匹配算法、大小写不敏感、中文匹配                   |
| `useSelection`    | 单选、多选、范围选、框选逻辑                           |
| `useNavigation`   | 前进/后退历史栈操作                                    |
| `useSort`         | 各字段排序、升降序切换                                 |
| `useClipboard`    | 剪切/复制/粘贴状态流转                                 |
| `useDock`         | 暂存/取回/全部取出、去重校验、持久化恢复、循环移动校验 |

### 8.3 集成测试用例

| 编号   | 场景           | 步骤                                           | 预期结果                          |
| ------ | -------------- | ---------------------------------------------- | --------------------------------- |
| E2E-01 | 浏览文件夹     | 双击文件夹 → 查看子项 → 后退                   | 正确显示子项，后退恢复原视图      |
| E2E-02 | 创建书签       | 新建 → 填写标题和 URL → 保存                   | 书签出现在列表中                  |
| E2E-03 | 拖拽移动       | 拖动书签到文件夹                               | 书签移入文件夹                    |
| E2E-04 | 批量删除       | Ctrl+点击选中 3 项 → Delete → 确认             | 3 项被删除                        |
| E2E-05 | 搜索           | 输入关键词 → 查看结果                          | 显示匹配项，高亮关键词            |
| E2E-06 | 视图切换       | 大图标 ↔ 列表模式                              | 布局正确切换，选中状态保持        |
| E2E-07 | 框选           | 在空白区域拖动绘制选择框                       | 框内项目全部选中                  |
| E2E-08 | 重命名         | 选中项目 → F2 → 修改名称 → 回车                | 名称更新成功                      |
| E2E-09 | 排序           | 点击表头「名称」→ 切换升降序                   | 列表按名称正确排序                |
| E2E-10 | 大数据量       | 加载 10,000 条书签 → 浏览/搜索                 | 操作流畅，无卡顿                  |
| E2E-11 | Dock 暂存-拖入 | 拖拽书签到 Dock 栏                             | Dock 栏显示，书签出现在暂存列表   |
| E2E-12 | Dock 暂存-拖出 | 从 Dock 栏拖出项目到新目录                     | 书签移动到新目录，Dock 栏移除该项 |
| E2E-13 | Dock 一键取出  | Dock 栏暂存 3 项 → 切换目录 → 点击「全部取出」 | 3 项全部移动到当前目录            |
| E2E-14 | Dock 持久化    | Dock 栏暂存项目 → 关闭面板 → 重新打开          | 暂存项目仍然存在                  |
| E2E-15 | Dock 防重复    | 将同一书签拖入 Dock 栏两次                     | Dock 栏中仅显示一次，提示已暂存   |

### 8.4 性能验收标准

| 指标                           | 目标值  | 测量方法               |
| ------------------------------ | ------- | ---------------------- |
| 首次加载（1,000 条书签）       | < 1s    | Performance API        |
| 首次加载（10,000 条书签）      | < 2s    | Performance API        |
| 视图切换                       | < 200ms | Performance API        |
| 单次操作响应（移动/删除/创建） | < 100ms | 操作前后时间差         |
| 搜索响应（10,000 条中搜索）    | < 300ms | 搜索触发到结果渲染     |
| 内存占用（10,000 条，空闲态）  | < 50MB  | Chrome DevTools Memory |

### 8.5 视觉验收标准

| 检查项 | 标准                                        |
| ------ | ------------------------------------------- |
| 颜色   | 所有颜色值与 genesis-DESIGN.md 一致         |
| 字体   | 标题使用 General Sans，正文使用 DM Sans     |
| 间距   | 所有间距为 4px 的整数倍                     |
| 圆角   | 按钮/输入框 6px，卡片 12px，标签 4px        |
| 阴影   | 仅 hover/focus 状态使用阴影，静态元素无阴影 |
| 响应式 | 1024px / 1440px / 1920px 三个断点布局正确   |

---

## 9. 部署与发布流程

### 9.1 构建流程

```
开发环境：
  pnpm dev
    → Vite dev server + CRXJS HMR
    → 加载 dist 目录为未打包扩展
    → 修改代码自动热更新

生产构建：
  pnpm build
    → TypeScript 类型检查（tsc -b）
    → Vite 生产构建
    → 输出到 dist/ 目录
    → vite-plugin-zip-pack 生成 release/*.zip 发布包
```

### 9.2 构建产物

```
dist/
├── manifest.json                  # CRXJS 自动生成
├── public/
│   └── logo.png                   # 扩展图标
├── src/
│   ├── sidepanel/
│   │   └── index.html             + JS/CSS bundles
│   ├── background/
│   │   └── main.js                # Service Worker
│   └── content/
│       └── main.js                # Content Script
└── assets/                        # 静态资源（字体、图片等）

release/
└── crx-sage-bookmark-x.x.x.zip   # vite-plugin-zip-pack 生成
```

### 9.3 发布渠道

| 渠道             | 步骤                                                               | 审核周期     |
| ---------------- | ------------------------------------------------------------------ | ------------ |
| Chrome Web Store | 1. 打 zip 包 → 2. 开发者控制台上传 → 3. 填写商店信息 → 4. 提交审核 | 1-3 个工作日 |
| Edge Add-ons     | 1. 打 zip 包 → 2. 合作伙伴中心上传 → 3. 填写商店信息 → 4. 提交审核 | 1-7 个工作日 |

### 9.4 版本管理规范

- 遵循 Semantic Versioning（语义化版本）：`MAJOR.MINOR.PATCH`
- `manifest.config.ts` 中的 `version` 字段自动从 `package.json` 读取，保持同步
- 每次发布创建 Git Tag：`v{version}`

### 9.5 开发者模式安装（测试用）

```
Chrome：
  1. chrome://extensions/
  2. 开启「开发者模式」
  3. 「加载已解压的扩展程序」→ 选择 dist/ 目录

Edge：
  1. edge://extensions/
  2. 开启「开发人员模式」
  3. 「加载解压缩的扩展」→ 选择 dist/ 目录
```

---

## 10. 项目进度计划

### 10.1 阶段划分

| 阶段                | 内容                                                       | 交付物           |
| ------------------- | ---------------------------------------------------------- | ---------------- |
| **P0 — 基础搭建**   | 项目初始化、Manifest 配置、构建配置、Ant Design 主题配置   | 可运行的空壳扩展 |
| **P1 — 核心浏览**   | 地址栏、面包屑导航、内容区域、文件夹浏览、双击进入、状态栏 | 可浏览书签树     |
| **P2 — CRUD 操作**  | 新建（文件夹/书签）、删除（含确认）、重命名、刷新          | 完整的增删改功能 |
| **P3 — 高级交互**   | 多选、框选、拖拽移动、剪切/复制/粘贴、右键菜单             | 资源管理器级交互 |
| **P4 — 视图与排序** | 大图标/列表视图切换、排序功能、视图状态持久化              | 双视图模式       |
| **P5 — 搜索**       | 搜索栏、模糊匹配、搜索结果高亮、搜索范围控制               | 可用搜索功能     |
| **P6 — 性能优化**   | 虚拟滚动、内存索引优化、大数据量测试                       | 性能达标         |
| **P7 — 完善与发布** | 撤销功能、分享功能、Edge 兼容性测试、商店素材准备          | 可发布版本       |

### 10.2 依赖关系

```
P0 ──→ P1 ──→ P2 ──→ P3 ──→ P6
              │              ↑
              └──→ P4 ──→ P5 ┘
                        │
                        └──→ P7
```

- P0 是所有后续阶段的前提
- P1 必须先于 P2（先能浏览才能操作）
- P3 和 P4 可以并行，但都依赖 P2
- P6（性能优化）需要在所有功能就绪后进行
- P7 是最终整合阶段

### 10.3 风险与缓解

| 风险                                              | 可能性 | 影响 | 缓解措施                                                |
| ------------------------------------------------- | ------ | ---- | ------------------------------------------------------- |
| @dnd-kit 与 Ant Design Table 冲突                 | 中     | 高   | P3 阶段初期进行技术验证，备选方案为原生 Drag API        |
| 大量书签下虚拟滚动与拖拽冲突                      | 中     | 中   | P6 阶段专项优化，必要时简化拖拽交互                     |
| Chrome Bookmarks API 异步回调时序问题             | 低     | 高   | Service 层统一使用 Promise 封装，加锁防止并发操作       |
| genesis-DESIGN 设计规范与 Ant Design 默认样式冲突 | 中     | 低   | 使用 Ant Design Token 全量覆盖，必要时 CSS Modules 补丁 |
| CRXJS 与 Vite 最新版兼容性                        | 低     | 高   | 锁定 Vite 版本，关注 CRXJS 更新                         |

---

## 附录

### A. 关键依赖清单

| 包名                              | 用途      | 大小影响                  |
| --------------------------------- | --------- | ------------------------- |
| react / react-dom                 | UI 框架   | ~45KB gzipped             |
| antd                              | UI 组件库 | ~80KB gzipped（按需加载） |
| @dnd-kit/core + @dnd-kit/sortable | 拖拽      | ~15KB gzipped             |
| @tanstack/react-virtual           | 虚拟滚动  | ~3KB gzipped              |

### B. 参考资料

- [Chrome Extensions Manifest V3 文档](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Bookmarks API](https://developer.chrome.com/docs/extensions/reference/bookmarks/)
- [Ant Design 5.x Theme Customization](https://ant.design/docs/react/customize-theme)
- [@dnd-kit 文档](https://docs.dndkit.com/)
- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin)
