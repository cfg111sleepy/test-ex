'use client';

import { useState, FormEvent } from 'react';
import { createTask, type Task } from '@/lib/api';

interface Props {
  onTaskCreated: (task: Task) => void;
}

export default function TaskForm({ onTaskCreated }: Props) {
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedHours = parseFloat(hours);
    if (!title.trim()) {
      setError('Task name cannot be empty');
      return;
    }
    if (Number.isNaN(parsedHours) || parsedHours <= 0) {
      setError('Estimated hours must be a positive number');
      return;
    }

    setSubmitting(true);
    try {
      const task = await createTask({
        title: title.trim(),
        estimated_hours: parsedHours,
      });
      onTaskCreated(task);
      setTitle('');
      setHours('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="task-form"
      className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4"
    >
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Task Name
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Fix urgent login bug"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="hours"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Estimated Hours
        </label>
        <input
          id="hours"
          type="number"
          step="0.25"
          min="0"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="2.5"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {error && (
        <p
          data-testid="form-error"
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2 px-4 rounded-md transition"
      >
        {submitting ? 'Calculating vibe...' : 'Check the Vibe'}
      </button>
    </form>
  );
}
