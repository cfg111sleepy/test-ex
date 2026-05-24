'use client';

import { useEffect, useState } from 'react';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import { fetchTasks, type Task } from '@/lib/api';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Optimistic-style update — no full page refresh
  const handleTaskCreated = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          VibeCheck Dashboard
        </h1>
        <p className="text-slate-600 mt-1">
          Log what you&apos;re working on and instantly check the vibe.
        </p>
      </header>

      <section className="mb-8">
        <TaskForm onTaskCreated={handleTaskCreated} />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Tasks ({tasks.length})
        </h2>
        {loading && <p className="text-slate-500">Loading...</p>}
        {loadError && (
          <p className="text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            Could not load tasks: {loadError}
          </p>
        )}
        {!loading && !loadError && <TaskList tasks={tasks} />}
      </section>
    </main>
  );
}
