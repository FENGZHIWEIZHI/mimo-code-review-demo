import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import FileUploader from './components/FileUploader';
import CodeEditor from './components/CodeEditor';
import IssueList from './components/IssueList';
import SuggestionPanel from './components/SuggestionPanel';
import CodeSummary from './components/CodeSummary';
import { getSuggestions } from './utils/api';
import { Issue } from './types';
import './App.css';

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { currentFile, selectedIssue, suggestions, codeSummary } = state;

  // 处理选择问题
  const handleSelectIssue = async (issue: Issue) => {
    dispatch({ type: 'SELECT_ISSUE', payload: issue });
    
    try {
      // 获取问题的建议
      const issueSuggestions = await getSuggestions(issue.id);
      dispatch({ type: 'SET_SUGGESTIONS', payload: issueSuggestions });
    } catch (error) {
      console.error('获取建议失败:', error);
      dispatch({ type: 'SET_SUGGESTIONS', payload: [] });
    }
  };

  // 重置应用状态
  const handleReset = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 导航栏 */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="fas fa-code text-blue-500 text-2xl"></i>
            <h1 className="text-xl font-bold">MiMo 智能代码审查助手</h1>
          </div>
          
          {currentFile && (
            <button
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors duration-200 text-sm"
              onClick={handleReset}
            >
              <i className="fas fa-upload mr-1"></i> 上传新文件
            </button>
          )}
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-6">
        {!currentFile ? (
          // 上传页面
          <div className="max-w-3xl mx-auto">
            <FileUploader />
          </div>
        ) : (
          // 代码审查页面
          <div className="grid grid-cols-12 gap-6">
            {/* 左侧 - 文件浏览器和问题列表 */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <CodeSummary summary={codeSummary} />
              <IssueList onSelectIssue={handleSelectIssue} />
            </div>
            
            {/* 中间 - 代码编辑器 */}
            <div className="col-span-12 lg:col-span-6">
              <CodeEditor height="700px" />
            </div>
            
            {/* 右侧 - 建议面板 */}
            <div className="col-span-12 lg:col-span-3">
              <SuggestionPanel suggestions={suggestions} />
            </div>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 border-t border-gray-700 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2026 MiMo 智能代码审查助手 | 基于 MiMo AI 技术</p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;