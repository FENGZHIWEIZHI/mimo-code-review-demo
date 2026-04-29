import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { FileInfo, Issue, Suggestion } from '../types';

interface AppState {
  currentFile: FileInfo | null;
  fileContent: string;
  issues: Issue[];
  selectedIssue: Issue | null;
  suggestions: Suggestion[];
  codeSummary: string;
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_CURRENT_FILE'; payload: FileInfo }
  | { type: 'SET_FILE_CONTENT'; payload: string }
  | { type: 'SET_ISSUES'; payload: Issue[] }
  | { type: 'SELECT_ISSUE'; payload: Issue | null }
  | { type: 'SET_SUGGESTIONS'; payload: Suggestion[] }
  | { type: 'SET_CODE_SUMMARY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_FILE_CONTENT'; payload: string }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  currentFile: null,
  fileContent: '',
  issues: [],
  selectedIssue: null,
  suggestions: [],
  codeSummary: '',
  isLoading: false,
  error: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CURRENT_FILE':
      return { ...state, currentFile: action.payload };
    case 'SET_FILE_CONTENT':
      return { ...state, fileContent: action.payload };
    case 'SET_ISSUES':
      return { ...state, issues: action.payload };
    case 'SELECT_ISSUE':
      return { ...state, selectedIssue: action.payload };
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
    case 'SET_CODE_SUMMARY':
      return { ...state, codeSummary: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_FILE_CONTENT':
      return { ...state, fileContent: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};