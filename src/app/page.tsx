'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InputForm from '@/components/InputForm';
import ResultCard from '@/components/ResultCard';
import DownloadAllButton from '@/components/DownloadAllButton';
import StyleSelector from '../components/StyleSelector';
import { generateContent, GenerateResult } from '@/utils/api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import TabPanel from '@/components/TabPanel';
import LogPanel from '@/components/LogPanel';
import logger, { LogEntry } from '@/utils/logger';

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
  // 添加日志状态
  const [logs, setLogs] = useState<LogEntry[]>([]);

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
    
    // 添加日志记录示例
    logger.info('应用程序已启动');
    
    // 订阅日志更新
    const unsubscribe = logger.onLogsUpdated(updatedLogs => {
      setLogs(updatedLogs);
    });
    
    return () => {
      unsubscribe();
    };
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
    logger.info('开始生成内容...');
    try {
      logger.info(`生成参数: 上下文=${context}, 主题=${theme}, 描述=${description}, 图片生成类型=${imageGenerationType}`);
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
      logger.success(`成功生成 ${generatedResults.length} 个内容`);
    } catch (error) {
      console.error('生成内容时出错:', error);
      logger.error(`生成内容失败: ${error instanceof Error ? error.message : String(error)}`);
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
      if (currentResult.imageUrl) {
        try {
          logger.info(`开始下载图片: ID=${currentResult.id}`);
          
          // 获取图片数据
          const response = await fetch(currentResult.imageUrl);
          if (!response.ok) {
            throw new Error(`图片下载失败: ${response.status}`);
          }
          
          const blob = await response.blob();
          
          // 使用 FileSaver 保存图片
          saveAs(blob, `rednote-image-${currentResult.id}.jpg`);
          
          handleDownload(currentResult.id);
          logger.success(`图片下载完成: ID=${currentResult.id}`);
        } catch (error) {
          console.error('下载图片时出错:', error);
          logger.error(`下载图片失败: ${error instanceof Error ? error.message : String(error)}`);
          alert('下载图片失败，请检查控制台获取详细错误信息');
        }
      } else {
        console.error('没有图片可下载');
        logger.warn('尝试下载图片，但没有图片URL');
        alert('没有图片可下载');
      }
    }
  };

  const handleDownloadFullCard = async () => {
    setIsGeneratingCard(true);
    try {
      if (results.length > 0) {
        const currentResult = results[currentCardIndex];
        logger.info(`开始生成完整卡片: ID=${currentResult.id}`);
        
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
            logger.error(`生成卡片API响应错误: ${response.status} ${errorText}`);
            throw new Error(`生成卡片失败: ${response.status} ${errorText}`);
          }

          logger.info('API响应成功，准备下载卡片...');
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
          logger.success(`卡片下载完成: ID=${currentResult.id}`);
        } catch (apiError) {
          console.error('API调用失败，尝试使用前端渲染:', apiError);
          logger.error(`API调用失败: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
          logger.info('尝试使用前端方式下载...');
          alert('通过API生成卡片失败，正在尝试使用前端方式下载...');
          
          // 降级方案：如果API失败，使用前端方法
          handleDownloadImage();
        }
      }
    } catch (error) {
      console.error('下载完整卡片时出错:', error);
      logger.error(`下载完整卡片失败: ${error instanceof Error ? error.message : String(error)}`);
      alert('下载卡片失败，请检查控制台获取详细错误信息');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleDownloadZip = async () => {
    if (results.length > 0) {
      try {
        console.log('开始创建压缩包...');
        setIsGeneratingCard(true);
        
        const currentResult = results[currentCardIndex];
        
        // 创建新的 ZIP 实例
        const zip = new JSZip();
        
        // 添加内容的文本文件
        zip.file(`小红书文案-${currentResult.id}.txt`, currentResult.content);
        
        // 如果有图片，下载图片并添加到压缩包
        if (currentResult.imageUrl) {
          try {
            const response = await fetch(currentResult.imageUrl);
            if (!response.ok) {
              throw new Error(`图片下载失败: ${response.status}`);
            }
            const imageBlob = await response.blob();
            zip.file(`小红书图片-${currentResult.id}.jpg`, imageBlob);
          } catch (imgError) {
            console.error('下载图片时出错:', imgError);
          }
        }
        
        // 生成并下载 ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `小红书内容-${currentResult.id}.zip`);
        
        console.log('压缩包创建完成');
      } catch (error) {
        console.error('创建压缩包时出错:', error);
        alert('创建压缩包失败，请检查控制台获取详细错误信息');
      } finally {
        setIsGeneratingCard(false);
      }
    }
  };

  // 创建结果面板内容
  const resultPanelContent = (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto pb-16">
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
  );

  // 创建日志面板内容
  const logPanelContent = (
    <LogPanel logs={logs} />
  );

  // 定义标签页
  const tabs = [
    {
      id: 'result',
      label: '生成结果',
      content: resultPanelContent
    },
    {
      id: 'log',
      label: '运行日志',
      content: logPanelContent
    }
  ];

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
          <div className="w-full md:w-2/3 flex flex-col overflow-hidden border-l border-gray-200">
            {/* 使用标签页组件替换原来的结果展示区 */}
            <TabPanel
              tabs={tabs}
              defaultTabId="result"
              onTabChange={(tabId) => {
                if (tabId === 'log') {
                  logger.info('切换到日志面板');
                } else {
                  logger.info('切换到结果面板');
                }
              }}
            />
            
            {/* 卡片导航按钮和下载按钮 - 使用sticky替代fixed */}
            {(results.length > 0 || showExample) && (
              <div className="sticky bottom-0 w-full bg-white p-3 border-t border-gray-200 flex justify-between items-center z-10 shadow-md">
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
                      <button
                        onClick={handleDownloadZip}
                        disabled={isGeneratingCard || isEditing || showExample}
                        className={`btn-primary ${(isGeneratingCard || isEditing || showExample) ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        下载压缩包
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