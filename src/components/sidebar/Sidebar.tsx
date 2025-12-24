import { useState, useEffect } from 'react';
import { TabType, Task } from '@/types';
import { storage } from '@/utils/storage';
import { Header } from './Header';
import { TabNav } from './TabNav';
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

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    setTasks(storage.getTasks());
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="sidebar-container animate-slide-in-right">
        <div className="flex flex-col h-full">
          <Header 
            onClose={onClose} 
            onOpenSettings={() => setShowSettings(true)} 
          />
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="flex-1 overflow-hidden">
            {activeTab === 'todo' && (
              <TodoView tasks={tasks} onTasksChange={loadTasks} />
            )}
            {activeTab === 'summarize' && <SummarizeView />}
            {activeTab === 'ats' && <ATSView />}
            {activeTab === 'chat' && (
              <ChatView tasks={tasks} onTasksChange={loadTasks} />
            )}
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
};
