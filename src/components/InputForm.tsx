import React, { useState } from 'react';

interface InputFormProps {
  onGenerate: (context: string, theme: string, description: string) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [context, setContext] = useState('');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(context, theme, description);
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
        
        <div className="mb-6">
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