import { Task, KeywordResult, SummaryResult, ChatMessage, TimerState, Theme } from '@/types';

// For development/demo, we use localStorage
// In actual extension, this would use chrome.storage.local

const STORAGE_KEYS = {
  TASKS: 'focusdock_tasks',
  KEYWORDS_CACHE: 'focusdock_keywords',
  SUMMARY_CACHE: 'focusdock_summary',
  CHAT_HISTORY: 'focusdock_chat',
  API_KEY: 'focusdock_api_key',
  TIMER: 'focusdock_timer',
  THEME: 'focusdock_theme',
};

export const storage = {
  // Tasks
  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTasks: (tasks: Task[]): void => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  addTask: (task: Task): void => {
    const tasks = storage.getTasks();
    tasks.unshift(task);
    storage.saveTasks(tasks);
  },

  updateTask: (id: string, updates: Partial<Task>): void => {
    const tasks = storage.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      storage.saveTasks(tasks);
    }
  },

  deleteTask: (id: string): void => {
    const tasks = storage.getTasks().filter(t => t.id !== id);
    storage.saveTasks(tasks);
  },

  // Keywords cache
  getCachedKeywords: (url: string): KeywordResult | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KEYWORDS_CACHE);
      const cache = data ? JSON.parse(data) : {};
      return cache[url] || null;
    } catch {
      return null;
    }
  },

  cacheKeywords: (url: string, keywords: KeywordResult): void => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KEYWORDS_CACHE);
      const cache = data ? JSON.parse(data) : {};
      cache[url] = keywords;
      localStorage.setItem(STORAGE_KEYS.KEYWORDS_CACHE, JSON.stringify(cache));
    } catch {
      // Ignore cache errors
    }
  },

  // Summary cache
  getCachedSummary: (url: string): SummaryResult | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUMMARY_CACHE);
      const cache = data ? JSON.parse(data) : {};
      return cache[url] || null;
    } catch {
      return null;
    }
  },

  cacheSummary: (url: string, summary: SummaryResult): void => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUMMARY_CACHE);
      const cache = data ? JSON.parse(data) : {};
      cache[url] = summary;
      localStorage.setItem(STORAGE_KEYS.SUMMARY_CACHE, JSON.stringify(cache));
    } catch {
      // Ignore cache errors
    }
  },

  // Chat history
  getChatHistory: (): ChatMessage[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveChatHistory: (messages: ChatMessage[]): void => {
    // Keep only last 50 messages
    const trimmed = messages.slice(-50);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(trimmed));
  },

  addChatMessage: (message: ChatMessage): void => {
    const history = storage.getChatHistory();
    history.push(message);
    storage.saveChatHistory(history);
  },

  clearChatHistory: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  },

  // API Key
  getApiKey: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  },

  setApiKey: (key: string): void => {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  },

  removeApiKey: (): void => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  },

  // Timer
  getTimerState: (): TimerState => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIMER);
      if (data) {
        const state = JSON.parse(data) as TimerState;
        // If timer was running, calculate elapsed time
        if (state.status === 'running' && state.startedAt) {
          const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
          state.remainingSeconds = Math.max(0, state.remainingSeconds - elapsed);
          if (state.remainingSeconds <= 0) {
            state.status = 'stopped';
            state.remainingSeconds = 0;
          }
        }
        return state;
      }
    } catch {
      // Ignore errors
    }
    return { status: 'stopped', remainingSeconds: 0, totalSeconds: 0 };
  },

  saveTimerState: (state: TimerState): void => {
    // Update startedAt when saving running timer
    if (state.status === 'running') {
      state.startedAt = Date.now();
    }
    localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(state));
  },

  clearTimer: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TIMER);
  },

  // Theme
  getTheme: (): Theme => {
    try {
      const theme = localStorage.getItem(STORAGE_KEYS.THEME);
      return theme === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  },

  setTheme: (theme: Theme): void => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
