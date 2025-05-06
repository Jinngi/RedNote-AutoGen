# 快速入门指南

本指南将帮助你设置和运行RedNote小红书文案图片生成工具。

## 安装步骤

1. **克隆仓库**

```bash
git clone <repository-url>
cd RedNote-AutoGen
```

2. **安装依赖**

使用npm:
```bash
npm install
```

或者使用yarn:
```bash
yarn install
```

3. **设置环境变量**

创建一个`.env.local`文件在项目根目录，添加以下内容:

```
NEXT_PUBLIC_API_KEY=your_api_key_here
NEXT_PUBLIC_API_BASE_URL=https://api.openai.com/v1
```

请将`your_api_key_here`替换为你的实际API密钥。

## 启动项目

1. **开发模式**

```bash
npm run dev
```

或

```bash
yarn dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 运行。

2. **构建并启动生产版本**

```bash
npm run build
npm run start
```

或

```bash
yarn build
yarn start
```

## 项目结构说明

- **src/app**: 包含Next.js应用的页面
- **src/components**: 包含所有React组件
- **src/utils**: 包含工具函数，如API调用
- **src/styles**: 包含全局样式文件

## 常见问题解决

### 依赖安装失败

如果在安装依赖时遇到问题，尝试清除npm缓存后重新安装:

```bash
npm cache clean --force
npm install
```

### 启动时出现TypeScript错误

项目使用TypeScript进行类型检查。如果遇到类型相关错误，可能是因为缺少类型定义。尝试安装对应的类型定义包:

```bash
npm install @types/package-name --save-dev
```

### API请求失败

确保您已经正确设置了`.env.local`文件，并且API密钥是有效的。

## 后续开发

目前，项目使用模拟数据进行演示。要连接到实际API，请修改`src/utils/api.ts`文件中的`generateContent`函数，取消注释实际API调用的代码。

## 联系和支持

如有任何问题或需要支持，请发送邮件至[example@example.com](mailto:example@example.com)。 