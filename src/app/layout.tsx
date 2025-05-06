import type { Metadata } from 'next';
import '@/styles/globals.css';

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
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
} 