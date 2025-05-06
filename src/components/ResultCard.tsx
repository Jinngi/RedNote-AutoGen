import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

interface ResultCardProps {
  id: string;
  content: string;
  imageUrl: string;
  onDownload: (id: string) => void;
  onContentUpdate?: (id: string, newContent: string) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ 
  id, 
  content, 
  imageUrl, 
  onDownload,
  onContentUpdate 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

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
          content: editedContent, // 使用编辑后的内容
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
          {isEditing ? (
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg min-h-[200px] text-text-dark focus:outline-none focus:ring-2 focus:ring-redbook"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              autoFocus
            />
          ) : (
            <p className="text-text-dark whitespace-pre-line">{editedContent}</p>
          )}
        </div>
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