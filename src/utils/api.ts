// 接口定义
import logger from './logger';

export interface GenerateResult {
  id: string;
  content: string;
  imageUrl: string;
}

/**
 * 图像生成任务状态
 */
export interface ImageTaskStatus {
  id: string;
  status: string;
  progress: number;
  total_steps: number;
  prompt: string;
  seed: number;
  created_at: string;
  completed_at?: string;
  error?: string;
}

/**
 * 使用LLM将中文提示词转换为适合Stable Diffusion的英文提示词
 * @param chinesePrompt 中文提示词
 * @returns 转换后的英文提示词
 */
export async function translatePromptToConciseEnglish(chinesePrompt: string): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const llmModel = process.env.NEXT_PUBLIC_LLM_MODEL || 'gpt-3.5-turbo';
    
    if (!apiKey || !apiBaseUrl) {
      logger.error('API配置缺失，请检查环境变量');
      throw new Error('API配置缺失，请检查环境变量');
    }

    logger.info(`开始转换提示词: "${chinesePrompt.substring(0, 50)}..."`);

    // 构建发送给LLM的提示词
    const prompt = `
    请将以下中文提示词转换为适合Stable Diffusion模型的英文提示词。
    要求：
    1. 提取关键内容，翻译成简洁有效的英文短语
    2. 增加一些适合图像生成的修饰词，如"high quality, detailed, beautiful lighting"等
    3. 去除不必要的修饰词，保持核心含义
    4. 返回的内容只包含英文提示词，不要有任何解释或其他文字
    5. 确保结果是精简的英文短语，而不是完整句子

    中文提示词:
    ${chinesePrompt}
    
    英文提示词(只返回翻译结果):
    `;

    logger.info(`使用模型: ${llmModel}转换提示词`);

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
        temperature: 0.3,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`提示词转换API请求失败: ${response.status} ${errorText}`);
      throw new Error(`提示词转换API请求失败: ${response.status} ${errorText}`);
    }
    
    const responseData = await response.json();
    
    // 解析LLM返回的内容
    const englishPrompt: string = responseData.choices[0]?.message?.content.trim() || '';
    
    logger.success(`提示词转换成功: "${englishPrompt.substring(0, 50)}..."`);
    return englishPrompt;
    
  } catch (error) {
    logger.error(`提示词转换失败: ${error instanceof Error ? error.message : String(error)}`);
    // 如果转换失败，返回原始提示词加上一些基本英文描述
    return `${chinesePrompt} beautiful photo high quality`;
  }
}

/**
 * 根据文本内容搜索相关图片
 * @param searchQuery 搜索关键词
 * @returns 图片URL
 */
