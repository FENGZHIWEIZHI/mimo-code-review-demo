import React from 'react';

interface CodeSummaryProps {
  summary: string;
}

const CodeSummary: React.FC<CodeSummaryProps> = ({ summary }) => {
  if (!summary) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-full">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">代码摘要</h2>
        <div className="text-gray-400 text-center py-8">
          上传文件后将显示代码摘要
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">代码摘要</h2>
      
      <div className="overflow-y-auto flex-grow">
        <p className="text-gray-300 leading-relaxed">
          {summary}
        </p>
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-md font-medium text-gray-300 mb-2">AI 分析结果</h3>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-400 italic">
              此摘要由 MiMo AI 基于代码内容自动生成，旨在帮助您快速理解代码的主要功能和潜在问题。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSummary;