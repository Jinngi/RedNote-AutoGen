import React, { useState } from 'react';

interface InputFormProps {
  onGenerate: (context: string, theme: string, description: string, imageGenerationType: string, cardStyle: string, colorTheme: string, cardRatio: string, fontFamily: string, fontSize: string, contentMode: string) => void;
  isLoading: boolean;
}

interface TextStyle {
  name: string;
  description: string;
  value: string;
}

const textStyles: TextStyle[] = [
  { name: '活力青春', description: '充满朝气的年轻化表达', value: 'energetic' },
  { name: '优雅成熟', description: '沉稳大气的专业风格', value: 'elegant' },
  { name: '轻松幽默', description: '俏皮有趣的表达方式', value: 'humorous' },
  { name: '文艺清新', description: '富有诗意的文艺风格', value: 'literary' },
];

const lengthOptions = [
  { name: '短文(200字以内)', value: 200 },
  { name: '中等(400字左右)', value: 400 },
  { name: '长文(600字以上)', value: 600 },
];

const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [context, setContext] = useState('');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [imageGenerationType, setImageGenerationType] = useState('random');
  const [cardStyle, setCardStyle] = useState('text-only');
  const [colorTheme, setColorTheme] = useState('redbook');
  const [cardRatio, setCardRatio] = useState('4:5');
  const [fontFamily, setFontFamily] = useState('sans');
  const [fontSize, setFontSize] = useState('md');
  const [contentMode, setContentMode] = useState('detailed');
  const [selectedStyle, setSelectedStyle] = useState<string>('energetic');
  const [targetLength, setTargetLength] = useState<number>(400);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onGenerate(
        context,
        theme,
        description,
        imageGenerationType,
        cardStyle,
        colorTheme,
        cardRatio,
        fontFamily,
        fontSize,
        contentMode
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 主要输入区域 */}
      <div className="space-y-4">
        <div>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="请输入你想要创作的内容..."
            className="w-full px-4 py-3 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-black focus:bg-white transition-colors"
            rows={4}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="主题标签"
            className="px-4 py-2 text-sm bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-black focus:bg-white transition-colors"
            required
          />
          
          <select
            id="contentMode"
            value={contentMode}
            onChange={(e) => setContentMode(e.target.value)}
            className="px-4 py-2 text-sm bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-black focus:bg-white transition-colors appearance-none"
            required
          >
            <option value="original">原创</option>
            <option value="polish">润色</option>
            <option value="concise">简短</option>
            <option value="detailed">详细</option>
          </select>
        </div>

        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="描述你希望的文案风格..."
          className="w-full px-4 py-3 text-sm bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-black focus:bg-white transition-colors"
          rows={2}
          required
        />

        {/* 隐藏的必要字段 */}
        <input type="hidden" name="imageGenerationType" value={imageGenerationType} />
        <input type="hidden" name="cardStyle" value={cardStyle} />
        <input type="hidden" name="colorTheme" value={colorTheme} />
        <input type="hidden" name="cardRatio" value={cardRatio} />
        <input type="hidden" name="fontFamily" value={fontFamily} />
        <input type="hidden" name="fontSize" value={fontSize} />

        {/* 字数选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文章长度
          </label>
          <div className="grid grid-cols-3 gap-3">
            {lengthOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTargetLength(option.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition duration-200 ${
                  targetLength === option.value
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        {/* 文字风格选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文字风格
          </label>
          <div className="grid grid-cols-2 gap-3">
            {textStyles.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setSelectedStyle(style.value)}
                className={`flex flex-col items-start p-4 rounded-xl transition duration-200 ${
                  selectedStyle === style.value
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-medium">{style.name}</span>
                <span className="text-sm opacity-80 mt-1">{style.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 提交按钮 */}
      <button 
        type="submit"
        className="hidden"
        disabled={isLoading}
      >
        提交
      </button>
    </form>
  );
};

export default InputForm; 