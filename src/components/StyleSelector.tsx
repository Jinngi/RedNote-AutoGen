import React, { useState } from 'react';

interface StyleSelectorProps {
  cardStyle: string;
  colorTheme: string;
  cardRatio: string;
  onStyleChange: (style: string) => void;
  onColorThemeChange: (theme: string) => void;
  onCardRatioChange: (ratio: string) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({
  cardStyle,
  colorTheme,
  cardRatio,
  onStyleChange,
  onColorThemeChange,
  onCardRatioChange
}) => {
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [showCustom, setShowCustom] = useState(cardRatio === 'custom');
  
  const handleCustomSizeSubmit = () => {
    if (customWidth && customHeight) {
      const customRatio = `custom:${customWidth}:${customHeight}`;
      onCardRatioChange(customRatio);
    }
  };
  
  const handleRatioChange = (ratioId: string) => {
    if (ratioId === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onCardRatioChange(ratioId);
    }
  };
  
  return (
    <div className="card">
      <h3 className="text-lg font-medium mb-4 text-text-dark">调整卡片样式</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-text-dark text-sm">
            卡片排布风格
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'standard', name: '标准布局' },
              { id: 'left-image', name: '左图右文' },
              { id: 'right-image', name: '右图左文' },
              { id: 'overlay', name: '卡片叠加' },
              { id: 'collage', name: '拼贴风格' },
              { id: 'magazine', name: '杂志风格' },
              { id: 'text-only', name: '无图纯文' }
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => onStyleChange(style.id)}
                className={`py-2 px-3 text-sm rounded-md transition-colors ${
                  cardStyle === style.id
                    ? 'bg-redbook text-white'
                    : 'bg-gray-100 text-text-medium hover:bg-gray-200'
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block mb-2 text-text-dark text-sm">
            配色风格
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'redbook', name: '小红书粉', color: '#ff2e51' },
              { id: 'nature', name: '自然绿', color: '#4caf50' },
              { id: 'ocean', name: '海洋蓝', color: '#2196f3' },
              { id: 'sunset', name: '日落橙', color: '#ff9800' },
              { id: 'elegant', name: '高级灰', color: '#9e9e9e' },
              { id: 'dark', name: '暗黑模式', color: '#263238' },
              { id: 'gradient', name: '柔和渐变', color: 'linear-gradient(135deg, #ff758c, #ff7eb3)' }
            ].map((theme) => (
              <div 
                key={theme.id}
                onClick={() => onColorThemeChange(theme.id)}
                className={`flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer transition-colors ${
                  colorTheme === theme.id
                    ? 'bg-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ 
                    background: theme.color,
                    border: colorTheme === theme.id ? '2px solid #333' : 'none'
                  }}
                ></div>
                <span className="text-sm">{theme.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block mb-2 text-text-dark text-sm">
            卡片比例
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              { id: '1:1', name: '正方形', width: 'w-10', height: 'h-10' },
              { id: '4:5', name: '竖图', width: 'w-8', height: 'h-10' },
              { id: '4:6', name: '长图', width: 'w-7', height: 'h-10' },
              { id: '3:4', name: '竖版', width: 'w-7.5', height: 'h-10' },
              { id: '9:16', name: '全面屏', width: 'w-6', height: 'h-10' },
              { id: '16:9', name: '横幅', width: 'w-10', height: 'h-6' },
              { id: 'custom', name: '自定义', width: 'w-8', height: 'h-8' }
            ].map((ratio) => (
              <div 
                key={ratio.id}
                onClick={() => handleRatioChange(ratio.id)}
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <div 
                  className={`${ratio.width} ${ratio.height} border-2 rounded-md ${
                    cardRatio.startsWith(ratio.id)
                      ? 'border-redbook'
                      : 'border-gray-300'
                  }`}
                ></div>
                <span className="text-xs text-text-medium">{ratio.name}</span>
              </div>
            ))}
          </div>
          
          {showCustom && (
            <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50">
              <p className="text-sm text-text-medium mb-2">自定义宽高比例</p>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="text-xs text-text-medium mb-1 block">宽度</label>
                  <input 
                    type="number" 
                    min="1"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded text-sm"
                    placeholder="例如：4"
                  />
                </div>
                <div className="self-end pb-1">
                  <span className="text-text-medium">:</span>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-text-medium mb-1 block">高度</label>
                  <input 
                    type="number" 
                    min="1"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded text-sm"
                    placeholder="例如：5"
                  />
                </div>
                <button
                  onClick={handleCustomSizeSubmit}
                  disabled={!customWidth || !customHeight}
                  className={`py-1 px-2 text-sm rounded self-end ${
                    !customWidth || !customHeight
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-redbook text-white hover:bg-red-700'
                  }`}
                >
                  应用
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleSelector; 