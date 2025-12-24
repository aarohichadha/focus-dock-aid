import { Task, ChatMessage, TimerState } from '@/types';
import { storage, generateId } from './storage';

export type ChatIntent = 
  | 'list_tasks'
  | 'summarize'
  | 'extract_keywords'
  | 'mark_done'
  | 'delete_task'
  | 'start_timer'
  | 'pause_timer'
  | 'resume_timer'
  | 'stop_timer'
  | 'timer_status'
  | 'enable_dark_mode'
  | 'enable_light_mode'
  | 'toggle_theme'
  | 'help'
  | 'unknown';

export interface ParsedCommand {
  intent: ChatIntent;
  params?: string;
}

const INTENT_PATTERNS: { pattern: RegExp; intent: ChatIntent }[] = [
  // Tasks
  { pattern: /^(show|list|get|view)\s*(my\s*)?(tasks?|todos?|to-?dos?)/i, intent: 'list_tasks' },
  { pattern: /^(tasks?|todos?|to-?dos?)\s*(list)?$/i, intent: 'list_tasks' },
  { pattern: /^what('s| is| are)\s*(my\s*)?(tasks?|todos?)/i, intent: 'list_tasks' },
  
  // Summarize
  { pattern: /^summarize?\s*(this\s*)?(page)?/i, intent: 'summarize' },
  { pattern: /^(get\s*)?summary/i, intent: 'summarize' },
  { pattern: /^tldr/i, intent: 'summarize' },
  
  // Keywords
  { pattern: /^(ats|keywords?|extract)\s*(words?|keywords?)?/i, intent: 'extract_keywords' },
  { pattern: /^(get|show|find)\s*(ats\s*)?(keywords?)/i, intent: 'extract_keywords' },
  { pattern: /^job\s*keywords?/i, intent: 'extract_keywords' },
  
  // Mark done
  { pattern: /^(mark\s*)?done\s+(.+)/i, intent: 'mark_done' },
  { pattern: /^complete\s+(.+)/i, intent: 'mark_done' },
  { pattern: /^finish\s+(.+)/i, intent: 'mark_done' },
  
  // Delete task
  { pattern: /^delete\s+(.+)/i, intent: 'delete_task' },
  { pattern: /^remove\s+(.+)/i, intent: 'delete_task' },
  
  // Timer commands
  { pattern: /^start\s+(timer|pomodoro)\s*(for\s*)?(\d+)?\s*(min(ute)?s?)?/i, intent: 'start_timer' },
  { pattern: /^start\s*pomodoro/i, intent: 'start_timer' },
  { pattern: /^(set|begin)\s*timer\s*(for\s*)?(\d+)?\s*(min(ute)?s?)?/i, intent: 'start_timer' },
  { pattern: /^pause\s*timer/i, intent: 'pause_timer' },
  { pattern: /^resume\s*timer/i, intent: 'resume_timer' },
  { pattern: /^(stop|cancel|end)\s*timer/i, intent: 'stop_timer' },
  { pattern: /^timer\s*(status|time|remaining)?/i, intent: 'timer_status' },
  { pattern: /^(how much|what)\s*(time)?\s*(is\s*)?(left|remaining)/i, intent: 'timer_status' },
  
  // Theme commands
  { pattern: /^(enable|set|use|switch\s*to)\s*dark\s*(mode|theme)?/i, intent: 'enable_dark_mode' },
  { pattern: /^dark\s*(mode|theme)/i, intent: 'enable_dark_mode' },
  { pattern: /^(enable|set|use|switch\s*to)\s*light\s*(mode|theme)?/i, intent: 'enable_light_mode' },
  { pattern: /^light\s*(mode|theme)/i, intent: 'enable_light_mode' },
  { pattern: /^(switch|toggle)\s*theme/i, intent: 'toggle_theme' },
  
  // Help
  { pattern: /^help/i, intent: 'help' },
  { pattern: /^what can you do/i, intent: 'help' },
  { pattern: /^commands?/i, intent: 'help' },
];

export const parseCommand = (input: string): ParsedCommand => {
  const trimmed = input.trim();
  
  for (const { pattern, intent } of INTENT_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      // Extract params if present (last capture group)
      const params = match[match.length - 1] !== match[0] ? match[match.length - 1] : undefined;
      return { intent, params };
    }
  }
  
  return { intent: 'unknown' };
};

// Extract timer minutes from command
export const extractTimerMinutes = (input: string): number => {
  const match = input.match(/(\d+)\s*(min(ute)?s?)?/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  // Default to 25 minutes for pomodoro
  return 25;
};

export const formatTaskList = (tasks: Task[]): string => {
  if (tasks.length === 0) {
    return "You don't have any tasks yet. Add a page to your to-do list using the To-Do tab!";
  }
  
  const openTasks = tasks.filter(t => t.status === 'open');
  const doneTasks = tasks.filter(t => t.status === 'done');
  
  // Sort by priority then by date
  const priorityOrder = { P0: 0, P1: 1, P2: 2 };
  const sortedOpen = openTasks.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.createdAt - a.createdAt;
  });
  
  let response = `📋 **Your Tasks** (${openTasks.length} open, ${doneTasks.length} done)\n\n`;
  
  if (sortedOpen.length > 0) {
    response += '**Open:**\n';
    sortedOpen.forEach((task, i) => {
      const priority = task.priority === 'P0' ? '🔴' : task.priority === 'P1' ? '🟡' : '🟢';
      response += `${i + 1}. ${priority} ${task.title}`;
      if (task.notes) response += ` - ${task.notes.substring(0, 50)}${task.notes.length > 50 ? '...' : ''}`;
      response += '\n';
    });
  }
  
  if (doneTasks.length > 0 && doneTasks.length <= 3) {
    response += '\n**Completed:**\n';
    doneTasks.slice(0, 3).forEach((task, i) => {
      response += `✓ ${task.title}\n`;
    });
  }
  
  return response;
};

