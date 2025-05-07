import React, { useRef, useState } from 'react';
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
    // 在单卡片模式下，我们自适应容器高度
    return { height: '100%', maxHeight: 'calc(100vh - 250px)' };
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
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
        saveAs(dataUrl, `rednote-${id}.png`);
        onDownload(id);
      } catch (error) {
        console.error('下载图片时出错:', error);
      }
    }
  };

  const handleDownloadFullCard = async () => {
    setIsGeneratingCard(true);
    try {
      // 调用后端API生成完整卡片
      const response = await fetch('/api/generate-card', {
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
        throw new Error('生成卡片失败');
      }

      const blob = await response.blob();
      saveAs(blob, `rednote-card-${id}.png`);
      onDownload(id);
    } catch (error) {
      console.error('下载完整卡片时出错:', error);
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
        <div className="p-4 bg-white rounded-lg h-full overflow-auto">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg min-h-[200px] max-h-[calc(100vh-300px)] text-text-dark focus:outline-none focus:ring-2 focus:ring-redbook"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            autoFocus
          />
        </div>
      );
    }

    // 样式渲染
    switch (cardStyle) {
      case 'left-image':
        return (
          <div 
            className="flex flex-col md:flex-row overflow-hidden rounded-lg h-full" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              color: colors.text,
              height: '100%' 
            }}
          >
            {!isTextOnly && (
              <div className="md:w-1/2 overflow-hidden h-full">
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className={`p-6 ${isTextOnly ? 'w-full' : 'md:w-1/2'} flex flex-col flex-grow`}>
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
            className="flex flex-col md:flex-row-reverse overflow-hidden rounded-lg h-full" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              color: colors.text,
              height: '100%'
            }}
          >
            {!isTextOnly && (
              <div className="md:w-1/2 overflow-hidden h-full">
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className={`p-6 ${isTextOnly ? 'w-full' : 'md:w-1/2'} flex flex-col flex-grow`}>
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
            className="relative overflow-hidden rounded-lg h-full" 
            style={{ 
              ...getRatioStyle(),
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              height: '100%'
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
                  : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)'
              }}
            >
              <div className="flex-grow"></div>
              <div>
                <h3 
                  className="text-xl font-bold mb-4" 
                  style={{ color: isTextOnly ? colors.primary : '#fff' }}
                >
                  {title}
                </h3>
                <p 
                  className="whitespace-pre-line mb-6 line-clamp-3" 
                  style={{ color: isTextOnly ? colors.text : '#fff' }}
                >
                  {body}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-block px-3 py-1 rounded-full text-sm" 
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: isTextOnly ? colors.primary : '#fff'
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
              gridTemplateRows: 'auto 1fr auto'
            }}
          >
            <div className="col-span-2">
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>{title}</h3>
            </div>
            
            {!isTextOnly && (
              <div className="overflow-hidden rounded-lg h-full">
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
            className="overflow-hidden rounded-lg h-full flex flex-col" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              color: colors.text,
              height: '100%'
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
                      className="overflow-hidden rounded-lg shadow-md" 
                      style={{ borderColor: colors.primary, borderWidth: '1px' }}
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
            className="p-6 rounded-lg h-full flex flex-col" 
            style={{ 
              background: colorTheme === 'gradient' 
                ? colors.background 
                : (colorTheme === 'dark' ? colors.background : '#fff'),
              color: colors.text,
              ...getRatioStyle(),
              height: '100%'
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
            className="overflow-hidden rounded-lg h-full flex flex-col" 
            style={{ 
              backgroundColor: colorTheme === 'dark' ? colors.background : '#fff',
              color: colors.text,
              height: '100%'
            }}
          >
            {!isTextOnly && (
              <div className="w-full">
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="w-full object-cover"
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

  return (
    <div className="card mb-6 h-full flex flex-col">
      <div 
        ref={cardRef} 
        className="overflow-hidden flex-grow bg-white rounded-lg"
        style={getRatioStyle()}
      >
        {renderCardContent()}
      </div>
      <div className="mt-4 flex justify-between gap-3">
        <div>
          {isEditing ? (
            <>
              <button
                onClick={saveEditing}
                className="btn-primary mr-2"
              >
                保存
              </button>
              <button
                onClick={cancelEditing}
                className="btn-secondary"
              >
                取消
              </button>
            </>
          ) : (
            <button
              onClick={startEditing}
              className="btn-secondary"
            >
              编辑文本
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="btn-secondary"
          >
            下载图片
          </button>
          <button
            onClick={handleDownloadFullCard}
            disabled={isGeneratingCard || isEditing}
            className={`btn-primary ${(isGeneratingCard || isEditing) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isGeneratingCard ? '生成中...' : '下载完整卡片'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard; 