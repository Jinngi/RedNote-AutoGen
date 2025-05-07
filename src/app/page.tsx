'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InputForm from '@/components/InputForm';
import ResultCard from '@/components/ResultCard';
import DownloadAllButton from '@/components/DownloadAllButton';
import StyleSelector from '../components/StyleSelector';
import { generateContent, GenerateResult } from '@/utils/api';

interface ElectronWindow extends Window {
  electron?: {
    minimizeWindow: () => void;
    closeWindow: () => void;
  };
}

export default function Home() {
  const [results, setResults] = useState<GenerateResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [currentCardStyle, setCurrentCardStyle] = useState('standard');
  const [currentColorTheme, setCurrentColorTheme] = useState('redbook');
  const [currentCardRatio, setCurrentCardRatio] = useState('4:5');
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  // 添加当前显示的卡片索引状态
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isElectron, setIsElectron] = useState(false);
  // 添加状态来管理编辑模式和生成卡片状态
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  // 添加编辑内容状态
  const [editedContent, setEditedContent] = useState('');
  // 添加默认示例状态
  const [showExample, setShowExample] = useState(true);

  // 默认示例内容
  const exampleResult: GenerateResult = {
    id: 'example-1',
    content: `#一日份的小确幸\n\n今天在家做了一份超级好吃的肉桂苹果派🥧\n\n选用了新鲜采摘的红富士，撒上肉桂粉和红糖，外皮酥脆，内馅鲜甜多汁，一口下去幸福感爆棚～\n\n最喜欢这种简单的烘焙时光，在厨房里就能感受满满的治愈✨\n\n分享给和我一样喜欢烘焙的小伙伴们，周末在家也能享受甜蜜悠闲时光！\n\n#居家烘焙 #肉桂苹果派 #烘焙治愈系 #周末生活方式`,
    imageUrl: 'https://picsum.photos/500/300?random=1'
  };

  useEffect(() => {
    // 检测Electron环境
    if (typeof window !== 'undefined' && (window as ElectronWindow).electron) {
      setIsElectron(true);
    }
  }, []);

  // 是否显示左侧样式选择器
  const showStyleSelector = results.length > 0;

  const handleGenerate = async (
    context: string, 
    theme: string, 
    description: string, 
    imageGenerationType: string,
    cardStyle: string,
    colorTheme: string,
    cardRatio: string
  ) => {
    setIsLoading(true);
    try {
      const generatedResults = await generateContent(context, theme, description, imageGenerationType);
      setResults(generatedResults);
      setDownloadedIds([]);
      setCurrentCardStyle(cardStyle);
      setCurrentColorTheme(colorTheme);
      setCurrentCardRatio(cardRatio);
      setHasGeneratedContent(true);
      setShowExample(false); // 隐藏示例
      // 重置当前卡片索引
      setCurrentCardIndex(0);
    } catch (error) {
      console.error('生成内容时出错:', error);
      // 这里可以添加错误提示UI
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (id: string) => {
    setDownloadedIds(prev => [...prev, id]);
  };

  const handleContentUpdate = (id: string, newContent: string) => {
    setResults(prev => 
      prev.map(result => 
        result.id === id 
          ? { ...result, content: newContent } 
          : result
      )
    );
  };

  const handleStyleChange = (style: string) => {
    setCurrentCardStyle(style);
  };

  const handleColorThemeChange = (theme: string) => {
    setCurrentColorTheme(theme);
  };

  const handleCardRatioChange = (ratio: string) => {
    setCurrentCardRatio(ratio);
  };

  // 处理下一个卡片
  const handleNextCard = () => {
    if (currentCardIndex < results.length - 1) {
      setCurrentCardIndex(prevIndex => prevIndex + 1);
    }
  };

  // 处理上一个卡片
  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prevIndex => prevIndex - 1);
    }
  };

  // 更新编辑功能
  const startEditing = () => {
    if (results.length > 0) {
      const currentResult = results[currentCardIndex];
      setEditedContent(currentResult.content);
      setIsEditing(true);
    }
  };

  const saveEditing = () => {
    if (results.length > 0) {
      const currentResult = results[currentCardIndex];
      handleContentUpdate(currentResult.id, editedContent);
      setIsEditing(false);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  // 添加下载功能
  const handleDownloadImage = async () => {
    if (results.length > 0) {
      const currentResult = results[currentCardIndex];
      try {
        // 获取当前卡片元素
        const cardElement = document.querySelector(`[data-card-id="${currentResult.id}"]`);
        if (cardElement) {
          console.log('找到卡片元素，准备下载图片...');
          const { toPng } = await import('html-to-image');
          
          // 克隆节点并处理跨域图片
          const clonedNode = cardElement.cloneNode(true) as HTMLElement;
          const images = clonedNode.querySelectorAll('img');
          
          // 处理所有跨域图片，隐藏它们以避免CORS错误
          for (let i = 0; i < images.length; i++) {
            const img = images[i] as HTMLImageElement;
            if (img.src.includes('picsum.photos') || img.src.includes('http')) {
              img.style.visibility = 'hidden';
            }
          }
            
          // 添加延时确保元素完全渲染
          setTimeout(async () => {
            try {
              const dataUrl = await toPng(cardElement as HTMLElement, { 
                quality: 0.95,
                canvasWidth: 1200,
                canvasHeight: 1500,
                pixelRatio: 2,
                cacheBust: true,
                // 过滤跨域资源
                filter: (node) => {
                  if (node instanceof HTMLImageElement && 
                      (node.src.includes('picsum.photos') || node.src.includes('http'))) {
                    return false;
                  }
                  return true;
                }
              });
              console.log('HTML转换成功，准备保存图片...');
              // 使用a标签下载，确保兼容性
              const link = document.createElement('a');
              link.download = `rednote-${currentResult.id}.png`;
              link.href = dataUrl;
              link.click();
              handleDownload(currentResult.id);
            } catch (innerError) {
              console.error('延时后下载图片仍然出错:', innerError);
              alert('下载图片失败，请检查控制台获取详细错误信息');
            }
          }, 500);
        } else {
          console.error('找不到卡片元素');
          alert('找不到卡片元素，无法下载图片');
        }
      } catch (error) {
        console.error('下载图片时出错:', error);
        alert('下载图片失败，请检查控制台获取详细错误信息');
      }
    }
  };

  const handleDownloadFullCard = async () => {
    setIsGeneratingCard(true);
    try {
      if (results.length > 0) {
        const currentResult = results[currentCardIndex];
        console.log('开始生成完整卡片...');
        
        // 添加随机时间戳避免缓存
        const timestamp = new Date().getTime();
        
        try {
          // 调用后端API生成完整卡片
          const response = await fetch(`/api/generate-card?t=${timestamp}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: currentResult.id,
              content: currentResult.content,
              imageUrl: currentResult.imageUrl,
              cardStyle: currentCardStyle,
              colorTheme: currentColorTheme,
              cardRatio: currentCardRatio
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
          link.download = `rednote-card-${currentResult.id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          handleDownload(currentResult.id);
          console.log('卡片下载完成');
        } catch (apiError) {
          console.error('API调用失败，尝试使用前端渲染:', apiError);
          alert('通过API生成卡片失败，正在尝试使用前端方式下载...');
          
          // 降级方案：如果API失败，使用前端方法
          handleDownloadImage();
        }
      }
    } catch (error) {
      console.error('下载完整卡片时出错:', error);
      alert('下载卡片失败，请检查控制台获取详细错误信息');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  // 根据是否是Electron环境决定容器类名
  const containerClassName = isElectron 
    ? "w-full px-2 py-4 flex-1 overflow-hidden flex flex-col" 
    : "container mx-auto px-2 py-4 flex-1 overflow-hidden flex flex-col";

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className={containerClassName}>
        <div className="flex flex-col md:flex-row gap-2 flex-1 overflow-hidden">
          {/* 左侧区域 */}
          <div className="w-full md:w-1/3 flex flex-col space-y-4 md:overflow-auto">
            {/* 输入表单 */}
            <div className="flex-1 overflow-auto">
              <InputForm 
                onGenerate={handleGenerate} 
                isLoading={isLoading} 
              />
              
              {/* 样式选择器（仅当有结果时显示） */}
              {showStyleSelector && (
                <div className="mt-4">
                  <StyleSelector
                    cardStyle={currentCardStyle}
                    colorTheme={currentColorTheme}
                    cardRatio={currentCardRatio}
                    onStyleChange={handleStyleChange}
                    onColorThemeChange={handleColorThemeChange}
                    onCardRatioChange={handleCardRatioChange}
                  />
                </div>
              )}
            </div>
            
            {/* 固定在底部的生成按钮 */}
            <div className="sticky bottom-0 pb-2 pt-2 bg-white z-10">
              <button
                onClick={() => {
                  // 可以触发表单提交
                  const submitButton = document.querySelector('form button[type="submit"]') as HTMLButtonElement;
                  if (submitButton) submitButton.click();
                }}
                className="btn-primary w-full py-3 text-lg"
                disabled={isLoading}
              >
                {isLoading ? '生成中...' : '生成文案与图片'}
              </button>
            </div>
          </div>
          
          {/* 右侧结果展示区 */}
          <div className="w-full md:w-2/3 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden flex flex-col">
              <h2 className="text-xl font-bold text-text-dark mb-3">
                {results.length > 0 ? `生成结果 (${currentCardIndex + 1}/${results.length})` : '预览效果'}
              </h2>
              <div className="flex-1 overflow-auto pb-16">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-redbook">正在生成中，请稍候...</div>
                  </div>
                ) : results.length > 0 ? (
                  <>
                    {isEditing ? (
                      <div className="bg-white rounded-lg p-4 mb-6">
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
                    ) : (
                      <ResultCard
                        key={results[currentCardIndex].id}
                        id={results[currentCardIndex].id}
                        content={results[currentCardIndex].content}
                        imageUrl={results[currentCardIndex].imageUrl}
                        cardStyle={currentCardStyle}
                        colorTheme={currentColorTheme}
                        cardRatio={currentCardRatio}
                        onDownload={handleDownload}
                        onContentUpdate={handleContentUpdate}
                      />
                    )}
                  </>
                ) : showExample ? (
                  // 显示默认示例
                  <ResultCard
                    key={exampleResult.id}
                    id={exampleResult.id}
                    content={exampleResult.content}
                    imageUrl={exampleResult.imageUrl}
                    cardStyle={currentCardStyle}
                    colorTheme={currentColorTheme}
                    cardRatio={currentCardRatio}
                    onDownload={handleDownload}
                    onContentUpdate={handleContentUpdate}
                  />
                ) : (
                  <div className="flex justify-center items-center h-64 bg-light-gray rounded-lg">
                    <div className="text-center">
                      <p className="text-text-medium mb-2">请在左侧填写内容并点击生成按钮</p>
                      <p className="text-text-medium text-sm">生成的小红书文案与图片将显示在这里</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 卡片导航按钮和下载按钮 - 使用sticky替代fixed */}
            {(results.length > 0 || showExample) && (
              <div className="sticky bottom-0 w-full bg-white p-3 border-t border-gray-200 flex justify-between items-center z-10">
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevCard}
                    disabled={(currentCardIndex === 0 && !showExample) || isEditing || showExample}
                    className={`btn-secondary ${((currentCardIndex === 0 && !showExample) || isEditing || showExample) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    上一个
                  </button>
                  <button
                    onClick={handleNextCard}
                    disabled={(currentCardIndex === results.length - 1 && !showExample) || isEditing || showExample}
                    className={`btn-secondary ${((currentCardIndex === results.length - 1 && !showExample) || isEditing || showExample) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    下一个
                  </button>
                </div>
                
                <div className="flex gap-2">
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
                    <>
                      <button
                        onClick={startEditing}
                        disabled={showExample}
                        className={`btn-secondary ${showExample ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        编辑文本
                      </button>
                      <button
                        onClick={handleDownloadImage}
                        className="btn-secondary"
                      >
                        下载图片
                      </button>
                      <button
                        onClick={handleDownloadFullCard}
                        disabled={isGeneratingCard || isEditing || showExample}
                        className={`btn-primary ${(isGeneratingCard || isEditing || showExample) ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isGeneratingCard ? '生成中...' : '下载完整卡片'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 