import { X, Settings, Moon, Sun } from 'lucide-react';
import { Theme } from '@/types';

interface HeaderProps {
  onClose: () => void;
  onOpenSettings: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Header = ({ onClose, onOpenSettings, theme, onToggleTheme }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
          <span className="text-primary-foreground font-bold text-sm">F</span>
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm">FocusDock</h1>
          <p className="text-xs text-muted-foreground">Stay focused, stay organized</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleTheme}
          className="icon-button"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onOpenSettings}
          className="icon-button"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="icon-button"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
