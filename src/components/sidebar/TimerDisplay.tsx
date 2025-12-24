import { Play, Pause, Square, Clock } from 'lucide-react';
import { TimerState } from '@/types';

interface TimerDisplayProps {
  timerState: TimerState;
  timerFinished: boolean;
  formatTime: (seconds: number) => string;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onDismiss: () => void;
}

export const TimerDisplay = ({
  timerState,
  timerFinished,
  formatTime,
  onPause,
  onResume,
  onStop,
  onDismiss,
}: TimerDisplayProps) => {
  // Show nothing if timer is fully stopped and not finished
  if (timerState.status === 'stopped' && !timerFinished) {
    return null;
  }

  // Timer finished notification
  if (timerFinished) {
    return (
      <div className="px-4 py-3 bg-success/10 border-b border-success/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-success">Timer Complete!</p>
              <p className="text-xs text-muted-foreground">
                Great work! Consider taking a 5-min break.
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  const progress = timerState.totalSeconds > 0 
    ? ((timerState.totalSeconds - timerState.remainingSeconds) / timerState.totalSeconds) * 100 
    : 0;

  return (
    <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full mb-3 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            timerState.status === 'running' 
              ? 'bg-primary/20 text-primary' 
              : 'bg-warning/20 text-warning'
          }`}>
            {timerState.status === 'running' ? (
              <Clock className="w-5 h-5" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-xl font-mono font-bold text-foreground">
              {formatTime(timerState.remainingSeconds)}
            </p>
            <p className="text-xs text-muted-foreground">
              {timerState.status === 'running' ? 'Focus time' : 'Paused'}
              {timerState.linkedTaskTitle && ` • ${timerState.linkedTaskTitle.substring(0, 20)}${timerState.linkedTaskTitle.length > 20 ? '...' : ''}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {timerState.status === 'running' ? (
            <button
              onClick={onPause}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onResume}
              className="p-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              title="Resume"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onStop}
            className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
