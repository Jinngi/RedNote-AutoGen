import React, { useState } from 'react';

interface InputFormProps {
  onGenerate: (context: string, theme: string, description: string, imageGenerationType: string, cardStyle: string, colorTheme: string, cardRatio: string) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [context, setContext] = useState('');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [imageGenerationType, setImageGenerationType] = useState('random');
  const [cardStyle, setCardStyle] = useState('standard');
  const [colorTheme, setColorTheme] = useState('redbook');
  const [cardRatio, setCardRatio] = useState('4:5');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(context, theme, description, imageGenerationType, cardStyle, colorTheme, cardRatio);
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4 text-text-dark">创建小红书文案与图片</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="context" className="block mb-2 text-text-dark">
            上下文内容
          </label>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="请输入创作的上下文内容，比如产品信息、目标受众等..."
            className="input-field h-36"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="theme" className="block mb-2 text-text-dark">
            主题
          </label>
          <input
            type="text"
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="输入文案主题，例如：美食、旅行、生活方式等"
            className="input-field"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block mb-2 text-text-dark">
            文案描述
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述你希望文案的风格、重点等..."
            className="input-field h-24"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="imageGenerationType" className="block mb-2 text-text-dark">
              图片生成方式
            </label>
            <select
              id="imageGenerationType"
              value={imageGenerationType}
              onChange={(e) => setImageGenerationType(e.target.value)}
              className="input-field"
              required
            >
              <option value="random">随机配图</option>
              <option value="web">网络搜图</option>
              <option value="none">无图模式</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="cardRatio" className="block mb-2 text-text-dark">
              卡片比例
            </label>
            <select
              id="cardRatio"
              value={cardRatio}
              onChange={(e) => setCardRatio(e.target.value)}
              className="input-field"
              required
            >
              <option value="1:1">正方形 (1:1)</option>
              <option value="4:5">竖图 (4:5)</option>
              <option value="4:6">长图 (4:6)</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="cardStyle" className="block mb-2 text-text-dark">
              卡片排布风格
            </label>
            <select
              id="cardStyle"
              value={cardStyle}
              onChange={(e) => setCardStyle(e.target.value)}
              className="input-field"
              required
            >
              <option value="standard">标准布局</option>
              <option value="left-image">左图右文</option>
              <option value="right-image">右图左文</option>
              <option value="overlay">卡片叠加</option>
              <option value="collage">拼贴风格</option>
              <option value="magazine">杂志风格</option>
              <option value="text-only">无图纯文</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="colorTheme" className="block mb-2 text-text-dark">
              配色风格
            </label>
            <select
              id="colorTheme"
              value={colorTheme}
              onChange={(e) => setColorTheme(e.target.value)}
              className="input-field"
              required
            >
              <option value="redbook">小红书粉</option>
              <option value="nature">自然绿</option>
              <option value="ocean">海洋蓝</option>
              <option value="sunset">日落橙</option>
              <option value="elegant">高级灰</option>
              <option value="dark">暗黑模式</option>
              <option value="gradient">柔和渐变</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          className="btn-primary w-full py-3 text-lg"
          disabled={isLoading}
        >
          {isLoading ? '生成中...' : '生成文案与图片'}
        </button>
      </form>
    </div>
  );
};

export default InputForm; 