import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import ImageGenerationProgress from './ImageGenerationProgress';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ResultCardProps {
  id: string;
  content: string;
  imageUrl: string;
  cardStyle: string;
  colorTheme: string;
  cardRatio: string;
  fontFamily: string;
  fontSize: string;
  onDownload: (id: string) => void;
  onContentUpdate?: (id: string, newContent: string) => void;
  isGeneratingImage?: boolean;
  imageGenerationProgress?: number;
  imageGenerationTotalSteps?: number;
  imageGenerationStatus?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ 
  id, 
  content, 
  imageUrl, 
  cardStyle,
  colorTheme,
  cardRatio,
  fontFamily,
  fontSize,
  onDownload,
  onContentUpdate,
  isGeneratingImage = false,
  imageGenerationProgress = 0,
  imageGenerationTotalSteps = 100,
  imageGenerationStatus = 'PENDING'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  // 解析内容，提取标题和正文
  const parseContent = () => {
    const lines = editedContent.split('\n');
    // 第一行作为标题
    const title = lines[0]?.trim() || '小红书文案';
    
    // 将剩余行作为正文（保持原格式，不过滤空行）
    // 这样可以保持Markdown格式的完整性
    const body = lines.slice(1).join('\n');
    
    // 提取标签
    const tagRegex = /#[^\s#]+/g;
    const tags = editedContent.match(tagRegex) || [];
    
    return { title, body, tags };
  };
  
  const { title, body, tags } = parseContent();

  // 获取字体样式
  const getFontFamily = () => {
    switch (fontFamily) {
      case 'sans':
        return 'system-ui, -apple-system, sans-serif';
      case 'serif':
        return 'Georgia, serif';
      case 'mono':
        return 'Menlo, monospace';
      case 'rounded':
        return 'ui-rounded, "Hiragino Maru Gothic ProN", sans-serif';
      case 'cursive':
        return 'cursive';
      case 'fangsong':
        return 'fangsong, 仿宋, FangSong, STFangSong';
      default:
        return 'system-ui, -apple-system, sans-serif';
    }
  };

  // 获取字体大小
  const getFontSize = () => {
    switch (fontSize) {
      case 'xs':
        return { title: '16px', body: '12px', tag: '10px' };
      case 'sm':
        return { title: '18px', body: '14px', tag: '12px' };
      case 'md':
        return { title: '20px', body: '16px', tag: '14px' };
      case 'lg':
        return { title: '22px', body: '18px', tag: '16px' };
      case 'xl':
        return { title: '24px', body: '20px', tag: '18px' };
      case '2xl':
        return { title: '28px', body: '24px', tag: '20px' };
      default:
        return { title: '20px', body: '16px', tag: '14px' };
    }
  };

  // 获取卡片比例样式
  const getRatioStyle = () => {
    // 检查是否是自定义比例格式 (custom:width:height)
    if (cardRatio.startsWith('custom:')) {
      const parts = cardRatio.split(':');
      if (parts.length === 3) {
        const width = parseInt(parts[1]);
        const height = parseInt(parts[2]);
        if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
          return { 
            aspectRatio: `${width}/${height}`,
            width: '100%',
            height: '100%',
            maxHeight: 'none',
            overflow: 'hidden'
          };
        }
      }
    }

    // 根据不同的比例设置不同的样式
    switch (cardRatio) {
      case '1:1':  // 正方形
        return { 
          aspectRatio: '1/1',
          width: '100%',
          height: '100%', // 确保高度填满容器
          maxHeight: 'none',
          overflow: 'hidden' // 防止内容溢出
        };
      case '4:5':  // 竖图
        return { 
          aspectRatio: '4/5',
          width: '100%',
          height: '100%', // 确保高度填满容器
          maxHeight: 'none',
          overflow: 'hidden' // 防止内容溢出
        };
      case '4:6':  // 长图
        return { 
          aspectRatio: '2/3', // 4:6 简化为 2:3
          width: '100%',
          height: '100%', // 确保高度填满容器
          maxHeight: 'none',
          overflow: 'hidden' // 防止内容溢出
        };
      case '3:4':  // 竖版
        return { 
          aspectRatio: '3/4',
          width: '100%',
          height: '100%',
          maxHeight: 'none',
          overflow: 'hidden'
        };
      case '9:16':  // 全面屏
        return { 
          aspectRatio: '9/16',
          width: '100%',
          height: '100%',
          maxHeight: 'none',
          overflow: 'hidden'
        };
      case '16:9':  // 横幅
        return { 
          aspectRatio: '16/9',
          width: '100%',
          height: '100%',
          maxHeight: 'none',
          overflow: 'hidden'
        };
      default:
        return { 
          minHeight: '100px',
          height: '100%', // 确保高度填满容器
          maxHeight: 'none',
          overflow: 'hidden' // 防止内容溢出
        };
    }
  };

  // 获取主题颜色
  const getThemeColors = () => {
    switch (colorTheme) {
      case 'redbook':
        return {
          primary: '#ff2e51',
          secondary: '#ffebee',
          text: '#333333',
          background: '#ffffff',
          accent: '#ff7b97'
        };
      case 'nature':
        return {
          primary: '#4caf50',
          secondary: '#e8f5e9',
          text: '#2e7d32',
          background: '#ffffff',
          accent: '#81c784'
        };
      case 'ocean':
        return {
          primary: '#2196f3',
          secondary: '#e3f2fd',
          text: '#0d47a1',
          background: '#ffffff',
          accent: '#64b5f6'
        };
      case 'sunset':
        return {
          primary: '#ff9800',
          secondary: '#fff3e0',
          text: '#e65100',
          background: '#ffffff',
          accent: '#ffb74d'
        };
      case 'elegant':
        return {
          primary: '#9e9e9e',
          secondary: '#f5f5f5',
          text: '#424242',
          background: '#ffffff',
          accent: '#bdbdbd'
        };
      case 'dark':
        return {
          primary: '#455a64',
          secondary: '#263238',
          text: '#eceff1',
          background: '#37474f',
          accent: '#78909c'
        };
      case 'gradient':
        return {
          primary: '#ff758c',
          secondary: '#ff7eb3',
          text: '#333333',
          background: 'linear-gradient(135deg, #ff758c, #ff7eb3)',
          accent: '#ff4081'
        };
      default:
        return {
          primary: '#ff2e51',
          secondary: '#ffebee',
          text: '#333333',
          background: '#ffffff',
          accent: '#ff7b97'
        };
    }
  };

  const colors = getThemeColors();
  const fontStyleFamily = getFontFamily();
  const fontSizeStyles = getFontSize();

  const handleDownload = async () => {
    if (imageUrl) {
      try {
        console.log('开始下载图片...');
        
        // 将图片 URL 转换为 Blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // 使用 FileSaver 保存图片
        saveAs(blob, `rednote-image-${id}.jpg`);
        
        onDownload(id);
        console.log('图片下载完成');
      } catch (error) {
        console.error('下载图片时出错:', error);
        alert('下载图片失败，请检查控制台获取详细错误信息');
      }
    } else {
      console.error('没有图片可下载');
      alert('没有图片可下载');
    }
  };

  const handleDownloadFullCard = async () => {
    setIsGeneratingCard(true);
    try {
      console.log('开始生成完整卡片...');
      
      if (!cardRef.current) {
        throw new Error('卡片元素不存在');
      }
      
      // 使用html-to-image直接在前端将卡片转换为图片
      console.log('正在将卡片转换为图片...');
      
      // 如果是blob URL，先将图片转换为dataURL以确保可访问性
      if (imageUrl && imageUrl.startsWith('blob:')) {
        console.log('检测到Blob URL，预先将图片转换为数据URL');
        try {
          // 创建一个新的Image元素来加载图片
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              // 图片加载成功
              // 创建canvas将图片转为dataURL
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                
                // 找到所有引用这个blob URL的图片元素并替换
                const images = cardRef.current?.querySelectorAll('img') || [];
                images.forEach(imgEl => {
                  if (imgEl.src === imageUrl) {
                    // 替换为dataURL
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
            
            // 设置crossOrigin以处理可能的跨域问题
            img.crossOrigin = 'anonymous';
            img.src = imageUrl;
          });
        } catch (error) {
          console.error('预处理Blob URL图片失败:', error);
          // 继续尝试，即使预处理失败
        }
      }
      
      // 创建配置选项以确保正确处理图片
      const options = {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true, // 避免缓存问题
        // 处理图片加载失败的情况
        onCloneNode: (node: HTMLElement) => {
          if (node instanceof HTMLImageElement) {
            // 对于blob URL，尝试将其转换为内联数据
            if (node.src.startsWith('blob:')) {
              // 这里我们不直接修改，因为已经在前面预处理过了
            }
            
            // 处理加载失败的图片
            if (node.complete && node.naturalWidth === 0) {
              node.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFMEUwRTAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5RTlFOUUiPuWbvueJh+aXoOazlei0qOmHjTwvdGV4dD48L3N2Zz4=';
            }
          }
          return node;
        },
        // 确保加载外部图片
        fetchRequestInit: {
          mode: 'cors' as RequestMode,
          cache: 'no-cache' as RequestCache,
        }
      };
      
      // 首先确保所有图片都已加载
      await new Promise<void>((resolve) => {
        const images = cardRef.current?.querySelectorAll('img') || [];
        let loadedCount = 0;
        const totalImages = images.length;
        
        // 如果没有图片，直接完成
        if (totalImages === 0) {
          resolve();
          return;
        }
        
        // 检查每个图片是否已加载
        const checkIfAllImagesLoaded = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            resolve();
          }
        };
        
        // 为每个图片添加加载和错误事件
        images.forEach(img => {
          if (img.complete) {
            checkIfAllImagesLoaded();
          } else {
            img.addEventListener('load', checkIfAllImagesLoaded);
            img.addEventListener('error', () => {
              // 处理图片加载失败
              img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFMEUwRTAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5RTlFOUUiPuWbvueJh+aXoOazlei0qOmHjTwvdGV4dD48L3N2Zz4=';
              checkIfAllImagesLoaded();
            });
          }
        });
      });
      
      // 将卡片DOM转换为PNG图片
      const dataUrl = await toPng(cardRef.current, options);
      
      // 将dataURL转换为Blob
      const blobData = await fetch(dataUrl).then(res => res.blob());
      
      // 使用FileSaver保存图片
      saveAs(blobData, `rednote-card-${id}.png`);
      
      onDownload(id);
      console.log('卡片下载完成');
    } catch (error) {
      console.error('下载完整卡片时出错:', error);
      alert('下载卡片失败，请检查控制台获取详细错误信息');
      
      // 如果前端方式失败，可以尝试使用简单的图片下载作为备选方案
      try {
        if (imageUrl) {
          console.log('尝试使用备选方案下载图片...');
          handleDownload();
        }
      } catch (backupError) {
        console.error('备选下载方案也失败:', backupError);
      }
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const saveEditing = () => {
    setIsEditing(false);
    if (onContentUpdate) {
      onContentUpdate(id, editedContent);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedContent(content); // 恢复原始内容
  };

  // 渲染图像内容，包括生成中和已生成的状态
  const renderImageContent = (style: React.CSSProperties = {}) => {
    if (isGeneratingImage) {
      // 显示生成进度组件
      return (
        <div style={style}>
          <ImageGenerationProgress 
            progress={imageGenerationProgress} 
            totalSteps={imageGenerationTotalSteps}
            status={imageGenerationStatus}
          />
        </div>
      );
    } else if (imageUrl) {
      // 显示已生成的图像
      return (
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
          style={style}
        />
      );
    } else {
      // 无图模式或图片URL为空
      return null;
    }
  };

  // 渲染Markdown内容，使用更简单的方式
  const renderMarkdownContent = (text: string, additionalClassName?: string, customStyle?: React.CSSProperties) => {
    // 合并传入的样式与字体样式
    const combinedStyle = {
      ...customStyle,
      fontFamily: fontStyleFamily,
      fontSize: fontSizeStyles.body,
      whiteSpace: 'pre-wrap' as 'pre-wrap', // 显式类型转换为CSS属性
      wordBreak: 'break-word' as 'break-word', // 显式类型转换为CSS属性
    };
    
    // 使用div包装ReactMarkdown，并应用样式到div上
    return (
      <div className={`markdown-content ${additionalClassName || ""}`} style={combinedStyle}>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          components={{
            // 确保段落正确处理换行
            p: ({node, ...props}) => <p style={{marginBottom: '1em'}} {...props} />,
            // 确保链接正确显示
            a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
            // 确保列表正确缩进
            ul: ({node, ...props}) => <ul style={{paddingLeft: '1.5em', marginBottom: '1em'}} {...props} />,
            ol: ({node, ...props}) => <ol style={{paddingLeft: '1.5em', marginBottom: '1em'}} {...props} />,
            // 确保代码块正确显示
            code: ({node, className, ...props}: any) => {
              const match = /language-(\w+)/.exec(className || '');
              const inline = !match;
              return inline ? 
                <code style={{backgroundColor: 'rgba(0,0,0,0.1)', padding: '0.2em 0.4em', borderRadius: '3px'}} {...props} /> : 
                <pre style={{backgroundColor: 'rgba(0,0,0,0.1)', padding: '1em', borderRadius: '5px', overflow: 'auto', marginBottom: '1em'}}>
                  <code className={className} {...props} />
                </pre>
            }
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  };

  // 根据卡片样式渲染不同的内容
  const renderCardContent = () => {
    // 无图模式判断
    const isTextOnly = cardStyle === 'text-only' || (!imageUrl && !isGeneratingImage);
    
    // 内容编辑模式
    if (isEditing) {
      return (
        <div className="p-4 bg-white rounded-lg h-full overflow-y-auto">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg text-text-dark focus:outline-none focus:ring-2 focus:ring-redbook"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            autoFocus
            style={{
              minHeight: '200px',
              height: 'auto',
              resize: 'vertical', // 允许用户垂直调整大小
              fontFamily: fontStyleFamily,
              fontSize: fontSizeStyles.body
            }}
          />
        </div>
      );
    }

    // 样式渲染
    switch (cardStyle) {
      case 'left-image':
        return (
          <div className="flex flex-col md:flex-row overflow-hidden rounded-lg h-full" style={{ 
            backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
            color: colors.text,
            height: '100%',
            minHeight: '200px',
            fontFamily: fontStyleFamily
          }}>
            {!isTextOnly && (
              <div className="md:w-1/2 overflow-hidden h-full relative" style={{ 
                minHeight: '150px',
                height: '100%',
                aspectRatio: cardRatio === '1:1' ? '1/1' : cardRatio === '4:5' ? '4/5' : '2/3'
              }}>
                {renderImageContent()}
              </div>
            )}
            <div className={`p-6 ${isTextOnly ? 'w-full' : 'md:w-1/2'} flex flex-col flex-grow overflow-auto h-full`} style={{ minHeight: '150px', maxHeight: '100%' }}>
              <h3 className="text-xl font-bold mb-4" style={{ 
                color: colors.primary,
                fontFamily: fontStyleFamily,
                fontSize: fontSizeStyles.title
              }}>{title}</h3>
              <div className="mb-6 flex-grow">
                {renderMarkdownContent(body)}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-3 py-1 rounded-full" 
                    style={{ 
                      backgroundColor: colors.secondary,
                      color: colors.primary,
                      fontFamily: fontStyleFamily,
                      fontSize: fontSizeStyles.tag
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'right-image':
        return (
          <div 
            className="flex flex-col md:flex-row-reverse overflow-hidden rounded-lg h-full" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              color: colors.text,
              height: '100%',
              minHeight: '200px',
              fontFamily: fontStyleFamily
            }}
          >
            {!isTextOnly && (
              <div className="md:w-1/2 overflow-hidden h-full relative" style={{ 
                minHeight: '150px',
                height: '100%',
                aspectRatio: cardRatio === '1:1' ? '1/1' : cardRatio === '4:5' ? '4/5' : '2/3'
              }}>
                {renderImageContent()}
              </div>
            )}
            <div className={`p-6 ${isTextOnly ? 'w-full' : 'md:w-1/2'} flex flex-col flex-grow overflow-auto h-full`} style={{ minHeight: '150px', maxHeight: '100%' }}>
              <h3 className="text-xl font-bold mb-4" style={{ 
                color: colors.primary,
                fontFamily: fontStyleFamily,
                fontSize: fontSizeStyles.title
              }}>{title}</h3>
              <div className="mb-6 flex-grow">
                {renderMarkdownContent(body)}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-3 py-1 rounded-full" 
                    style={{ 
                      backgroundColor: colors.secondary,
                      color: colors.primary,
                      fontFamily: fontStyleFamily,
                      fontSize: fontSizeStyles.tag
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'overlay':
        return (
          <div 
            className="relative overflow-hidden rounded-lg h-full" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              height: '100%',
              minHeight: '200px',
              aspectRatio: cardRatio === '1:1' ? '1/1' : cardRatio === '4:5' ? '4/5' : '2/3',
              fontFamily: fontStyleFamily
            }}
          >
            {!isTextOnly && renderImageContent({ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 })}
            <div 
              className="absolute inset-0 p-6 flex flex-col justify-between overflow-auto" 
              style={{ 
                background: isTextOnly 
                  ? (colorTheme === 'gradient' ? colors.background : colors.secondary)
                  : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
                zIndex: 10,
                height: '100%',
                fontFamily: fontStyleFamily
              }}
            >
              <div className="flex-grow"></div>
              <div>
                <h3 
                  className="text-xl font-bold mb-4" 
                  style={{ 
                    color: isTextOnly ? colors.primary : '#fff',
                    textShadow: isTextOnly ? 'none' : '0px 1px 2px rgba(0,0,0,0.8)',
                    fontFamily: fontStyleFamily,
                    fontSize: fontSizeStyles.title
                  }}
                >
                  {title}
                </h3>
                <div className="mb-6">
                  {renderMarkdownContent(body, "", { 
                    color: isTextOnly ? colors.text : '#fff',
                    textShadow: isTextOnly ? 'none' : '0px 1px 2px rgba(0,0,0,0.8)',
                    fontFamily: fontStyleFamily,
                    fontSize: fontSizeStyles.body
                  })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-block px-3 py-1 rounded-full" 
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        color: isTextOnly ? colors.primary : '#fff',
                        textShadow: isTextOnly ? 'none' : '0px 1px 2px rgba(0,0,0,0.5)',
                        fontFamily: fontStyleFamily,
                        fontSize: fontSizeStyles.tag
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'collage':
        return (
          <div 
            className="grid grid-cols-2 gap-3 p-4 rounded-lg h-full" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              color: colors.text,
              height: '100%',
              gridTemplateRows: 'auto 1fr auto',
              fontFamily: fontStyleFamily
            }}
          >
            <div className="col-span-2">
              <h3 className="text-xl font-bold mb-4" style={{ 
                color: colors.primary,
                fontFamily: fontStyleFamily,
                fontSize: fontSizeStyles.title
              }}>{title}</h3>
            </div>
            
            {!isTextOnly && (
              <div className="overflow-hidden rounded-lg h-full" style={{ 
                aspectRatio: cardRatio === '1:1' ? '1/1' : cardRatio === '4:5' ? '4/5' : '2/3',
                fontFamily: fontStyleFamily
              }}>
                {renderImageContent()}
              </div>
            )}
            
            <div className={`${isTextOnly ? 'col-span-2' : ''} p-3 flex flex-col overflow-auto h-full`} style={{ backgroundColor: colors.secondary, borderRadius: '0.5rem', fontFamily: fontStyleFamily }}>
              <div className="text-sm mb-4 flex-grow">
                {renderMarkdownContent(body, "text-sm")}
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-2 py-1 rounded-full text-xs" 
                    style={{ 
                      backgroundColor: colors.primary,
                      color: '#fff',
                      fontFamily: fontStyleFamily,
                      fontSize: fontSizeStyles.tag
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {!isTextOnly && tags.length > 3 && (
              <div className="col-span-2 flex flex-wrap gap-2 mt-2">
                {tags.slice(3).map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-3 py-1 rounded-full" 
                    style={{ 
                      backgroundColor: colors.secondary,
                      color: colors.primary,
                      fontFamily: fontStyleFamily,
                      fontSize: fontSizeStyles.tag
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'magazine':
        return (
          <div 
            className="overflow-hidden rounded-lg h-full flex flex-col" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              color: colors.text,
              height: '100%',
              fontFamily: fontStyleFamily
            }}
          >
            <div className="p-6 relative flex-grow flex flex-col h-full">
              <div className="border-b pb-3 mb-6" style={{ borderColor: colors.primary }}>
                <h3 className="text-2xl font-bold" style={{ 
                  color: colors.primary,
                  fontFamily: fontStyleFamily,
                  fontSize: fontSizeStyles.title
                }}>{title}</h3>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-auto">
                {!isTextOnly && (
                  <div className="md:w-1/3 h-full">
                    <div 
                      className="overflow-hidden rounded-lg shadow-md h-full" 
                      style={{ 
                        borderColor: colors.primary, 
                        borderWidth: '1px',
                        aspectRatio: cardRatio === '1:1' ? '1/1' : cardRatio === '4:5' ? '4/5' : '2/3',
                        fontFamily: fontStyleFamily
                      }}
                    >
                      {renderImageContent()}
                    </div>
                  </div>
                )}
                
                <div className={`${isTextOnly ? 'w-full' : 'md:w-2/3'} flex flex-col flex-grow overflow-auto`}>
                  <div 
                    className="markdown-container mb-6 flex-grow"
                    style={{ 
                      lineHeight: '1.8',
                      fontFamily: fontStyleFamily,
                      fontSize: fontSizeStyles.body
                    }}
                  >
                    {renderMarkdownContent(body, "markdown-container first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2")}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-end">
                    {tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-block px-3 py-1 rounded-md" 
                        style={{ 
                          backgroundColor: colors.secondary,
                          color: colors.primary,
                          fontFamily: fontStyleFamily,
                          fontSize: fontSizeStyles.tag
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'text-only':
        return (
          <div 
            className="p-6 rounded-lg h-full flex flex-col overflow-auto" 
            style={{ 
              background: colorTheme === 'gradient' 
                ? colors.background 
                : (colorTheme === 'dark' ? colors.background : '#fff'),
              color: colors.text,
              height: '100%',
              fontFamily: fontStyleFamily
            }}
          >
            <h3 className="text-2xl font-bold mb-6" style={{ 
              color: colors.primary,
              fontFamily: fontStyleFamily,
              fontSize: fontSizeStyles.title
            }}>{title}</h3>
            <div className="mb-8 text-lg flex-grow" style={{ lineHeight: '1.8', fontFamily: fontStyleFamily, fontSize: fontSizeStyles.body }}>
              {renderMarkdownContent(body, "text-lg")}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-block px-3 py-1 rounded-full" 
                  style={{ 
                    backgroundColor: colors.secondary,
                    color: colors.primary,
                    fontFamily: fontStyleFamily,
                    fontSize: fontSizeStyles.tag
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
        
      // 默认样式（标准布局）
      case 'default':
      default:
        return (
          <div 
            className="overflow-hidden rounded-lg h-full flex flex-col" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              color: colors.text,
              height: '100%',
              minHeight: '200px',
              fontFamily: fontStyleFamily
            }}
          >
            {!isTextOnly && (
              <div 
                className="w-full overflow-hidden relative flex-shrink-0" 
                style={{ 
                  height: '60%',
                  minHeight: '150px',
                  maxHeight: '60%'
                }}
              >
                {renderImageContent()}
              </div>
            )}
            <div 
              className="p-6 flex flex-col flex-grow overflow-auto" 
              style={{ 
                height: isTextOnly ? '100%' : '40%',
                minHeight: '150px',
                maxHeight: isTextOnly ? '100%' : '40%'
              }}
            >
              <h3 
                className="text-xl font-bold mb-4" 
                style={{ 
                  color: colors.primary,
                  fontFamily: fontStyleFamily, 
                  fontSize: fontSizeStyles.title
                }}
              >
                {title}
              </h3>
              <div className="mb-6 flex-grow">
                {renderMarkdownContent(body)}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-3 py-1 rounded-full" 
                    style={{ 
                      backgroundColor: colors.secondary,
                      color: colors.primary,
                      fontFamily: fontStyleFamily,
                      fontSize: fontSizeStyles.tag
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  // 添加一个确保窗口正确渲染的检查
  useEffect(() => {
    // 当卡片加载完成后，确保文字内容可见
    if (cardRef.current) {
      const textElements = cardRef.current.querySelectorAll('h3, p, span');
      textElements.forEach(el => {
        // 检查是否为隐藏元素
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          // 重置样式以确保可见
          (el as HTMLElement).style.display = 'block';
          (el as HTMLElement).style.visibility = 'visible';
          (el as HTMLElement).style.opacity = '1';
        }
      });
    }
  }, [imageUrl, cardStyle, colorTheme]);

  return (
    <div className="mb-6 h-full flex flex-col" data-card-id={id}>
      <div 
        ref={cardRef} 
        className="bg-white rounded-lg border border-gray-200 shadow-md h-full"
        style={{ 
          ...getRatioStyle(), // 应用比例样式
          minHeight: '200px',
          fontFamily: fontStyleFamily
        }}
      >
        {renderCardContent()}
      </div>
    </div>
  );
};

export default ResultCard; 