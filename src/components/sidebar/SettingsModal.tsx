import { useState, useEffect } from 'react';
import { X, Key, Save, Trash2, Check, Moon, Sun } from 'lucide-react';
import { Theme } from '@/types';
import { storage } from '@/utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
}

export const SettingsModal = ({ isOpen, onClose, theme, onSetTheme }: SettingsModalProps) => {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const key = storage.getApiKey();
    if (key) {
      setApiKey('••••••••••••••••••••');
      setHasKey(true);
    } else {
      setApiKey('');
      setHasKey(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey && !apiKey.includes('•')) {
      storage.setApiKey(apiKey);
      setHasKey(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleRemove = () => {
    storage.removeApiKey();
    setApiKey('');
    setHasKey(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <button onClick={onClose} className="icon-button">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-primary" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
              <label className="text-sm font-medium text-foreground">
                Theme
              </label>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Choose between light and dark mode for the sidebar.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onSetTheme('light')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  theme === 'light'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => onSetTheme('dark')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
            </div>
          </div>

          {/* API Key Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-primary" />
              <label className="text-sm font-medium text-foreground">
                AI API Key (Optional)
              </label>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Add an OpenAI or compatible API key for enhanced summaries and keyword extraction.
              Without a key, FocusDock uses built-in heuristics.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="input-field flex-1"
              />
              {hasKey ? (
                <button
                  onClick={handleRemove}
                  className="action-button bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={!apiKey || saved}
                  className="action-button action-button-primary"
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                </button>
              )}
            </div>
            {hasKey && (
              <p className="text-xs text-success mt-2 flex items-center gap-1">
                <Check className="w-3 h-3" />
                API key configured
              </p>
            )}
          </div>

          {/* Info */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <h3 className="font-medium text-foreground text-sm mb-2">About FocusDock</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              FocusDock helps you stay focused by saving pages as tasks, 
              tracking focus time with timers, extracting job keywords, and summarizing content. 
              Your data is stored locally in your browser.
            </p>
          </div>

          {/* Version */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              FocusDock v1.1.0 • Built with ❤️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
