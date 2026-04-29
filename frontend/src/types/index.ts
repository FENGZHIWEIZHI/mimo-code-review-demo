export interface FileInfo {
  file_id: string;
  filename: string;
  language: string;
}

export interface Issue {
  id: string;
  file_id: string;
  line_start: number;
  line_end: number;
  column_start: number;
  column_end: number;
  severity: 'error' | 'warning' | 'info';
  type: 'bug' | 'security' | 'performance' | 'style';
  message: string;
  code: string;
  suggestions?: Suggestion[];
}

export interface Suggestion {
  id: string;
  issue_id: string;
  description: string;
  original_code: string;
  suggested_code: string;
  explanation: string;
}

export interface AnalysisResult {
  issues: Issue[];
  summary: string;
}

export interface CodeChangeResponse {
  success: boolean;
  updated_code: string;
}