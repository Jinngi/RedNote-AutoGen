import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

interface ResultCardProps {
  id: string;
  content: string;
  imageUrl: string;
  cardStyle: string;
  colorTheme: string;
  cardRatio: string;
  onDownload: (id: string) => void;
  onContentUpdate?: (id: string, newContent: string) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ 
  id, 
  content, 
  imageUrl, 
  cardStyle,
  colorTheme,
  cardRatio,
  onDownload,
  onContentUpdate 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  // 解析内容，提取标题和正文
  const parseContent = () => {
    const lines = editedContent.split('\n').filter(line => line.trim());
    const title = lines[0] || '小红书文案';
    const body = lines.slice(1).join('\n');
    
    // 提取标签
    const tagRegex = /#[^\s#]+/g;
    const tags = editedContent.match(tagRegex) || [];
    
    return { title, body, tags };
  };
  
  const { title, body, tags } = parseContent();

  // 获取卡片比例样式
  const getRatioStyle = () => {
    // 根据不同的比例设置不同的样式
    switch (cardRatio) {
      case '1:1':  // 正方形
        return { 
          aspectRatio: '1/1',
          width: '100%',
          height: 'auto',
          maxHeight: 'none',
          overflow: 'visible'
        };
      case '4:5':  // 竖图
        return { 
          aspectRatio: '4/5',
          width: '100%',
          height: 'auto',
          maxHeight: 'none',
          overflow: 'visible'
        };
      case '4:6':  // 长图
        return { 
          aspectRatio: '2/3', // 4:6 简化为 2:3
          width: '100%',
          height: 'auto',
          maxHeight: 'none',
          overflow: 'visible'
        };
      default:
        return { 
          minHeight: '100px',
          height: 'auto',
          maxHeight: 'none',
          overflow: 'visible'
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
      
      // 添加时间戳避免缓存
      const timestamp = new Date().getTime();
      
      try {
        // 调用后端API生成完整卡片
        const response = await fetch(`/api/generate-card?t=${timestamp}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            content: editedContent,
            imageUrl,
            cardStyle,
            colorTheme,
            cardRatio
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API响应错误:', response.status, errorText);
          throw new Error(`生成卡片失败: ${response.status} ${errorText}`);
        }

        console.log('API响应成功，准备下载卡片...');
        const blob = await response.blob();
        
        // 使用a标签下载，确保兼容性
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rednote-card-${id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        onDownload(id);
        console.log('卡片下载完成');
      } catch (apiError) {
        console.error('API调用失败，尝试使用前端渲染:', apiError);
        alert('通过API生成卡片失败，正在尝试使用前端方式下载...');
        
        // 降级方案：如果API失败，使用前端方法
        handleDownload();
      }
    } catch (error) {
      console.error('下载完整卡片时出错:', error);
      alert('下载卡片失败，请检查控制台获取详细错误信息');
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

  // 根据卡片样式渲染不同的内容
  const renderCardContent = () => {
    // 无图模式判断
    const isTextOnly = cardStyle === 'text-only' || !imageUrl;
    
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
              resize: 'vertical' // 允许用户垂直调整大小
            }}
          />
        </div>
      );
    }

    // 样式渲染
    switch (cardStyle) {
      case 'left-image':
        return (
          <div 
            className="flex flex-col md:flex-row overflow-visible rounded-lg h-auto" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              color: colors.text,
              height: 'auto',
              minHeight: '200px'
            }}
          >
            {!isTextOnly && (
              <div className="md:w-1/2 overflow-visible h-auto relative" style={{ 
                minHeight: '150px',
                aspectRatio: cardRatio === '1:1' ? '1/1' : cardRatio === '4:5' ? '4/5' : '2/3'
              }}>
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className={`p-6 ${isTextOnly ? 'w-full' : 'md:w-1/2'} flex flex-col flex-grow overflow-visible`} style={{ minHeight: '150px' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>{title}</h3>
              <p className="whitespace-pre-line mb-6 flex-grow">{body}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-3 py-1 rounded-full text-sm" 
                    style={{ 
                      backgroundColor: colors.secondary,
                      color: colors.primary 
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
            className="flex flex-col md:flex-row-reverse overflow-visible rounded-lg h-auto" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              color: colors.text,
              height: 'auto',
              minHeight: '200px'
            }}
          >
            {!isTextOnly && (
              <div className="md:w-1/2 overflow-visible h-auto relative" style={{ 
                minHeight: '150px',
                aspectRatio: cardRatio === '1:1' ? '1/1' : cardRatio === '4:5' ? '4/5' : '2/3'
              }}>
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className={`p-6 ${isTextOnly ? 'w-full' : 'md:w-1/2'} flex flex-col flex-grow overflow-visible`} style={{ minHeight: '150px' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>{title}</h3>
              <p className="whitespace-pre-line mb-6 flex-grow">{body}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-3 py-1 rounded-full text-sm" 
                    style={{ 
                      backgroundColor: colors.secondary,
                      color: colors.primary 
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
            className="relative overflow-visible rounded-lg h-auto" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              height: 'auto',
              minHeight: '200px',
              aspectRatio: cardRatio === '1:1' ? '1/1' : cardRatio === '4:5' ? '4/5' : '2/3'
            }}
          >
            {!isTextOnly && (
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            )}
            <div 
              className="absolute inset-0 p-6 flex flex-col justify-between" 
              style={{ 
                background: isTextOnly 
                  ? (colorTheme === 'gradient' ? colors.background : colors.secondary)
                  : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
                zIndex: 10,
                overflow: 'visible',
                height: '100%'
              }}
            >
              <div className="flex-grow"></div>
              <div>
                <h3 
                  className="text-xl font-bold mb-4" 
                  style={{ 
                    color: isTextOnly ? colors.primary : '#fff',
                    textShadow: isTextOnly ? 'none' : '0px 1px 2px rgba(0,0,0,0.8)' // 添加文字阴影提高可读性
                  }}
                >
                  {title}
                </h3>
                <p 
                  className="whitespace-pre-line mb-6" 
                  style={{ 
                    color: isTextOnly ? colors.text : '#fff',
                    textShadow: isTextOnly ? 'none' : '0px 1px 2px rgba(0,0,0,0.8)',
                  }}
                >
                  {body}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-block px-3 py-1 rounded-full text-sm" 
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        color: isTextOnly ? colors.primary : '#fff',
                        textShadow: isTextOnly ? 'none' : '0px 1px 2px rgba(0,0,0,0.5)'
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
            className="grid grid-cols-2 gap-3 p-4 rounded-lg h-auto" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              color: colors.text,
              height: 'auto',
              gridTemplateRows: 'auto auto auto'
            }}
          >
            <div className="col-span-2">
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>{title}</h3>
            </div>
            
            {!isTextOnly && (
              <div className="overflow-visible rounded-lg h-auto" style={{ 
                aspectRatio: cardRatio === '1:1' ? '1/1' : cardRatio === '4:5' ? '4/5' : '2/3'
              }}>
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className={`${isTextOnly ? 'col-span-2' : ''} p-3 flex flex-col`} style={{ backgroundColor: colors.secondary, borderRadius: '0.5rem' }}>
              <p className="whitespace-pre-line text-sm mb-4 flex-grow">{body}</p>
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-2 py-1 rounded-full text-xs" 
                    style={{ backgroundColor: colors.primary, color: '#fff' }}
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
                    className="inline-block px-3 py-1 rounded-full text-sm" 
                    style={{ 
                      backgroundColor: colors.secondary,
                      color: colors.primary 
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
            className="overflow-visible rounded-lg h-auto flex flex-col" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              color: colors.text,
              height: 'auto'
            }}
          >
            <div className="p-6 relative flex-grow flex flex-col">
              <div className="border-b pb-3 mb-6" style={{ borderColor: colors.primary }}>
                <h3 className="text-2xl font-bold" style={{ color: colors.primary }}>{title}</h3>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 flex-grow">
                {!isTextOnly && (
                  <div className="md:w-1/3">
                    <div 
                      className="overflow-visible rounded-lg shadow-md" 
                      style={{ 
                        borderColor: colors.primary, 
                        borderWidth: '1px',
                        aspectRatio: cardRatio === '1:1' ? '1/1' : cardRatio === '4:5' ? '4/5' : '2/3'
                      }}
                    >
                      <img 
                        src={imageUrl} 
                        alt={title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                <div className={`${isTextOnly ? 'w-full' : 'md:w-2/3'} flex flex-col flex-grow`}>
                  <p 
                    className="whitespace-pre-line mb-6 first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 flex-grow"
                    style={{ 
                      lineHeight: '1.8'
                    }}
                  >
                    {body}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 justify-end">
                    {tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-block px-3 py-1 rounded-md text-sm" 
                        style={{ 
                          backgroundColor: colors.secondary,
                          color: colors.primary 
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
            className="p-6 rounded-lg h-auto flex flex-col" 
            style={{ 
              background: colorTheme === 'gradient' 
                ? colors.background 
                : (colorTheme === 'dark' ? colors.background : '#fff'),
              color: colors.text,
              height: 'auto'
            }}
          >
            <h3 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>{title}</h3>
            <p className="whitespace-pre-line mb-8 text-lg flex-grow" style={{ lineHeight: '1.8' }}>{body}</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-block px-3 py-1 rounded-full text-sm" 
                  style={{ 
                    backgroundColor: colors.secondary,
                    color: colors.primary 
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
            className="overflow-visible rounded-lg h-auto flex flex-col" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              color: colors.text,
              height: 'auto'
            }}
          >
            {!isTextOnly && (
              <div className="w-full" style={{ aspectRatio: cardRatio === '1:1' ? '1/1' : cardRatio === '4:5' ? '4/5' : '2/3' }}>
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6 flex-grow">
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>{title}</h3>
              <p className="whitespace-pre-line mb-6">{body}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-3 py-1 rounded-full text-sm" 
                    style={{ 
                      backgroundColor: colors.secondary,
                      color: colors.primary 
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
    <div className="mb-6 h-auto flex flex-col" data-card-id={id}>
      <div 
        ref={cardRef} 
        className="bg-white rounded-lg border border-gray-200 shadow-md"
        style={{ 
          ...getRatioStyle(), // 应用比例样式
          minHeight: '200px'
        }}
      >
        {renderCardContent()}
      </div>
    </div>
  );
};

export default ResultCard; 