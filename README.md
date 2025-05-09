# RedNote-AutoGen - 小红书文案图片生成工具 | RedNote-AutoGen - Xiaohongshu Content and Image Generator

这是一个基于Next.js和React的小红书文案和图片生成工具，用户可以输入上下文内容、主题和文案描述，自动生成符合小红书风格的文案和图片。

*This is a Xiaohongshu (Little Red Book) content and image generation tool based on Next.js and React. Users can input context, theme, and content description to automatically generate Xiaohongshu-style posts and matching images.*

## 功能特点 | Features

- 输入上下文内容、主题和文案描述，一键生成小红书文案和配图
- 美观的界面展示生成结果
- 支持单个下载和批量下载所有结果
- 响应式设计，适配各种设备屏幕

*- Generate Xiaohongshu content and images with one click by inputting context, theme, and content description*
*- Beautiful interface to display generated results*
*- Support for individual downloads and batch downloads of all results*
*- Responsive design that adapts to various device screens*

## 技术栈 | Tech Stack

- Next.js: React框架
- React: 前端UI库
- TypeScript: 类型安全的JavaScript
- Tailwind CSS: 样式框架
- JSZip & FileSaver: 用于生成和下载ZIP文件
- html-to-image: 用于将HTML转换为图片
- OpenAI: 用于生成文案内容
- Unsplash API: 用于获取相关图片

*- Next.js: React framework*
*- React: Frontend UI library*
*- TypeScript: Type-safe JavaScript*
*- Tailwind CSS: Styling framework*
*- JSZip & FileSaver: For generating and downloading ZIP files*
*- html-to-image: For converting HTML to images*
*- OpenAI: For generating content*
*- Unsplash API: For retrieving relevant images*

## 项目设置与运行 | Setup and Run

### 环境要求 | Requirements

- Node.js 16.0.0 或更高版本
- npm 或 yarn 或 pnpm

*- Node.js 16.0.0 or higher*
*- npm or yarn or pnpm*

### 安装依赖 | Install Dependencies

```bash
npm install
# 或 | or
yarn
# 或 | or
pnpm install
```

### 设置环境变量 | Set Environment Variables

创建一个`.env.local`文件在项目根目录，并添加以下内容：

*Create a `.env.local` file in the project root directory and add the following:*

```
NEXT_PUBLIC_API_KEY=your_api_key_here
NEXT_PUBLIC_API_BASE_URL=your_api_base_url_here
OPENAI_API_KEY=your_openai_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

### 启动开发服务器 | Start Development Server

```bash
npm run dev
# 或 | or
yarn dev
# 或 | or
pnpm dev
```

服务器将在 http://localhost:3000 启动

*The server will start at http://localhost:3000*

### 构建生产版本 | Build for Production

```bash
npm run build
# 或 | or
yarn build
# 或 | or
pnpm build
```

### 启动生产服务器 | Start Production Server

```bash
npm run start
# 或 | or
yarn start
# 或 | or
pnpm start
```

### 后台服务 | backserver
#### OneClickFluxGen-极简AI图像生成服务

项目中的AI生图需要启动对应的后台服务，

基于FLUX模型的高性能AI图像生成后台服务，提供REST API接口生成图像。

https://github.com/xdrshjr/OneClickFluxGen

##### 特性

- 基于FastAPI构建的高性能REST API
- 支持FLUX模型及LORA模型加载
- 通过配置文件动态配置服务参数
- 一键启动脚本支持（Windows和Linux/macOS）
- 提供API测试和健康检查
- 支持同步和异步图像生成
- 任务管理与进度追踪

## 项目结构 | Project Structure

```
RedNote-AutoGen-AutoGen/
├── public/              # 静态资源 | Static assets
├── src/                 # 源代码 | Source code
│   ├── app/             # Next.js App Router
│   ├── components/      # 可复用组件 | Reusable components
│   ├── lib/             # 库函数 | Library functions
│   ├── styles/          # 全局样式 | Global styles
│   └── utils/           # 工具函数 | Utility functions
├── .env                 # 环境变量（开发用）| Environment variables (for development)
├── .env.local           # 本地环境变量（不提交到版本控制）| Local environment variables (not committed to version control)
├── package.json         # 项目依赖 | Project dependencies
├── tailwind.config.js   # Tailwind CSS 配置 | Tailwind CSS configuration
└── tsconfig.json        # TypeScript 配置 | TypeScript configuration
```

## 使用指南 | Usage Guide

1. 访问应用首页
2. 在表单中输入：
   - 上下文内容：描述您想要生成内容的背景
   - 主题：指定内容的核心主题
   - 文案描述：详细说明您需要什么样的文案风格
3. 点击"生成"按钮
4. 查看生成的文案和图片结果
5. 您可以单独下载喜欢的结果，或批量下载所有结果

*1. Visit the application homepage*
*2. Input in the form:*
*   - Context: Describe the background of the content you want to generate*
*   - Theme: Specify the core theme of the content*
*   - Content description: Detail what kind of content style you need*
*3. Click the "Generate" button*
*4. View the generated content and image results*
*5. You can download individual results you like or batch download all results*

## 联系我们 | Contact Us

如果您有任何问题、建议或反馈，请随时联系我们：

*If you have any questions, suggestions, or feedback, please feel free to contact us:*

邮箱 | Email: xdrshjr@gmail.com


## 更新日志 | Changelog  

2025-05-08：
1 添加了基于FLUX的AI生图功能支持，对接 OneClickFluxGen-极简AI图像生成服务
2 添加了运行日志可视化面板
3 添加了桌面端一键打包脚本

2025-05-08:  
1. Adds support for AI image generation based on FLUX, integrated with OneClickFluxGen—an ultra-lightweight AI image generation service.  
2. Adds a visual panel for runtime log monitoring.  
3. Adds a one-click packaging script for the desktop version.

## 许可证 | License

MIT
