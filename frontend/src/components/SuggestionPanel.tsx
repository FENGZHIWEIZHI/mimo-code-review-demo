import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Suggestion } from '../types';
import { applySuggestion } from '../utils/api';

interface SuggestionPanelProps {
  suggestions: Suggestion[];
}

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ suggestions }) => {
  const { state, dispatch } = useAppContext();
  const { currentFile } = state;
  const [isApplying, setIsApplying] = useState<string | null>(null);

  const handleApplySuggestion = async (suggestion: Suggestion) => {
    if (!currentFile) return;

    try {
      setIsApplying(suggestion.id);
      const response = await applySuggestion(currentFile.file_id, suggestion.id);
      
      if (response.success) {
        // 更新文件内容
        dispatch({ type: 'SET_FILE_CONTENT', payload: response.updated_code });
        
        // 显示成功消息
        alert('建议已成功应用！');
      }
    } catch (error) {
      console.error('应用建议失败:', error);
      alert('应用建议失败，请重试。');
    } finally {
      setIsApplying(null);
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-full">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">修复建议</h2>
        <div className="text-gray-400 text-center py-8">
          请选择一个问题查看修复建议
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">修复建议</h2>
      
      <div className="overflow-y-auto flex-grow">
        {suggestions.map((suggestion, index) => (
          <div key={suggestion.id} className="mb-6 last:mb-0">
            <h3 className="text-md font-medium text-gray-300 mb-2">
              建议 {index + 1}: {suggestion.description}
            </h3>
            
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-400 mb-1">解释:</h4>
              <p className="text-sm text-gray-300">{suggestion.explanation}</p>
            </div>
            
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-400 mb-1">原始代码:</h4>
              <pre className="text-xs text-gray-400 bg-gray-900 p-2 rounded overflow-x-auto">
                {suggestion.original_code}
              </pre>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-1">建议代码:</h4>
              <pre className="text-xs text-green-400 bg-gray-900 p-2 rounded overflow-x-auto">
                {suggestion.suggested_code}
              </pre>
            </div>
            
            <button
              className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 ${
                isApplying === suggestion.id ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => handleApplySuggestion(suggestion)}
              disabled={isApplying === suggestion.id}
            >
              {isApplying === suggestion.id ? '应用中...' : '应用此建议'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionPanel;