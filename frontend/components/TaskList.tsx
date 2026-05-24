'use client';

import type { Task } from '@/lib/api';
import { vibeBadgeColor, vibeLabel } from '@/lib/api';

interface Props {
  tasks: Task[];
}

export default function TaskList({ tasks }: Props) {
  if (tasks.length === 0) {
    return (
      <div
        data-testid="empty-state"
        className="text-center py-12 text-slate-500 italic"
      >
        No tasks yet. Add one above to check the vibe.
      </div>
    );
  }

  return (
    <ul data-testid="task-list" className="space-y-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          data-testid={`task-${task.id}`}
          className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 truncate">{task.title}</p>
            <p className="text-sm text-slate-500">
              {task.estimated_hours} h estimated
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 ml-4">
            <span
              data-testid={`score-${task.id}`}
              className={`px-3 py-1 rounded-full text-sm font-semibold ${vibeBadgeColor(
                task.vibe_score
              )}`}
            >
              {task.vibe_score}
            </span>
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {vibeLabel(task.vibe_score)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
