export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export type View = 'dashboard' | 'assistant' | 'docs' | 'code' | 'cid' | 'tx';

export interface QuickPrompt {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface LogEntry {
  id: string;
  label: string;
  timestamp: Date;
}
