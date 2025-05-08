import React, { useState, useEffect } from 'react';
import { searchWebImages, translateToEnglish } from '@/utils/api';

interface WebImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  defaultQuery: string;
}

const WebImageSearchModal: React.FC<WebImageSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  defaultQuery
}) => {
  const [searchQuery, setSearchQuery] = useState(defaultQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 当弹窗打开时，设置默认搜索词
  useEffect(() => {
    if (isOpen) {
      setSearchQuery(defaultQuery);
      setSelectedImageUrl(null);
      setSearchResults([]);
      setError(null);
    }
  }, [isOpen, defaultQuery]);

  // 如果弹窗未打开，不渲染任何内容
  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('请输入搜索关键词');
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      setSelectedImageUrl(null);
      
      // 首先使用LLM翻译搜索词，并提取关键词
      const translationResult = await translateToEnglish(searchQuery);
      
      // 使用提取的关键词搜索图片
      const results = await searchWebImages(translationResult.keywords);
      
      if (results.length === 0) {
        setError('未找到相关图片，请尝试修改搜索词');
      } else {
        setSearchResults(results);
      }
    } catch (err) {
      setError('搜索图片时出错，请稍后重试');
      console.error('搜索图片出错:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  };

  const handleConfirm = () => {
    if (selectedImageUrl) {
      onSelectImage(selectedImageUrl);
      onClose();
    } else {
      setError('请先选择一张图片');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* 弹窗头部 */}
        <div className="bg-redbook text-white px-4 py-3 flex justify-between items-center">
          <h3 className="font-medium text-lg">网络搜图</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>

        {/* 搜索框 */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-redbook focus:border-redbook"
              placeholder="输入搜索关键词..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-redbook hover:bg-redbook-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-redbook disabled:bg-gray-400"
            >
              {isSearching ? '搜索中...' : '搜索'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* 图片结果区域 */}
        <div className="flex-1 overflow-auto p-4">
          {isSearching ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-redbook">正在搜索中，请稍候...</div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((imageUrl, index) => (
                <div 
                  key={index}
                  onClick={() => handleSelectImage(imageUrl)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 hover:border-redbook transition-all aspect-square ${selectedImageUrl === imageUrl ? 'border-redbook' : 'border-transparent'}`}
                >
                  <img 
                    src={imageUrl} 
                    alt={`搜索结果${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {selectedImageUrl === imageUrl && (
                    <div className="absolute top-2 right-2 bg-redbook text-white p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">请输入关键词搜索图片</div>
            </div>
          )}
        </div>

        {/* 弹窗底部按钮 */}
        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {selectedImageUrl ? '已选择1张图片' : '请从搜索结果中选择一张图片'}
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedImageUrl}
              className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-redbook hover:bg-redbook-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-redbook disabled:bg-gray-400"
            >
              确认使用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebImageSearchModal; 