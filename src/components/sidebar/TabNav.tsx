import { CheckSquare, FileText, Search, MessageCircle } from 'lucide-react';
import { TabType } from '@/types';

interface TabNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'todo', label: 'To-Do', icon: CheckSquare },
  { id: 'summarize', label: 'Summary', icon: FileText },
  { id: 'ats', label: 'ATS', icon: Search },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
];

export const TabNav = ({ activeTab, onTabChange }: TabNavProps) => {
  return (
    <div className="flex gap-1.5 p-3 bg-muted/50">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`tab-button ${activeTab === id ? 'active' : ''}`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};
