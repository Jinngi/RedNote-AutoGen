import React from 'react';
import logger, { LogEntry } from '@/utils/logger';
import { saveAs } from 'file-saver';

interface LogPanelProps {
  logs: LogEntry[];
}

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const getLogTypeClass = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  };

  // 自动滚动到底部
  const logContainerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // 清除日志
  const handleClearLogs = () => {
    logger.clear();
  };

  // 下载日志
  const handleDownloadLogs = () => {
    if (logs.length === 0) return;

    // 将日志格式化为文本
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n');

    // 创建一个Blob对象
    const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
    
    // 使用FileSaver下载文件
    saveAs(blob, `rednote-logs-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.txt`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-700">运行日志</h3>
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadLogs}
            disabled={logs.length === 0}
            className={`px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 ${logs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            下载日志
          </button>
          <button 
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className={`px-2 py-1 text-xs rounded bg-gray-500 text-white hover:bg-gray-600 ${logs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            清空日志
          </button>
        </div>
      </div>
      
      <div 
        ref={logContainerRef}
        className="flex-1 overflow-auto p-3 bg-gray-50 font-mono text-sm"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            暂无日志记录
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="mb-1 pb-1 border-b border-gray-100">
              <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
              <span className={getLogTypeClass(log.type)}>
                {log.type.toUpperCase()}:
              </span>{' '}
              <span>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogPanel; 