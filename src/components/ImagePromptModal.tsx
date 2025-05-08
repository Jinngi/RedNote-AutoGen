import React, { useState, useEffect } from 'react';

interface ImagePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string, style: string) => void;
  defaultPrompt: string;
}

const ImagePromptModal: React.FC<ImagePromptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultPrompt
}) => {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [style, setStyle] = useState("写实风格");

  // 当弹窗打开时，设置默认提示词
  useEffect(() => {
    if (isOpen) {
      setPrompt(defaultPrompt);
    }
  }, [isOpen, defaultPrompt]);

  // 定义可选的风格
  const availableStyles = [
    "写实风格",
    "动漫风格",
    "油画风格",
    "水彩画风格",
    "小红书风格",
    "科幻风格",
    "赛博朋克风格",
    "复古风格"
  ];

  // 如果弹窗未打开，不渲染任何内容
  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(prompt, style);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* 弹窗头部 */}
        <div className="bg-redbook text-white px-4 py-3 flex justify-between items-center">
          <h3 className="font-medium text-lg">修改AI生图提示词</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>

        {/* 弹窗内容 */}
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              提示词
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-redbook focus:border-redbook"
              rows={4}
              placeholder="请输入生成图片的提示词..."
            />
            <p className="mt-1 text-xs text-gray-500">
              提示：详细的描述可以帮助AI生成更符合预期的图片
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              图像风格
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-redbook focus:border-redbook"
            >
              {availableStyles.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 弹窗底部按钮 */}
        <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-redbook hover:bg-redbook-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-redbook"
          >
            生成图片
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePromptModal; 