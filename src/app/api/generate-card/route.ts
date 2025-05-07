import { NextRequest, NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';

// 添加CORS头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 添加OPTIONS方法处理CORS预检请求
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 200, 
    headers: corsHeaders
  });
}

export async function POST(req: NextRequest) {
  try {
    const { id, content, imageUrl, cardStyle, colorTheme, cardRatio } = await req.json();

    if (!id || !content) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 生成卡片的 HTML
    const cardHtml = await generateCardHtml(content, imageUrl, cardStyle, colorTheme, cardRatio);
    
    // 使用 Puppeteer 将 HTML 转换为图片
    const imageBuffer = await convertHtmlToImage(cardHtml, cardRatio, imageUrl);

    // 返回图片数据，添加CORS头
    return new NextResponse(imageBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="rednote-card-${id}.png"`,
      },
    });
  } catch (error) {
    console.error('生成卡片时出错:', error);
    return NextResponse.json(
      { error: '生成卡片时出错', details: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * 生成美观的卡片 HTML
 */
async function generateCardHtml(
  content: string, 
  imageUrl: string, 
  cardStyle: string = 'standard', 
  colorTheme: string = 'redbook', 
  cardRatio: string = '4:5'
): Promise<string> {
  // 使用 OpenAI 或其他 LLM 生成更美观的 HTML
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const llmModel = process.env.NEXT_PUBLIC_LLM_MODEL || 'gpt-3.5-turbo';
  
  if (!apiKey || !apiBaseUrl) {
    throw new Error('API配置缺失，请检查环境变量');
  }

  // 提取标题和正文
  const lines = content.split('\n').filter(line => line.trim());
  const title = lines[0] || '小红书文案';
  const body = lines.slice(1).join('\n');
  
  // 标签提取
  const tagRegex = /#[^\s#]+/g;
  const tags = content.match(tagRegex) || [];
  
  // 获取卡片比例数值
  let aspectRatio = '4/5';
  switch (cardRatio) {
    case '1:1':
      aspectRatio = '1/1';
      break;
    case '4:5':
      aspectRatio = '4/5';
      break;
    case '4:6':
      aspectRatio = '4/6';
      break;
    default:
      aspectRatio = '4/5';
  }
  
  // 判断是否为无图模式
  const isTextOnly = cardStyle === 'text-only' || !imageUrl;
  
  // 构建提示词
  const prompt = `
  你是一个专业的小红书卡片设计师。请根据以下内容生成一个精美的小红书卡片 HTML 代码。
  卡片应该符合以下要求：
  
  1. 设计精美，符合小红书风格
  2. 使用现代CSS样式，字体应当美观
  3. 整体设计温馨、有活力
  4. 布局合理，适合保存为图片
  5. 最终尺寸应为 800px 宽，高度按比例设置
  6. 所有样式必须内联在HTML中，不使用外部资源
  
  卡片内容:
  ===
  标题: ${title}
  正文: ${body}
  标签: ${tags.join(' ')}
  ${imageUrl && !isTextOnly ? `图片URL: ${imageUrl}` : '无图模式'}
  ===
  
  卡片样式要求:
  ===
  排布风格: ${cardStyle} (${getStyleDescription(cardStyle)})
  配色风格: ${colorTheme} (${getColorDescription(colorTheme)})
  卡片比例: ${aspectRatio}
  ===
  
  ${isTextOnly ? '这是无图模式，请创建一个纯文字的精美卡片设计，注重排版和字体设计。' : ''}
  
  只需要返回完整的 HTML 代码，不需要解释。确保代码包含所有必要的 CSS 样式，并且能直接在浏览器中渲染。
  `;

  // 调用 LLM API
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
      max_tokens: 2000
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API请求失败: ${response.status} ${errorText}`);
  }
  
  const responseData = await response.json();
  
  // 解析 LLM 返回的内容
  const generatedHtml: string = responseData.choices[0]?.message?.content || '';
  
  // 清理 HTML 代码（如果生成的代码包含 ```html 这样的标记）
  const cleanedHtml = generatedHtml
    .replace(/```html/g, '')
    .replace(/```/g, '')
    .trim();
  
  return cleanedHtml;
}

/**
 * 将 HTML 转换为图片
 */
async function convertHtmlToImage(html: string, cardRatio: string = '4:5', imageUrl?: string): Promise<Buffer> {
  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-web-security', // 禁用Web安全策略以绕过CORS限制
      '--allow-file-access-from-files' // 允许从文件访问文件
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // 忽略页面错误
    page.on('error', err => {
      console.error('页面错误:', err);
    });
    
    // 拦截请求，处理跨域图片问题
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (req.resourceType() === 'image' && (
          req.url().includes('picsum.photos') || 
          (imageUrl && req.url() === imageUrl)
        )) {
        // 对于外部图片，我们可以尝试绕过CORS
        req.continue({
          headers: {
            ...req.headers(),
            'Origin': 'https://picsum.photos',
            'Referer': 'https://picsum.photos/'
          }
        });
      } else {
        req.continue();
      }
    });
    
    // 设置页面内容
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // 获取内容的尺寸
    const contentSize = await page.evaluate((ratio) => {
      const body = document.body;
      const width = 800; // 固定宽度
      
      // 根据比例计算高度
      let height;
      switch (ratio) {
        case '1:1':
          height = width;
          break;
        case '4:5':
          height = width * (5/4);
          break;
        case '4:6':
          height = width * (6/4);
          break;
        default:
          height = width * (5/4);
      }
      
      return { width, height };
    }, cardRatio);
    
    // 设置视窗大小
    await page.setViewport({
      width: contentSize.width,
      height: contentSize.height,
      deviceScaleFactor: 2 // 生成高清图片
    });
    
    // 生成截图
    const imageBuffer = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: contentSize.width,
        height: contentSize.height
      },
      omitBackground: false
    });
    
    return imageBuffer;
  } finally {
    await browser.close();
  }
}

/**
 * 获取样式描述
 */
function getStyleDescription(style: string): string {
  switch (style) {
    case 'standard':
      return '标准布局，图片在上，文字在下';
    case 'left-image':
      return '左图右文，图片在左侧，文字在右侧';
    case 'right-image':
      return '右图左文，图片在右侧，文字在左侧';
    case 'overlay':
      return '卡片叠加，文字覆盖在图片上，带有渐变遮罩';
    case 'collage':
      return '拼贴风格，多块内容区域拼贴式布局';
    case 'magazine':
      return '杂志风格，类似杂志排版的精致布局';
    case 'text-only':
      return '无图纯文，只有文字的艺术排版卡片';
    default:
      return '标准布局';
  }
}

/**
 * 获取配色描述
 */
function getColorDescription(theme: string): string {
  switch (theme) {
    case 'redbook':
      return '小红书粉色调，以粉红色为主';
    case 'nature':
      return '自然绿色调，以绿色为基调的清新自然风格';
    case 'ocean':
      return '海洋蓝色调，以蓝色为基调的冷静优雅风格';
    case 'sunset':
      return '日落橙色调，以橙色为基调的温暖活力风格';
    case 'elegant':
      return '高级灰色调，以灰色为基调的简约高级风格';
    case 'dark':
      return '暗黑模式，深色背景的高对比度风格';
    case 'gradient':
      return '柔和渐变，柔和的双色渐变背景';
    default:
      return '小红书粉色调';
  }
} 