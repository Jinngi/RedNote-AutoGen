import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

interface ResultCardProps {
  id: string;
  content: string;
  imageUrl: string;
  onDownload: (id: string) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ id, content, imageUrl, onDownload }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

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
          content,
          imageUrl
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

  return (
    <div className="card mb-6 overflow-hidden">
      <div ref={cardRef} className="p-4 bg-white rounded-lg">
        <div className="mb-4">
          <img 
            src={imageUrl} 
            alt="生成的图片" 
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
        <div className="mt-4">
          <p className="text-text-dark whitespace-pre-line">{content}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={handleDownload}
          className="btn-secondary"
        >
          下载图片
        </button>
        <button
          onClick={handleDownloadFullCard}
          disabled={isGeneratingCard}
          className={`btn-primary ${isGeneratingCard ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isGeneratingCard ? '生成中...' : '下载完整卡片'}
        </button>
      </div>
    </div>
  );
};

export default ResultCard; 