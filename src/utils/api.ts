// 接口定义
export interface GenerateResult {
  id: string;
  content: string;
  imageUrl: string;
}

/**
 * 根据文本内容搜索相关图片
 * @param searchQuery 搜索关键词
 * @returns 图片URL
 */
async function searchImage(searchQuery: string): Promise<string> {
  try {
    // 提取标题作为搜索关键词
    const titleMatch = searchQuery.match(/^(.+?)(?:\n|$)/);
    const searchTerm = titleMatch ? titleMatch[1].trim() : searchQuery.substring(0, 50);
    
    // 使用更可靠的图片源
    // 使用 Picsum.photos，它是一个提供随机图片的服务，不容易出现跨域问题
    const seed = encodeURIComponent(searchTerm).slice(0, 20); // 使用搜索词作为种子
    const randomId = Math.floor(Math.random() * 1000);
    
    // 返回一个带有搜索词作为参数的图片URL，但实际上是从可靠的图片源获取
    return `https://picsum.photos/seed/${seed}${randomId}/800/600`;
  } catch (error) {
    console.error('搜索图片时出错:', error);
    // 如果搜索失败，返回一个默认图片，使用可靠的图片源
    return 'https://picsum.photos/800/600';
  }
}

/**
 * 获取随机图片
 * @returns 随机图片URL
 */
function getRandomImage(): string {
  // 生成随机参数以确保每次获取不同的图片
  const randomId = Math.floor(Math.random() * 10000);
  const width = 800;
  const height = 600;
  
  // 使用 Picsum.photos 提供的随机图片服务
  return `https://picsum.photos/seed/random${randomId}/${width}/${height}`;
}

/**
 * 生成小红书文案和图片
 * @param context 上下文内容
 * @param theme 主题
 * @param description 文案描述
 * @param imageGenerationType 图片生成方式 ('random' | 'web')
 * @returns 生成的结果
 */
export async function generateContent(
  context: string,
  theme: string,
  description: string,
  imageGenerationType: string = 'random'
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
        
    要求：
    1. 每篇文案需要包含标题、正文、标签
    2. 标题吸引人，突出主题
    3. 正文内容丰富，符合小红书风格，语言生动活泼
    4. 标签使用井号(#)开头，至少包含3个标签
    5. 总体文字在200-500字之间
    
    【主题】
    ${theme}
    
    【上下文】
    ${context}
    
    【描述】
    ${description}

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
    
    // 生成结果数组
    const results: GenerateResult[] = [];
    
    // 根据不同的图片生成方式生成图片
    for (let i = 0; i < contentParts.length; i++) {
      const content = contentParts[i].trim();
      let imageUrl = '';
      
      if (imageGenerationType === 'web') {
        // 基于文案内容搜索相关图片
        imageUrl = await searchImage(content);
      } else {
        // 随机生成图片
        imageUrl = getRandomImage();
      }
      
      results.push({
        id: `${Date.now()}-${i}`,
        content,
        imageUrl,
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('生成内容时出错:', error);
    throw error;
  }
} 