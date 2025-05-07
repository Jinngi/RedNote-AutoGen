// 日志类型定义
export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

// 创建一个事件发射器类，用于日志事件订阅
class EventEmitter {
  private events: Record<string, Function[]> = {};

  on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }

  off(event: string, listener: Function) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}

// 日志管理器
class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000; // 最大保存的日志数量
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  // 获取所有日志
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // 生成日志ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // 添加日志
  private addLog(message: string, type: LogEntry['type']): LogEntry {
    const newLog: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };

    this.logs.push(newLog);
    
    // 如果日志数量超过上限，删除最旧的日志
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // 触发日志更新事件
    this.emitter.emit('log', newLog);
    this.emitter.emit('logsUpdated', this.logs);
    
    return newLog;
  }

  // 记录信息日志
  info(message: string): LogEntry {
    return this.addLog(message, 'info');
  }

  // 记录警告日志
  warn(message: string): LogEntry {
    return this.addLog(message, 'warning');
  }

  // 记录错误日志
  error(message: string): LogEntry {
    return this.addLog(message, 'error');
  }

  // 记录成功日志
  success(message: string): LogEntry {
    return this.addLog(message, 'success');
  }

  // 订阅日志更新事件
  onLogsUpdated(callback: (logs: LogEntry[]) => void) {
    return this.emitter.on('logsUpdated', callback);
  }

  // 清空日志
  clear() {
    this.logs = [];
    this.emitter.emit('logsUpdated', this.logs);
  }
}

// 创建并导出单例实例
const logger = new LoggerService();
export default logger; 