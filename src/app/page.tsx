'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InputForm from '@/components/InputForm';
import ResultCard from '@/components/ResultCard';
import DownloadAllButton from '@/components/DownloadAllButton';
import StyleSelector from '@/components/StyleSelector';
import { generateContent, GenerateResult } from '@/utils/api';

export default function Home() {
  const [results, setResults] = useState<GenerateResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [currentCardStyle, setCurrentCardStyle] = useState('standard');
  const [currentColorTheme, setCurrentColorTheme] = useState('redbook');
  const [currentCardRatio, setCurrentCardRatio] = useState('4:5');
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左侧区域 */}
          <div className="w-full md:w-1/3 space-y-6">
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
          <div className="w-full md:w-2/3">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-redbook">正在生成中，请稍候...</div>
              </div>
            ) : results.length > 0 ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-text-dark mb-4">生成结果</h2>
                  <div className="grid grid-cols-1 gap-6">
                    {results.map((result) => (
                      <ResultCard
                        key={result.id}
                        id={result.id}
                        content={result.content}
                        imageUrl={result.imageUrl}
                        cardStyle={currentCardStyle}
                        colorTheme={currentColorTheme}
                        cardRatio={currentCardRatio}
                        onDownload={handleDownload}
                        onContentUpdate={handleContentUpdate}
                      />
                    ))}
                  </div>
                </div>
                <div className="sticky bottom-4">
                  <DownloadAllButton
                    results={results}
                    isDisabled={isLoading}
                    cardStyle={currentCardStyle}
                    colorTheme={currentColorTheme}
                    cardRatio={currentCardRatio}
                  />
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