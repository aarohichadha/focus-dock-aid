import { useState, useEffect } from 'react';
import { TabType, Task } from '@/types';
import { storage } from '@/utils/storage';
import { useTimer } from '@/hooks/useTimer';
import { useTheme } from '@/hooks/useTheme';
import { Header } from './Header';
import { TabNav } from './TabNav';
import { TimerDisplay } from './TimerDisplay';
import { TodoView } from './TodoView';
import { SummarizeView } from './SummarizeView';
import { ATSView } from './ATSView';
import { ChatView } from './ChatView';
import { SettingsModal } from './SettingsModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('todo');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const { theme, setTheme, toggleTheme } = useTheme();
  const {
    timerState,
    timerFinished,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    dismissFinished,
    formatTime,
  } = useTimer();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    setTasks(storage.getTasks());
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`sidebar-container animate-slide-in-right ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="flex flex-col h-full bg-card">
          <Header 
            onClose={onClose} 
            onOpenSettings={() => setShowSettings(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
          
          <TimerDisplay
            timerState={timerState}
            timerFinished={timerFinished}
            formatTime={formatTime}
            onPause={pauseTimer}
            onResume={resumeTimer}
            onStop={stopTimer}
            onDismiss={dismissFinished}
          />
          
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="flex-1 overflow-hidden">
            {activeTab === 'todo' && (
              <TodoView tasks={tasks} onTasksChange={loadTasks} />
            )}
            {activeTab === 'summarize' && <SummarizeView />}
            {activeTab === 'ats' && <ATSView />}
            {activeTab === 'chat' && (
              <ChatView 
                tasks={tasks} 
                onTasksChange={loadTasks}
                timerState={timerState}
                onStartTimer={startTimer}
                onPauseTimer={pauseTimer}
                onResumeTimer={resumeTimer}
                onStopTimer={stopTimer}
                formatTime={formatTime}
                theme={theme}
                onSetTheme={setTheme}
                onToggleTheme={toggleTheme}
              />
            )}
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        theme={theme}
        onSetTheme={setTheme}
      />
    </>
  );
};
