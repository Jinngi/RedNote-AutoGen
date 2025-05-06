// 接口定义
export interface GenerateResult {
  id: string;
  content: string;
  imageUrl: string;
}

/**
 * 生成小红书文案和图片
 * @param context 上下文内容
 * @param theme 主题
 * @param description 文案描述
 * @returns 生成的结果
 */
export async function generateContent(
  context: string,
  theme: string,
  description: string
): Promise<GenerateResult[]> {
  try {
    // 这里模拟API调用，实际项目中应该连接到真实的API
    // const response = await fetch('/api/generate', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ context, theme, description }),
    // });
    
    // if (!response.ok) {
    //   throw new Error('API请求失败');
    // }
    
    // return await response.json();

    // 模拟响应，生成一些示例结果
    return mockGenerateResults(context, theme, description);
  } catch (error) {
    console.error('生成内容时出错:', error);
    throw error;
  }
}

/**
 * 模拟生成结果（用于开发测试）
 */
function mockGenerateResults(
  context: string,
  theme: string,
  description: string
): GenerateResult[] {
  // 生成2-4个随机结果
  const count = Math.floor(Math.random() * 3) + 2;
  const results: GenerateResult[] = [];

  const placeholderImages = [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    'https://images.unsplash.com/photo-1504297050568-910d24c426d3', 
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f'
  ];

  const generateRandomText = () => {
    const templates = [
      `#${theme}#\n\n${context.substring(0, 20)}...\n\n${description}\n\n今天给大家分享一个超赞的小技巧！✨\n\n${Math.random().toString(36).substring(2, 10)}`,
      `#${theme}分享#\n\n你知道吗？${context.substring(0, 15)}...\n\n${description}\n\n关注我，了解更多！❤️`,
      `#${theme}攻略#\n\n分享一下我的${theme}心得\n\n${context.substring(0, 15)}\n\n${description}\n\n喜欢请点赞支持一下吧~`,
      `#${theme}好物推荐#\n\n相信很多人都有这样的疑惑...\n\n${context.substring(0, 20)}\n\n${description}\n\n记得关注我，不定期分享更多干货！`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  };

  for (let i = 0; i < count; i++) {
    results.push({
      id: `${Date.now()}-${i}`,
      content: generateRandomText(),
      imageUrl: placeholderImages[i % placeholderImages.length],
    });
  }

  return results;
} 