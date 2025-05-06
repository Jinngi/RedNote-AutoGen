import React, { useRef } from 'react';
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
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleDownload}
          className="btn-secondary"
        >
          下载图片
        </button>
      </div>
    </div>
  );
};

export default ResultCard; 