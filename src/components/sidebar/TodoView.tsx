import { useState } from 'react';
import { Plus, ExternalLink, Check, Trash2, Calendar, Flag } from 'lucide-react';
import { Task, Priority } from '@/types';
import { storage, generateId } from '@/utils/storage';
import { getPageInfo } from '@/utils/textExtractor';

interface TodoViewProps {
  tasks: Task[];
  onTasksChange: () => void;
}

export const TodoView = ({ tasks, onTasksChange }: TodoViewProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [priority, setPriority] = useState<Priority>('P1');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');

  const openTasks = tasks.filter(t => t.status === 'open');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const handleAddTask = () => {
    const pageInfo = getPageInfo();
    const task: Task = {
      id: generateId(),
      title: pageInfo.title,
      url: pageInfo.url,
      favicon: pageInfo.favicon,
      notes,
      priority,
      dueDate: dueDate || undefined,
      status: 'open',
      createdAt: Date.now(),
    };
    storage.addTask(task);
    setIsAdding(false);
    setNotes('');
    setDueDate('');
    setPriority('P1');
    onTasksChange();
  };

  const handleToggleStatus = (task: Task) => {
    storage.updateTask(task.id, {
      status: task.status === 'open' ? 'done' : 'open',
    });
    onTasksChange();
  };

  const handleDelete = (id: string) => {
    storage.deleteTask(id);
    onTasksChange();
  };

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const getPriorityBadge = (p: Priority) => {
    const classes = {
      P0: 'priority-high',
      P1: 'priority-medium',
      P2: 'priority-low',
    };
    const labels = { P0: 'High', P1: 'Medium', P2: 'Low' };
    return <span className={`priority-badge ${classes[p]}`}>{labels[p]}</span>;
  };

  const sortedOpenTasks = [...openTasks].sort((a, b) => {
    const order = { P0: 0, P1: 1, P2: 2 };
    const priorityDiff = order[a.priority] - order[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Add Task Section */}
      <div className="p-4 border-b border-border">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="action-button action-button-primary w-full"
          >
            <Plus className="w-4 h-4" />
            Save Current Page
          </button>
        ) : (
          <div className="space-y-3 animate-fade-in-up">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium text-foreground truncate">
                {getPageInfo().title}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {getPageInfo().url}
              </p>
            </div>

            {/* Priority Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Priority
              </label>
              <div className="flex gap-2">
                {(['P0', 'P1', 'P2'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      priority === p
                        ? p === 'P0'
                          ? 'bg-destructive text-destructive-foreground'
                          : p === 'P1'
                          ? 'bg-warning text-warning-foreground'
                          : 'bg-success text-success-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {p === 'P0' ? 'High' : p === 'P1' ? 'Medium' : 'Low'}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                What needs to be done?
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this task..."
                className="textarea-field h-20"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Due Date (optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="action-button action-button-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="action-button action-button-primary flex-1"
              >
                Save Task
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {sortedOpenTasks.length === 0 && doneTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No tasks yet</h3>
            <p className="text-sm text-muted-foreground">
              Save pages you want to return to later
            </p>
          </div>
        ) : (
          <>
            {sortedOpenTasks.length > 0 && (
              <div>
                <h3 className="category-header mb-3">
                  Open ({sortedOpenTasks.length})
                </h3>
                <div className="space-y-2">
                  {sortedOpenTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={() => handleToggleStatus(task)}
                      onDelete={() => handleDelete(task.id)}
                      onOpen={() => handleOpenUrl(task.url)}
                      getPriorityBadge={getPriorityBadge}
                    />
                  ))}
                </div>
              </div>
            )}

            {doneTasks.length > 0 && (
              <div className="mt-6">
                <h3 className="category-header mb-3">
                  Completed ({doneTasks.length})
                </h3>
                <div className="space-y-2">
                  {doneTasks.slice(0, 5).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={() => handleToggleStatus(task)}
                      onDelete={() => handleDelete(task.id)}
                      onOpen={() => handleOpenUrl(task.url)}
                      getPriorityBadge={getPriorityBadge}
                      isDone
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onOpen: () => void;
  getPriorityBadge: (p: Priority) => JSX.Element;
  isDone?: boolean;
}

const TaskCard = ({ task, onToggle, onDelete, onOpen, getPriorityBadge, isDone }: TaskCardProps) => {
  return (
    <div className={`task-card animate-fade-in-up ${isDone ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            isDone
              ? 'bg-success border-success text-success-foreground'
              : 'border-border hover:border-primary'
          }`}
        >
          {isDone && <Check className="w-3 h-3" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getPriorityBadge(task.priority)}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          <h4 className={`text-sm font-medium mb-1 ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.title}
          </h4>

          {task.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {task.notes}
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onOpen}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { CheckSquare } from 'lucide-react';
