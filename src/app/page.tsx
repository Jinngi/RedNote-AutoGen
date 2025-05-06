'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InputForm from '@/components/InputForm';
import ResultCard from '@/components/ResultCard';
import DownloadAllButton from '@/components/DownloadAllButton';
import { generateContent, GenerateResult } from '@/utils/api';

export default function Home() {
  const [results, setResults] = useState<GenerateResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  const handleGenerate = async (context: string, theme: string, description: string) => {
    setIsLoading(true);
    try {
      const generatedResults = await generateContent(context, theme, description);
      setResults(generatedResults);
      setDownloadedIds([]);
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左侧输入区 */}
          <div className="w-full md:w-1/3">
            <InputForm onGenerate={handleGenerate} isLoading={isLoading} />
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
                        onDownload={handleDownload}
                      />
                    ))}
                  </div>
                </div>
                <div className="sticky bottom-4">
                  <DownloadAllButton
                    results={results}
                    isDisabled={isLoading}
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