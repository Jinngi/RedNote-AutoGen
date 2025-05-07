import type { Metadata } from 'next';
import '@/styles/globals.css';
import dynamic from 'next/dynamic';

// 动态导入 WindowControls 组件，避免服务器端渲染报错
const WindowControls = dynamic(() => import('@/components/WindowControls'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'RedNote - 小红书文案图片生成工具',
  description: '一键生成精美的小红书文案和配图，适合营销人员、内容创作者和个人用户',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <WindowControls />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
} 