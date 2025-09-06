export interface GrammarError {
  id: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'style';
  start: number;
  end: number;
  context: string;
  message: string;
  suggestions: string[];
}

export interface GrammarResult {
  errors: GrammarError[];
  correctedText: string;
  confidence?: number;
}

export interface RateLimit {
  maxRequests: number;
  timeWindow: number;
  requests: number[];
}

export interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  url: string;
  userAgent: string;
}

export interface UserSession {
  sessionId: string;
  startTime: number;
  textChecks: number;
  errorsFound: number;
  suggestionsApplied: number;
  textsCopied: number;
  textsDownloaded: number;
  totalCharactersChecked: number;
}

export interface AnalyticsStore {
  events: AnalyticsEvent[];
  userSession: UserSession;
}

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export interface TextEditorProps {
  text: string;
  onChange: (text: string) => void;
  errors?: GrammarError[];
  onErrorClick: (error: GrammarError) => void;
}

export interface SuggestionPanelProps {
  errors: GrammarError[];
  selectedError: GrammarError | null;
  onErrorSelect: (error: GrammarError) => void;
  onApplySuggestion: (errorId: string, suggestion: string) => void;
  hasChecked: boolean;
  isChecking: boolean;
}

export interface ErrorItemProps {
  error: GrammarError;
  isSelected: boolean;
  onSelect: () => void;
  onApplySuggestion: (errorId: string, suggestion: string) => void;
  index: number;
}