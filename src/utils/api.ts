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
    // 获取环境变量
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const llmModel = process.env.NEXT_PUBLIC_LLM_MODEL || 'gpt-3.5-turbo';
    
    if (!apiKey || !apiBaseUrl) {
      throw new Error('API配置缺失，请检查环境变量');
    }

    // 构建发送给LLM的提示词
    const prompt = `
    请你帮我生成三篇小红书风格的文案，每篇文案之间用三个连续的星号 *** 分隔。
    主题：${theme}
    上下文：${context}
    描述：${description}
    
    要求：
    1. 每篇文案需要包含标题、正文、标签
    2. 标题吸引人，突出主题
    3. 正文内容丰富，符合小红书风格，语言生动活泼
    4. 标签使用井号(#)开头，至少包含3个标签
    5. 总体文字在200-500字之间
    `;

    // 调用LLM API
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: llmModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} ${errorText}`);
    }
    
    const responseData = await response.json();
    
    // 解析LLM返回的内容
    const generatedText: string = responseData.choices[0]?.message?.content || '';
    
    // 按照分隔符拆分成多篇文案
    const contentParts: string[] = generatedText.split('***').filter((part: string) => part.trim().length > 0);
    
    // 生成随机图片URL
    const placeholderImages: string[] = [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      'https://images.unsplash.com/photo-1504297050568-910d24c426d3', 
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f'
    ];
    
    // 转换成结果格式
    return contentParts.map((content: string, index: number) => ({
      id: `${Date.now()}-${index}`,
      content: content.trim(),
      imageUrl: placeholderImages[index % placeholderImages.length],
    }));
    
  } catch (error) {
    console.error('生成内容时出错:', error);
    throw error;
  }
} 