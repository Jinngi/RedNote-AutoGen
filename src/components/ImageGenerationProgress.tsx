import React, { useEffect, useState } from 'react';

interface ImageGenerationProgressProps {
  progress: number;
  totalSteps: number;
  status: string;
}

/**
 * 图像生成进度展示组件
 * 显示一个动画和进度条，以显示AI图像生成的进度
 */
const ImageGenerationProgress: React.FC<ImageGenerationProgressProps> = ({ 
  progress, 
  totalSteps,
  status 
}) => {
  // 计算进度百分比
  const percentage = totalSteps > 0 ? Math.round((progress / totalSteps) * 100) : 0;
  
  // 粒子动画状态
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);
  
  // 初始化粒子
  useEffect(() => {
    // 创建随机粒子
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 1,
      speed: Math.random() * 2 + 0.5
    }));
    
    setParticles(newParticles);
    
    // 动画更新循环
    const interval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          y: (particle.y + particle.speed) % 100,
          x: particle.x + (Math.random() - 0.5) * 0.5
        }))
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  // 任务状态中文显示
  const getStatusText = () => {
    switch(status) {
      case 'PENDING':
        return '等待中...';
      case 'PROCESSING':
        return '生成中...';
      case 'COMPLETED':
        return '已完成';
      case 'FAILED':
        return '生成失败';
      default:
        return '正在处理...';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden rounded-lg border border-gray-200">
      {/* 粒子动画背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-white">
        {particles.map(particle => (
          <div 
            key={particle.id}
            className="absolute rounded-full bg-blue-400 opacity-40"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              transition: 'top 0.1s linear, left 0.1s linear'
            }}
          />
        ))}
      </div>
      
      {/* 中心内容 */}
      <div className="z-10 text-center p-4">
        <div className="mb-4 text-2xl font-bold text-blue-600">AI 生成图像中</div>
        <div className="mb-6 text-gray-600">{getStatusText()}</div>
        
        {/* 进度条 */}
        <div className="w-full max-w-md bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* 进度百分比 */}
        <div className="mt-2 text-gray-700">
          {percentage}% ({progress}/{totalSteps})
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationProgress; 