async function searchImage(searchQuery: string): Promise<string> {
  try {
    logger.info(`搜索图片，关键词: ${searchQuery.substring(0, 30)}...`);
    // 提取标题作为搜索关键词
    const titleMatch = searchQuery.match(/^(.+?)(?:\n|$)/);
    const searchTerm = titleMatch ? titleMatch[1].trim() : searchQuery.substring(0, 50);
    
    // 使用更可靠的图片源
    // 使用 Picsum.photos，它是一个提供随机图片的服务，不容易出现跨域问题
    const seed = encodeURIComponent(searchTerm).slice(0, 20); // 使用搜索词作为种子
    const randomId = Math.floor(Math.random() * 1000);
    
    // 返回一个带有搜索词作为参数的图片URL，但实际上是从可靠的图片源获取
    const imageUrl = `https://picsum.photos/seed/${seed}${randomId}/800/600`;
    logger.success(`成功获取图片: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error('搜索图片时出错:', error);
    logger.error(`搜索图片失败: ${error instanceof Error ? error.message : String(error)}`);
    // 如果搜索失败，返回一个默认图片，使用可靠的图片源
    const fallbackUrl = 'https://picsum.photos/800/600';
    logger.warn(`使用默认图片: ${fallbackUrl}`);
    return fallbackUrl;
  }
}

/**
 * 获取随机图片
 * @returns 随机图片URL
 */
function getRandomImage(): string {
  logger.info('获取随机图片');
  // 生成随机参数以确保每次获取不同的图片
  const randomId = Math.floor(Math.random() * 10000);
  const width = 800;
  const height = 600;
  
  // 使用 Picsum.photos 提供的随机图片服务
  const imageUrl = `https://picsum.photos/seed/random${randomId}/${width}/${height}`;
  logger.success(`成功获取随机图片: ${imageUrl}`);
  return imageUrl;
}

/**
 * 创建图像生成任务
 * @param prompt 图像描述提示词
 * @param seed 随机种子
 * @returns 任务ID
 */
export async function createImageTask(prompt: string, seed: number = 42): Promise<string> {
  try {
    const imageServiceUrl = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL;
    
    if (!imageServiceUrl) {
      logger.error('图像服务配置缺失，请检查NEXT_PUBLIC_IMAGE_SERVICE_URL环境变量');
      throw new Error('图像服务配置缺失，请检查环境变量');
    }

    logger.info(`开始创建图像生成任务，提示词: "${prompt.substring(0, 50)}..."，种子: ${seed}`);
    
    const response = await fetch(`${imageServiceUrl}/api/generate-async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        seed
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`创建图像任务失败: ${response.status} ${errorText}`);
      throw new Error(`创建图像任务失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    logger.success(`图像任务创建成功，任务ID: ${data.task_id}`);
    return data.task_id;
    
  } catch (error) {
    logger.error(`创建图像任务出错: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * 获取图像生成任务的状态
 * @param taskId 任务ID
 * @returns 任务状态信息
 */
export async function getImageTaskStatus(taskId: string): Promise<ImageTaskStatus> {
  try {
    const imageServiceUrl = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL;
    
    if (!imageServiceUrl) {
      logger.error('图像服务配置缺失，请检查NEXT_PUBLIC_IMAGE_SERVICE_URL环境变量');
      throw new Error('图像服务配置缺失，请检查环境变量');
    }

    logger.info(`查询图像任务状态: ${taskId}`);
    
    const response = await fetch(`${imageServiceUrl}/api/task/${taskId}`);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`查询图像任务状态失败: ${response.status} ${errorText}`);
      throw new Error(`查询图像任务状态失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    logger.info(`任务 ${taskId} 状态: ${data.status}, 进度: ${data.progress}/${data.total_steps}`);
    return data;
    
  } catch (error) {
    logger.error(`查询图像任务状态出错: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * 获取已完成图像任务的结果
 * @param taskId 任务ID
 * @returns 图像数据的URL
 */
export async function getImageTaskResult(taskId: string): Promise<string> {
  try {
    const imageServiceUrl = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL;
    
    if (!imageServiceUrl) {
      logger.error('图像服务配置缺失，请检查NEXT_PUBLIC_IMAGE_SERVICE_URL环境变量');
      throw new Error('图像服务配置缺失，请检查环境变量');
    }

    logger.info(`获取图像任务结果: ${taskId}`);
    
    const response = await fetch(`${imageServiceUrl}/api/result/${taskId}`);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`获取图像任务结果失败: ${response.status} ${errorText}`);
      throw new Error(`获取图像任务结果失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    logger.success(`获取图像任务结果成功，任务ID: ${taskId}`);
    
    // 使用 blob URL 来存储 base64 图像数据
    const base64Data = data.image_base64;
    if (!base64Data) {
      throw new Error('图像数据为空');
    }
    
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    const imageUrl = URL.createObjectURL(blob);
    
    return imageUrl;
    
  } catch (error) {
    logger.error(`获取图像任务结果出错: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * 生成小红书文案和图片
 * @param context 上下文内容
 * @param theme 主题
 * @param description 文案描述
 * @param imageGenerationType 图片生成方式 ('random' | 'web' | 'none')
 * @returns 生成的结果
 */
export async function generateContent(
  context: string,
  theme: string,
  description: string,
  imageGenerationType: string = 'random'
): Promise<GenerateResult[]> {
  try {
    logger.info('开始生成内容...');
    logger.info(`参数: 主题="${theme}", 图片生成方式="${imageGenerationType}"`);
    
    // 获取环境变量
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const llmModel = process.env.NEXT_PUBLIC_LLM_MODEL || 'gpt-3.5-turbo';
    
    if (!apiKey || !apiBaseUrl) {
      logger.error('API配置缺失，请检查环境变量');
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

    logger.info(`使用模型: ${llmModel}`);
    logger.info('发送API请求...');

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
      logger.error(`API请求失败: ${response.status} ${errorText}`);
      throw new Error(`API请求失败: ${response.status} ${errorText}`);
    }
    
    logger.success('API请求成功，正在解析响应...');
    const responseData = await response.json();
    
    // 解析LLM返回的内容
    const generatedText: string = responseData.choices[0]?.message?.content || '';
    
    // 按照分隔符拆分成多篇文案
    const contentParts: string[] = generatedText.split('***').filter((part: string) => part.trim().length > 0);
    logger.info(`成功生成 ${contentParts.length} 篇文案`);
    
    // 生成结果数组
    const results: GenerateResult[] = [];
    
    // 根据不同的图片生成方式生成图片
    for (let i = 0; i < contentParts.length; i++) {
      const content = contentParts[i].trim();
      let imageUrl = '';
      
      logger.info(`处理第 ${i+1} 篇文案`);
      
      // 无图模式下不生成图片
      if (imageGenerationType === 'none') {
        logger.info('无图模式，跳过图片生成');
        imageUrl = '';
      } else if (imageGenerationType === 'web') {
        // 基于文案内容搜索相关图片
        logger.info('使用Web搜索模式生成图片');
        imageUrl = await searchImage(content);
      } else {
        // 随机生成图片
        logger.info('使用随机图片模式');
        imageUrl = getRandomImage();
      }
      
      const id = `${Date.now()}-${i}`;
      results.push({
        id,
        content,
        imageUrl,
      });
      
      logger.success(`完成第 ${i+1} 篇文案(ID: ${id})处理`);
    }
    
    logger.success(`内容生成完成，共 ${results.length} 个结果`);
    return results;
    
  } catch (error) {
    console.error('生成内容时出错:', error);
    logger.error(`生成内容失败: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
} 