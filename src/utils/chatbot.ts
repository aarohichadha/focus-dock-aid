import { Task, ChatMessage } from '@/types';
import { storage, generateId } from './storage';

export type ChatIntent = 
  | 'list_tasks'
  | 'summarize'
  | 'extract_keywords'
  | 'mark_done'
  | 'delete_task'
  | 'help'
  | 'unknown';

export interface ParsedCommand {
  intent: ChatIntent;
  params?: string;
}

const INTENT_PATTERNS: { pattern: RegExp; intent: ChatIntent }[] = [
  { pattern: /^(show|list|get|view)\s*(my\s*)?(tasks?|todos?|to-?dos?)/i, intent: 'list_tasks' },
  { pattern: /^(tasks?|todos?|to-?dos?)\s*(list)?$/i, intent: 'list_tasks' },
  { pattern: /^what('s| is| are)\s*(my\s*)?(tasks?|todos?)/i, intent: 'list_tasks' },
  
  { pattern: /^summarize?\s*(this\s*)?(page)?/i, intent: 'summarize' },
  { pattern: /^(get\s*)?summary/i, intent: 'summarize' },
  { pattern: /^tldr/i, intent: 'summarize' },
  
  { pattern: /^(ats|keywords?|extract)\s*(words?|keywords?)?/i, intent: 'extract_keywords' },
  { pattern: /^(get|show|find)\s*(ats\s*)?(keywords?)/i, intent: 'extract_keywords' },
  { pattern: /^job\s*keywords?/i, intent: 'extract_keywords' },
  
  { pattern: /^(mark\s*)?done\s+(.+)/i, intent: 'mark_done' },
  { pattern: /^complete\s+(.+)/i, intent: 'mark_done' },
  { pattern: /^finish\s+(.+)/i, intent: 'mark_done' },
  
  { pattern: /^delete\s+(.+)/i, intent: 'delete_task' },
  { pattern: /^remove\s+(.+)/i, intent: 'delete_task' },
  
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

export const generateHelpMessage = (): string => {
  return `🤖 **FocusDock Commands**

📋 **Tasks:**
• "show my tasks" - List all tasks
• "list todos" - Same as above

📝 **Summarize:**
• "summarize" - Summarize current page
• "tldr" - Same as above

🔍 **Keywords:**
• "ats keywords" - Extract job keywords
• "extract keywords" - Same as above

✅ **Manage:**
• "done [task name/number]" - Mark task complete
• "delete [task name/number]" - Remove a task

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
