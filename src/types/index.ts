// 小红书文案与图片结果的类型定义
export interface RedNoteResult {
  id: string;
  content: string;
  imageUrl: string;
}

// 生成请求参数的类型定义
export interface GenerateParams {
  context: string;
  theme: string;
  description: string;
}

// 文案与图片API响应的类型定义
export interface GenerateResponse {
  results: RedNoteResult[];
  success: boolean;
  message?: string;
}

export interface AppState {
  results: RedNoteResult[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
} 