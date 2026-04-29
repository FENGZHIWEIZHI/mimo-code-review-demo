import React, { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useAppContext } from '../contexts/AppContext';
import { Issue } from '../types';

interface CodeEditorProps {
  height?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ height = '600px' }) => {
  const { state } = useAppContext();
  const { fileContent, currentFile, issues, selectedIssue } = state;
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // 处理编辑器挂载
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    
    // 设置编辑器焦点
    editor.focus();
    
    // 应用主题
    monaco.editor.defineTheme('codeReviewTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'operator', foreground: 'D4D4D4' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#2D2D2D',
        'editorLineNumber.foreground': '#606060',
        'editorCursor.foreground': '#FFFFFF',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
      }
    });
    
    monaco.editor.setTheme('codeReviewTheme');
  };

  // 高亮显示问题
  useEffect(() => {
    if (!editorRef.current || !issues.length) return;

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    // 清除之前的装饰
    const decorations = editor.deltaDecorations([], []);

    // 为每个问题添加装饰
    const newDecorations = issues.map((issue) => {
      // 根据严重程度选择颜色
      let color = '#6A9955'; // 信息 - 绿色
      if (issue.severity === 'warning') {
        color = '#DCDCAA'; // 警告 - 黄色
      } else if (issue.severity === 'error') {
        color = '#F44747'; // 错误 - 红色
      }

      // 创建装饰选项
      return {
        range: new monaco.Range(
          issue.line_start,
          issue.column_start,
          issue.line_end,
          issue.column_end
        ),
        options: {
          isWholeLine: false,
          className: `issue-decoration ${issue.severity}`,
          glyphMarginClassName: `issue-glyph ${issue.severity}`,
          hoverMessage: { value: issue.message },
          inlineClassName: `issue-inline ${issue.severity}`,
          overviewRuler: {
            color: color,
            position: monaco.editor.OverviewRulerLane.Right,
            darkColor: color
          }
        }
      };
    });

    // 应用新的装饰
    editor.deltaDecorations([], newDecorations);
  }, [issues]);

  // 当选择问题时，跳转到相应位置
  useEffect(() => {
    if (!editorRef.current || !selectedIssue) return;

    const editor = editorRef.current;
    
    // 跳转到问题位置
    editor.revealLineInCenter(selectedIssue.line_start);
    
    // 设置选中区域
    editor.setSelection({
      startLineNumber: selectedIssue.line_start,
      startColumn: selectedIssue.column_start,
      endLineNumber: selectedIssue.line_end,
      endColumn: selectedIssue.column_end
    });
    
    // 聚焦编辑器
    editor.focus();
  }, [selectedIssue]);

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-200">
          {currentFile ? currentFile.filename : '代码编辑器'}
        </h2>
        {currentFile && (
          <span className="px-2 py-1 bg-blue-600 text-xs text-white rounded-full">
            {currentFile.language}
          </span>
        )}
      </div>
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <Editor
          height={height}
          language={currentFile?.language || 'text'}
          value={fileContent}
          theme="codeReviewTheme"
          onChange={(value) => {
            // 这里可以添加内容变更的处理逻辑
          }}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            automaticLayout: true,
            tabSize: 2,
            renderLineHighlight: 'all',
          }}
        />
      </div>
      <style jsx global>{`
        .issue-decoration.error {
          background-color: rgba(244, 71, 71, 0.2);
          border-bottom: 2px wavy #F44747;
        }
        
        .issue-decoration.warning {
          background-color: rgba(220, 220, 170, 0.2);
          border-bottom: 2px wavy #DCDCAA;
        }
        
        .issue-decoration.info {
          background-color: rgba(106, 153, 85, 0.2);
          border-bottom: 2px wavy #6A9955;
        }
        
        .issue-glyph.error::before {
          content: "●";
          color: #F44747;
          font-size: 12px;
        }
        
        .issue-glyph.warning::before {
          content: "●";
          color: #DCDCAA;
          font-size: 12px;
        }
        
        .issue-glyph.info::before {
          content: "●";
          color: #6A9955;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;