'use client';

import React, { useEffect, useState } from 'react';
import { IoClose, IoRemove } from 'react-icons/io5';

interface ElectronWindow extends Window {
  electron?: {
    minimizeWindow: () => void;
    closeWindow: () => void;
  };
}

const WindowControls: React.FC = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // 改进的Electron环境检测方式
    const checkElectron = () => {
      const electronWindow = window as ElectronWindow;
      if (typeof window !== 'undefined' && electronWindow.electron) {
        setIsElectron(true);
        console.log('Electron 环境已检测到');
      }
    };
    
    // 立即检查
    checkElectron();
    
    // 设置一个延迟检查，以防Electron API注入有延迟
    const timeoutId = setTimeout(checkElectron, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const handleMinimize = () => {
    try {
      const electronWindow = window as ElectronWindow;
      if (electronWindow.electron?.minimizeWindow) {
        console.log('执行最小化');
        electronWindow.electron.minimizeWindow();
      } else {
        console.error('最小化函数不存在');
      }
    } catch (error) {
      console.error('最小化窗口时出错:', error);
    }
  };

  const handleClose = () => {
    try {
      const electronWindow = window as ElectronWindow;
      if (electronWindow.electron?.closeWindow) {
        console.log('执行关闭');
        electronWindow.electron.closeWindow();
      } else {
        console.error('关闭函数不存在');
      }
    } catch (error) {
      console.error('关闭窗口时出错:', error);
    }
  };

  // 如果不是在 Electron 环境中，不显示这些控制按钮
  if (!isElectron) return null;

  return (
    <div className="window-controls fixed top-0 right-0 flex z-50 p-2">
      <button 
        onClick={handleMinimize}
        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded"
        title="最小化"
      >
        <IoRemove size={18} />
      </button>
      <button 
        onClick={handleClose}
        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-red-500 hover:text-white rounded ml-1"
        title="关闭"
      >
        <IoClose size={18} />
      </button>
    </div>
  );
};

export default WindowControls; 