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
      // 这里可能需要调用ResultCard中的下载方法
      handleDownload(currentResult.id);
    }
  };

  const handleDownloadFullCard = async () => {
    setIsGeneratingCard(true);
    try {
      if (results.length > 0) {
        const currentResult = results[currentCardIndex];
        // 调用后端API生成完整卡片
        const response = await fetch('/api/generate-card', {
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
          throw new Error('生成卡片失败');
        }

        const blob = await response.blob();
        const saveAs = (await import('file-saver')).saveAs;
        saveAs(blob, `rednote-card-${currentResult.id}.png`);
        handleDownload(currentResult.id);
      }
    } catch (error) {
      console.error('下载完整卡片时出错:', error);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  // 根据是否是Electron环境决定容器类名
  const containerClassName = isElectron 
    ? "w-full px-2 py-4 flex-grow overflow-hidden" 
    : "container mx-auto px-2 py-4 flex-grow overflow-hidden";

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className={containerClassName}>
        <div className="flex flex-col md:flex-row gap-2 h-full">
          {/* 左侧区域 */}
          <div className="w-full md:w-1/3 space-y-4 md:h-full md:overflow-auto">
            {/* 输入表单 */}
            <InputForm 
              onGenerate={handleGenerate} 
              isLoading={isLoading} 
            />
            
            {/* 样式选择器（仅当有结果时显示） */}
            {showStyleSelector && (
              <StyleSelector
                cardStyle={currentCardStyle}
                colorTheme={currentColorTheme}
                cardRatio={currentCardRatio}
                onStyleChange={handleStyleChange}
                onColorThemeChange={handleColorThemeChange}
                onCardRatioChange={handleCardRatioChange}
              />
            )}
          </div>
          
          {/* 右侧结果展示区 */}
          <div className="w-full md:w-2/3 md:h-full flex flex-col">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-redbook">正在生成中，请稍候...</div>
              </div>
            ) : results.length > 0 ? (
              <div className="flex flex-col h-full">
                <div className="mb-3 flex-grow overflow-hidden flex flex-col">
                  <h2 className="text-xl font-bold text-text-dark mb-3">
                    生成结果 ({currentCardIndex + 1}/{results.length})
                  </h2>
                  <div className="flex-grow overflow-auto pb-16">
                    {/* 只显示当前索引的卡片 */}
                    {results.length > 0 && (
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
                    )}
                  </div>
                </div>
                
                {/* 卡片导航按钮和下载按钮 */}
                <div className="mt-auto">
                  {results.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200 flex justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={handlePrevCard}
                          disabled={currentCardIndex === 0 || isEditing}
                          className={`btn-secondary ${(currentCardIndex === 0 || isEditing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          上一个
                        </button>
                        <button
                          onClick={handleNextCard}
                          disabled={currentCardIndex === results.length - 1 || isEditing}
                          className={`btn-secondary ${(currentCardIndex === results.length - 1 || isEditing) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                          <button
                            onClick={startEditing}
                            className="btn-secondary"
                          >
                            编辑文本
                          </button>
                        )}
                        <button
                          onClick={handleDownloadImage}
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
                  )}
                </div>
              </div>
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
      </div>
      
      <Footer />
    </div>
  );
} 