'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface ElectronWindow extends Window {
  electron?: {
    minimizeWindow: () => void;
    closeWindow: () => void;
  };
}

// 创建自定义CSS属性类型
interface DraggableStyles extends React.CSSProperties {
  WebkitAppRegion?: 'drag' | 'no-drag';
}

const Header: React.FC = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // 检查是否在 Electron 环境中运行
    if (typeof window !== 'undefined' && (window as ElectronWindow).electron) {
      setIsElectron(true);
    }
  }, []);

  // 定义样式
  const headerStyle: DraggableStyles = {
    cursor: isElectron ? 'move' : 'default',
    WebkitAppRegion: isElectron ? 'drag' : 'no-drag'
  };

  const titleStyle: DraggableStyles = {
    WebkitAppRegion: isElectron ? 'drag' : 'no-drag'
  };

  const navStyle: DraggableStyles = {
    WebkitAppRegion: isElectron ? 'no-drag' : undefined
  };

  return (
    <header 
      className="bg-white shadow-sm py-3" 
      style={headerStyle}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link 
          href="/" 
          className="text-xl md:text-2xl font-bold text-redbook"
          style={titleStyle}
        >
          RedNote <span className="text-xs md:text-sm">小红书文案生成器</span>
        </Link>
        <nav style={navStyle}>
          <ul className="flex space-x-3 md:space-x-6">
            <li>
              <Link href="/about" className="text-sm md:text-base text-text-medium hover:text-redbook">
                功能介绍
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm md:text-base text-text-medium hover:text-redbook">
                联系我们
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 