import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';

interface DownloadAllButtonProps {
  results: Array<{
    id: string;
    content: string;
    imageUrl: string;
  }>;
  isDisabled: boolean;
  cardStyle: string;
  colorTheme: string;
  cardRatio: string;
}

const DownloadAllButton: React.FC<DownloadAllButtonProps> = ({ 
  results, 
  isDisabled, 
  cardStyle, 
  colorTheme, 
  cardRatio 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAll = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
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

      // 创建卡片转换的配置选项
      const options = {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
        onCloneNode: (node: HTMLElement) => {
          if (node instanceof HTMLImageElement) {
            // 对于blob URL，尝试将其在onCloneNode中预处理
            if (node.src.startsWith('blob:')) {
              // 这里不做处理，因为我们会在前面预处理
            }
            
            // 处理加载失败的图片
            if (node.complete && node.naturalWidth === 0) {
              node.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFMEUwRTAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5RTlFOUUiPuWbvueJh+aXoOazlei0qOmHjTwvdGV4dD48L3N2Zz4=';
            }
          }
          return node;
        },
        fetchRequestInit: {
          mode: 'cors' as RequestMode,
          cache: 'no-cache' as RequestCache,
        }
      };

      // 准备所有卡片的 Promise - 使用前端html-to-image库
      const cardPromises = results.map(async (result) => {
        try {
          // 查找当前卡片元素
          const cardElement = document.querySelector(`[data-card-id="${result.id}"]`)?.querySelector('div.bg-white');
          
          if (!cardElement) {
            console.error(`未找到卡片元素: ${result.id}`);
            return null;
          }
          
          // 如果是blob URL，预处理图片
          if (result.imageUrl && result.imageUrl.startsWith('blob:')) {
            console.log(`检测到Blob URL (${result.id})，预先将图片转换为数据URL`);
            try {
              // 创建一个新的Image元素来加载图片
              const img = new Image();
              await new Promise<void>((resolve, reject) => {
                img.onload = () => {
                  // 创建canvas将图片转为dataURL
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    
                    // 找到所有引用这个blob URL的图片并替换
                    const images = cardElement.querySelectorAll('img');
                    images.forEach(imgEl => {
                      if (imgEl.src === result.imageUrl) {
                        imgEl.src = canvas.toDataURL('image/png');
                      }
                    });
                    resolve();
                  } else {
                    reject(new Error('无法创建canvas上下文'));
                  }
                };
                
                img.onerror = () => {
                  reject(new Error('图片加载失败'));
                };
                
                img.crossOrigin = 'anonymous';
                img.src = result.imageUrl;
              });
            } catch (error) {
              console.error(`预处理Blob URL图片失败: ${result.id}`, error);
              // 继续尝试，即使预处理失败
            }
          }
          
          // 确保所有图片都已加载
          await new Promise<void>((resolve) => {
            const images = cardElement.querySelectorAll('img');
            let loadedCount = 0;
            const totalImages = images.length;
            
            if (totalImages === 0) {
              resolve();
              return;
            }
            
            const checkIfAllImagesLoaded = () => {
              loadedCount++;
              if (loadedCount === totalImages) {
                resolve();
              }
            };
            
            images.forEach(img => {
              if (img.complete) {
                checkIfAllImagesLoaded();
              } else {
                img.addEventListener('load', checkIfAllImagesLoaded);
                img.addEventListener('error', () => {
                  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFMEUwRTAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5RTlFOUUiPuWbvueJh+aXoOazlei0qOmHjTwvdGV4dD48L3N2Zz4=';
                  checkIfAllImagesLoaded();
                });
              }
            });
          });
          
          // 将卡片DOM转换为PNG图片
          const dataUrl = await toPng(cardElement as HTMLElement, options);
          
          // 将dataURL转换为Blob
          const blobData = await fetch(dataUrl).then(res => res.blob());
          
          return { id: result.id, blob: blobData };
        } catch (error) {
          console.error(`生成卡片 ${result.id} 时出错:`, error);
          return null;
        }
      });

      // 等待所有卡片生成完成
      const cards = await Promise.all(cardPromises);
      
      // 添加卡片到 ZIP
      const cardsFolder = zip.folder('cards');
      cards.forEach(card => {
        if (card && cardsFolder) {
          cardsFolder.file(`rednote-card-${card.id}.png`, card.blob);
        }
      });
      
      // 生成 ZIP 并下载
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, '小红书文案和图片.zip');
      
    } catch (error) {
      console.error('创建下载包时出错:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadAll}
      disabled={isDisabled || results.length === 0 || isDownloading}
      className="btn-secondary py-3 text-lg w-full flex justify-center items-center"
    >
      <span>{isDownloading ? '正在打包下载中...' : '一键下载所有结果'}</span>
    </button>
  );
};

export default DownloadAllButton; 