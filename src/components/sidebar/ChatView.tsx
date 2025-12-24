import { useState, useEffect, useRef } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { ChatMessage, Task, TimerState, Theme } from '@/types';
import { storage, generateId } from '@/utils/storage';
import { extractPageContent, getPageInfo } from '@/utils/textExtractor';
import { summarizeText } from '@/utils/summarizer';
import { extractKeywords, countKeywords } from '@/utils/keywordExtractor';
import {
  parseCommand,
  formatTaskList,
  findTaskByQuery,
  generateHelpMessage,
  createBotMessage,
  createUserMessage,
  extractTimerMinutes,
  formatTimerStatus,
} from '@/utils/chatbot';

interface ChatViewProps {
  tasks: Task[];
  onTasksChange: () => void;
  timerState: TimerState;
  onStartTimer: (minutes: number, taskId?: string, taskTitle?: string) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onStopTimer: () => void;
  formatTime: (seconds: number) => string;
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
  onToggleTheme: () => void;
}

const QUICK_COMMANDS = [
  { label: '📋 Tasks', message: 'show my tasks' },
  { label: '⏱️ Pomodoro', message: 'start pomodoro' },
  { label: '📝 Summarize', message: 'summarize' },
  { label: '❓ Help', message: 'help' },
];

export const ChatView = ({ 
  tasks, 
  onTasksChange,
  timerState,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  formatTime,
  theme,
  onSetTheme,
  onToggleTheme,
}: ChatViewProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = storage.getChatHistory();
    if (history.length === 0) {
      // Add welcome message
      const welcome = createBotMessage(
        "👋 Hi! I'm FocusDock assistant. I can help you manage tasks, run timers, summarize pages, and more. Try 'help' to see all commands!"
      );
      setMessages([welcome]);
      storage.addChatMessage(welcome);
    } else {
      setMessages(history);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
    storage.addChatMessage(message);
  };

  const processCommand = async (userInput: string) => {
    const userMessage = createUserMessage(userInput);
    addMessage(userMessage);
    setIsProcessing(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const { intent, params } = parseCommand(userInput);
    let response: string;

    switch (intent) {
      case 'list_tasks':
        response = formatTaskList(tasks);
        break;

      case 'summarize': {
        const content = extractPageContent();
        if (content.length < 100) {
          response = "❌ Not enough content to summarize on this page.";
        } else {
          const summary = summarizeText(content, getPageInfo().title);
          response = `📝 **Summary of "${summary.pageTitle}"**\n\n${summary.bullets.map(b => `• ${b}`).join('\n')}`;
        }
        break;
      }

      case 'extract_keywords': {
        const content = extractPageContent();
        const keywords = extractKeywords(content);
        if (countKeywords(keywords) === 0) {
          response = "❌ No relevant keywords found on this page.";
        } else {
          const parts = [];
          if (keywords.skills.length) parts.push(`**Skills:** ${keywords.skills.slice(0, 8).join(', ')}`);
          if (keywords.tools.length) parts.push(`**Tools:** ${keywords.tools.slice(0, 6).join(', ')}`);
          if (keywords.roles.length) parts.push(`**Roles:** ${keywords.roles.slice(0, 4).join(', ')}`);
          if (keywords.softSkills.length) parts.push(`**Soft Skills:** ${keywords.softSkills.slice(0, 4).join(', ')}`);
          response = `🔍 **ATS Keywords Found:**\n\n${parts.join('\n')}`;
        }
        break;
      }

      case 'mark_done': {
        if (!params) {
          response = "❌ Please specify which task to mark as done. Example: 'done 1' or 'done task title'";
        } else {
          const task = findTaskByQuery(params, tasks);
          if (task) {
            storage.updateTask(task.id, { status: 'done' });
            onTasksChange();
            response = `✅ Marked "${task.title}" as done!`;
          } else {
            response = `❌ Couldn't find a task matching "${params}". Try 'show tasks' to see your task list.`;
          }
        }
        break;
      }

      case 'delete_task': {
        if (!params) {
          response = "❌ Please specify which task to delete. Example: 'delete 1' or 'delete task title'";
        } else {
          const task = findTaskByQuery(params, tasks);
          if (task) {
            storage.deleteTask(task.id);
            onTasksChange();
            response = `🗑️ Deleted "${task.title}"`;
          } else {
            response = `❌ Couldn't find a task matching "${params}". Try 'show tasks' to see your task list.`;
          }
        }
        break;
      }

      case 'start_timer': {
        if (timerState.status === 'running') {
          response = `⏱️ Timer is already running! ${formatTime(timerState.remainingSeconds)} remaining. Say 'pause timer' or 'stop timer' first.`;
        } else {
          const minutes = extractTimerMinutes(userInput);
          onStartTimer(minutes);
          response = `⏱️ **Timer started!** ${minutes} minutes of focus time. You've got this! 💪`;
        }
        break;
      }

      case 'pause_timer': {
        if (timerState.status === 'paused') {
          response = "⏸️ Timer is already paused. Say 'resume timer' to continue.";
        } else if (timerState.status === 'stopped') {
          response = "❌ No timer is running. Say 'start timer for 25 minutes' to begin.";
        } else {
          onPauseTimer();
          response = `⏸️ **Timer paused** at ${formatTime(timerState.remainingSeconds)}. Say 'resume timer' when ready.`;
        }
        break;
      }

      case 'resume_timer': {
        if (timerState.status === 'running') {
          response = `▶️ Timer is already running! ${formatTime(timerState.remainingSeconds)} remaining.`;
        } else if (timerState.status === 'stopped') {
          response = "❌ No timer to resume. Say 'start timer for 25 minutes' to begin.";
        } else {
          onResumeTimer();
          response = `▶️ **Timer resumed!** ${formatTime(timerState.remainingSeconds)} remaining. Stay focused!`;
        }
        break;
      }

      case 'stop_timer': {
        if (timerState.status === 'stopped') {
          response = "❌ No timer is running.";
        } else {
          onStopTimer();
          response = "⏹️ **Timer stopped.** Ready for your next focus session!";
        }
        break;
      }

      case 'timer_status': {
        response = formatTimerStatus(timerState, formatTime);
        break;
      }

      case 'enable_dark_mode': {
        onSetTheme('dark');
        response = "🌙 **Dark mode enabled!** Easy on the eyes.";
        break;
      }

      case 'enable_light_mode': {
        onSetTheme('light');
        response = "☀️ **Light mode enabled!** Bright and clear.";
        break;
      }

      case 'toggle_theme': {
        onToggleTheme();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        response = newTheme === 'dark' 
          ? "🌙 **Switched to dark mode!**" 
          : "☀️ **Switched to light mode!**";
        break;
      }

      case 'help':
        response = generateHelpMessage();
        break;

      default:
        response = "🤔 I'm not sure what you mean. Try 'help' to see what I can do, or use the quick commands below!";
    }

    const botMessage = createBotMessage(response);
    addMessage(botMessage);
    setIsProcessing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    processCommand(input.trim());
    setInput('');
  };

  const handleQuickCommand = (message: string) => {
    if (isProcessing) return;
    processCommand(message);
  };

  const handleClearHistory = () => {
    storage.clearChatHistory();
    const welcome = createBotMessage(
      "🧹 Chat history cleared! How can I help you?"
    );
    setMessages([welcome]);
    storage.addChatMessage(welcome);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-semibold text-foreground">Chat Assistant</h2>
        <button
          onClick={handleClearHistory}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors inline-flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`chat-bubble ${
                message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'
              } animate-fade-in-up`}
            >
              <div className="whitespace-pre-wrap text-sm">
                {message.content.split('\n').map((line, i) => {
                  // Simple markdown-like bold parsing
                  const parts = line.split(/\*\*(.*?)\*\*/g);
                  return (
                    <div key={i}>
                      {parts.map((part, j) => 
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="chat-bubble chat-bubble-bot">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Commands */}
      <div className="px-4 py-2 border-t border-border bg-muted/30">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => handleQuickCommand(cmd.message)}
              className="quick-chip"
              disabled={isProcessing}
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command..."
            className="input-field flex-1"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="action-button action-button-primary px-3"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
