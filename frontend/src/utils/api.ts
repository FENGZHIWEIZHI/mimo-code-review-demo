import axios from 'axios';
import { FileInfo, Issue, Suggestion, AnalysisResult, CodeChangeResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFile = async (file: File): Promise<FileInfo> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const analyzeCode = async (fileId: string): Promise<AnalysisResult> => {
  const response = await api.get(`/analyze/${fileId}`);
  return response.data;
};

export const getIssues = async (fileId: string): Promise<Issue[]> => {
  const response = await api.get(`/issues/${fileId}`);
  return response.data.issues;
};

export const getSuggestions = async (issueId: string): Promise<Suggestion[]> => {
  const response = await api.get(`/suggestions/${issueId}`);
  return response.data.suggestions;
};

export const applySuggestion = async (fileId: string, suggestionId: string): Promise<CodeChangeResponse> => {
  const response = await api.post('/apply-suggestion', {
    file_id: fileId,
    suggestion_id: suggestionId,
  });
  return response.data;
};

export default api;