# RedNote - 小红书文案图片生成工具

这是一个基于Next.js和React的小红书文案和图片生成工具，用户可以输入上下文内容、主题和文案描述，自动生成符合小红书风格的文案和图片。

## 功能特点

- 输入上下文内容、主题和文案描述，一键生成小红书文案和配图
- 美观的界面展示生成结果
- 支持单个下载和批量下载所有结果
- 响应式设计，适配各种设备屏幕

## 技术栈

- Next.js: React框架
- React: 前端UI库
- TypeScript: 类型安全的JavaScript
- Tailwind CSS: 样式框架
- JSZip & FileSaver: 用于生成和下载ZIP文件
- html-to-image: 用于将HTML转换为图片

## 项目设置与运行

### 环境要求

- Node.js 16.0.0 或更高版本
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
# 或
yarn
# 或
pnpm install
```

### 设置环境变量

创建一个`.env.local`文件在项目根目录，并添加以下内容：

```
NEXT_PUBLIC_API_KEY=your_api_key_here
NEXT_PUBLIC_API_BASE_URL=your_api_base_url_here
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

服务器将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

### 启动生产服务器

```bash
npm run start
# 或
yarn start
# 或
pnpm start
```

## 项目结构

```
RedNote-AutoGen/
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── app/             # Next.js App Router
│   ├── components/      # 可复用组件
│   ├── lib/             # 库函数
│   ├── styles/          # 全局样式
│   └── utils/           # 工具函数
├── .env                 # 环境变量（开发用）
├── .env.local           # 本地环境变量（不提交到版本控制）
├── package.json         # 项目依赖
├── tailwind.config.js   # Tailwind CSS 配置
└── tsconfig.json        # TypeScript 配置
```

## 许可证

MIT
