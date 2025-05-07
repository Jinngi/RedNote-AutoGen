'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaWeibo, FaWeixin, FaGithub } from 'react-icons/fa';

interface ElectronWindow extends Window {
  electron?: {
    minimizeWindow: () => void;
    closeWindow: () => void;
  };
}

const Footer: React.FC = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // 检查是否在 Electron 环境中运行
    if (typeof window !== 'undefined' && (window as ElectronWindow).electron) {
      setIsElectron(true);
    }
  }, []);

  // 根据是否为Electron环境选择容器类名
  const containerClassName = isElectron
    ? "w-full px-4"
    : "container mx-auto";

  return (
    <footer className="bg-light-gray py-3 md:py-4">
      <div className={containerClassName}>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">
            <p className="text-sm text-text-medium">&copy; {new Date().getFullYear()} RedNote 小红书文案生成器. 保留所有权利</p>
          </div>
          <div className="flex space-x-3 md:space-x-4 items-center">
            <Link href="/privacy" className="text-sm text-text-medium hover:text-redbook">
              隐私政策
            </Link>
            <Link href="/terms" className="text-sm text-text-medium hover:text-redbook">
              使用条款
            </Link>
            <div className="flex space-x-2 md:space-x-3 ml-2 md:ml-4">
              <a href="#" className="text-text-medium hover:text-redbook">
                <FaWeibo size={18} />
              </a>
              <a href="#" className="text-text-medium hover:text-redbook">
                <FaWeixin size={18} />
              </a>
              <a href="https://github.com" className="text-text-medium hover:text-redbook">
                <FaGithub size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 