import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface DownloadAllButtonProps {
  results: Array<{
    id: string;
    content: string;
    imageUrl: string;
  }>;
  isDisabled: boolean;
}

const DownloadAllButton: React.FC<DownloadAllButtonProps> = ({ results, isDisabled }) => {
  const handleDownloadAll = async () => {
    try {
      // 创建新的 ZIP 实例
      const zip = new JSZip();
      
      // 添加内容的文本文件
      const contentTxt = results.map(item => `# 小红书文案 ${item.id}\n\n${item.content}\n\n---\n\n`).join('');
      zip.file('小红书文案内容.txt', contentTxt);
      
      // 添加图片
      const imgFolder = zip.folder('images');
      
      // 准备所有图片获取的 Promise
      const imgPromises = results.map(async (result) => {
        const response = await fetch(result.imageUrl);
        const blob = await response.blob();
        return { id: result.id, blob };
      });
      
      // 等待所有图片获取完成
      const images = await Promise.all(imgPromises);
      
      // 添加图片到 ZIP
      images.forEach(img => {
        if (imgFolder) {
          imgFolder.file(`rednote-${img.id}.png`, img.blob);
        }
      });
      
      // 生成 ZIP 并下载
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, '小红书文案和图片.zip');
      
    } catch (error) {
      console.error('创建下载包时出错:', error);
    }
  };

  return (
    <button
      onClick={handleDownloadAll}
      disabled={isDisabled || results.length === 0}
      className="btn-secondary py-3 text-lg w-full flex justify-center items-center"
    >
      <span>一键下载所有结果</span>
    </button>
  );
};

export default DownloadAllButton; 