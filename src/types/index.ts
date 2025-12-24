export type Priority = 'P0' | 'P1' | 'P2';

export interface Task {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  notes: string;
  priority: Priority;
  dueDate?: string;
  status: 'open' | 'done';
  createdAt: number;
}

export interface KeywordResult {
  skills: string[];
  tools: string[];
  roles: string[];
  softSkills: string[];
  suggested: string[];
}

export interface SummaryResult {
  bullets: string[];
  pageTitle: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type TabType = 'todo' | 'summarize' | 'ats' | 'chat';

export type Theme = 'light' | 'dark';

export interface TimerState {
  status: 'stopped' | 'running' | 'paused';
  remainingSeconds: number;
  totalSeconds: number;
  linkedTaskId?: string;
  linkedTaskTitle?: string;
  startedAt?: number;
  pausedAt?: number;
}
