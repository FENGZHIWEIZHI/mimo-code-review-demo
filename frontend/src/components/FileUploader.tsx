import React, { useState, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { uploadFile, analyzeCode } from '../utils/api';

const FileUploader: React.FC = () => {
  const { dispatch } = useAppContext();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file: File) => {
    // 检查文件大小（限制为10MB）
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('文件大小不能超过10MB');
      setUploadStatus('error');
      return;
    }

    // 检查文件类型
    const allowedExtensions = [
      '.js', '.ts', '.jsx', '.tsx', // JavaScript/TypeScript
      '.py', // Python
      '.java', // Java
      '.c', '.cpp', '.cc', '.h', '.hpp', // C/C++
      '.cs', // C#
      '.go', // Go
      '.rb', // Ruby
      '.php', // PHP
      '.swift', // Swift
      '.kt', '.kts', // Kotlin
      '.rs', // Rust
      '.html', '.htm', // HTML
      '.css', // CSS
      '.json', '.xml', '.yaml', '.yml', // Data formats
      '.md', '.txt' // Text formats
    ];
    
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      setErrorMessage('不支持的文件类型，请上传代码文件');
      setUploadStatus('error');
      return;
    }

    try {
      setUploadStatus('uploading');
      setErrorMessage('');

      // 上传文件
      const fileInfo = await uploadFile(file);
      
      // 读取文件内容
      const fileContent = await file.text();
      
      // 更新状态
      dispatch({ type: 'SET_CURRENT_FILE', payload: fileInfo });
      dispatch({ type: 'SET_FILE_CONTENT', payload: fileContent });
      
      setUploadStatus('analyzing');
      
      // 分析代码
      const analysisResult = await analyzeCode(fileInfo.file_id);
      
      // 更新状态
      dispatch({ type: 'SET_ISSUES', payload: analysisResult.issues });
      dispatch({ type: 'SET_CODE_SUMMARY', payload: analysisResult.summary });
      dispatch({ type: 'SELECT_ISSUE', payload: null });
      dispatch({ type: 'SET_SUGGESTIONS', payload: [] });
      
      setUploadStatus('success');
      
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('处理文件失败:', error);
      setErrorMessage('处理文件失败，请重试');
      setUploadStatus('error');
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return '正在上传文件...';
      case 'analyzing':
        return '正在分析代码...';
      case 'success':
        return '文件上传和分析成功！';
      case 'error':
        return errorMessage || '上传失败，请重试';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
      case 'analyzing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>;
      case 'success':
        return <div className="text-green-500"><i className="fas fa-check-circle"></i></div>;
      case 'error':
        return <div className="text-red-500"><i className="fas fa-times-circle"></i></div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">上传代码文件</h2>
      
      {uploadStatus !== 'idle' && (
        <div className="mb-4 flex items-center">
          <div className="mr-2">
            {getStatusIcon()}
          </div>
          <span className={`text-sm ${
            uploadStatus === 'success' ? 'text-green-500' : 
            uploadStatus === 'error' ? 'text-red-500' : 'text-blue-500'
          }`}>
            {getStatusMessage()}
          </span>
        </div>
      )}
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-900 bg-opacity-20' 
            : 'border-gray-600 hover:border-blue-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.cc,.h,.hpp,.cs,.go,.rb,.php,.swift,.kt,.kts,.rs,.html,.htm,.css,.json,.xml,.yaml,.yml,.md,.txt"
        />
        
        <div className="mb-4">
          <i className="fas fa-file-code text-4xl text-gray-400"></i>
        </div>
        
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          拖放文件到此处或点击上传
        </h3>
        
        <p className="text-sm text-gray-400 mb-4">
          支持 JavaScript, TypeScript, Python, Java, C/C++, Go 等多种编程语言
        </p>
        
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
          onClick={handleButtonClick}
        >
          选择文件
        </button>
      </div>
    </div>
  );
};

export default FileUploader;