export const findTaskByQuery = (query: string, tasks: Task[]): Task | null => {
  const lowerQuery = query.toLowerCase().trim();
  
  // Try to match by ID first
  const byId = tasks.find(t => t.id.includes(lowerQuery));
  if (byId) return byId;
  
  // Try to match by number (1-indexed)
  const num = parseInt(lowerQuery);
  if (!isNaN(num) && num > 0 && num <= tasks.length) {
    const openTasks = tasks.filter(t => t.status === 'open');
    if (num <= openTasks.length) return openTasks[num - 1];
  }
  
  // Try to match by title (partial, case-insensitive)
  const byTitle = tasks.find(t => t.title.toLowerCase().includes(lowerQuery));
  if (byTitle) return byTitle;
  
  return null;
};

export const formatTimerStatus = (state: TimerState, formatTime: (s: number) => string): string => {
  if (state.status === 'stopped' && state.remainingSeconds === 0) {
    return "⏱️ No timer is currently running. Say 'start timer for 25 minutes' to begin!";
  }
  
  const statusEmoji = state.status === 'running' ? '▶️' : '⏸️';
  const statusText = state.status === 'running' ? 'Running' : 'Paused';
  
  let response = `⏱️ **Timer Status:** ${statusEmoji} ${statusText}\n\n`;
  response += `**Time Remaining:** ${formatTime(state.remainingSeconds)}\n`;
  response += `**Total Duration:** ${Math.floor(state.totalSeconds / 60)} minutes\n`;
  
  if (state.linkedTaskTitle) {
    response += `**Linked Task:** ${state.linkedTaskTitle}`;
  }
  
  return response;
};

export const generateHelpMessage = (): string => {
  return `🤖 **FocusDock Commands**

📋 **Tasks:**
• "show my tasks" - List all tasks
• "done [task]" - Mark task complete
• "delete [task]" - Remove a task

📝 **Summarize:**
• "summarize" - Summarize current page

🔍 **Keywords:**
• "ats keywords" - Extract job keywords

⏱️ **Timer:**
• "start timer for 25 minutes"
• "start pomodoro" (25 min default)
• "pause timer" / "resume timer"
• "stop timer"
• "timer status"

🎨 **Theme:**
• "enable dark mode"
• "enable light mode"
• "switch theme"

💡 **Tips:**
• Use the tabs above for more features
• Click quick commands below for fast access`;
};

export const createBotMessage = (content: string): ChatMessage => ({
  id: generateId(),
  role: 'assistant',
  content,
  timestamp: Date.now(),
});

export const createUserMessage = (content: string): ChatMessage => ({
  id: generateId(),
  role: 'user',
  content,
  timestamp: Date.now(),
});
