import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Issue } from '../types';

interface IssueListProps {
  onSelectIssue: (issue: Issue) => void;
}

const IssueList: React.FC<IssueListProps> = ({ onSelectIssue }) => {
  const { state } = useAppContext();
  const { issues, selectedIssue } = state;

  // 按严重程度排序问题
  const sortedIssues = [...issues].sort((a, b) => {
    const severityOrder = { error: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // 按类型分组问题
  const issuesByType = sortedIssues.reduce<Record<string, Issue[]>>((acc, issue) => {
    if (!acc[issue.type]) {
      acc[issue.type] = [];
    }
    acc[issue.type].push(issue);
    return acc;
  }, {});

  // 获取问题类型的中文名称
  const getIssueTypeName = (type: string): string => {
    const typeNames: Record<string, string> = {
      bug: 'Bug',
      security: '安全',
      performance: '性能',
      style: '风格'
    };
    return typeNames[type] || type;
  };

  // 获取严重程度的中文名称和颜色
  const getSeverityInfo = (severity: string): { name: string; color: string } => {
    const severityInfo: Record<string, { name: string; color: string }> = {
      error: { name: '错误', color: 'text-red-500' },
      warning: { name: '警告', color: 'text-yellow-500' },
      info: { name: '信息', color: 'text-green-500' }
    };
    return severityInfo[severity] || { name: severity, color: 'text-gray-500' };
  };

  if (issues.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-full">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">问题列表</h2>
        <div className="text-gray-400 text-center py-8">
          暂无发现问题
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">问题列表 ({issues.length})</h2>
      
      <div className="overflow-y-auto flex-grow">
        {Object.entries(issuesByType).map(([type, typeIssues]) => (
          <div key={type} className="mb-4">
            <h3 className="text-md font-medium text-gray-300 mb-2">{getIssueTypeName(type)} ({typeIssues.length})</h3>
            
            <div className="space-y-2">
              {typeIssues.map((issue) => {
                const severityInfo = getSeverityInfo(issue.severity);
                const isSelected = selectedIssue?.id === issue.id;
                
                return (
                  <div
                    key={issue.id}
                    className={`p-3 rounded-md cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-blue-900 bg-opacity-50 border-l-4 border-blue-500' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => onSelectIssue(issue)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          issue.severity === 'error' ? 'bg-red-500' :
                          issue.severity === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></span>
                        <span className={`text-sm ${severityInfo.color}`}>
                          {severityInfo.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        第 {issue.line_start} 行
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-200 mt-1 line-clamp-2">
                      {issue.message}
                    </p>
                    
                    <div className="mt-2">
                      <pre className="text-xs text-gray-400 bg-gray-900 p-2 rounded overflow-x-auto">
                        {issue.code}
                      </pre>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueList;