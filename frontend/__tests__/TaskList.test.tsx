import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskList from '@/components/TaskList';
import type { Task } from '@/lib/api';

const sampleTasks: Task[] = [
  {
    id: 1,
    title: 'Write unit tests',
    estimated_hours: 2,
    vibe_score: 3.5,
    created_at: '2026-05-24T10:00:00Z',
  },
  {
    id: 2,
    title: 'Refactor legacy module',
    estimated_hours: 8,
    vibe_score: 12.7,
    created_at: '2026-05-24T11:00:00Z',
  },
];

describe('TaskList', () => {
  it('renders empty state when no tasks', () => {
    render(<TaskList tasks={[]} />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('renders each task with title, hours and score', () => {
    render(<TaskList tasks={sampleTasks} />);

    expect(screen.getByText('Write unit tests')).toBeInTheDocument();
    expect(screen.getByText('Refactor legacy module')).toBeInTheDocument();
    expect(screen.getByText('2 h estimated')).toBeInTheDocument();
    expect(screen.getByText('8 h estimated')).toBeInTheDocument();

    expect(screen.getByTestId('score-1')).toHaveTextContent('3.5');
    expect(screen.getByTestId('score-2')).toHaveTextContent('12.7');
  });

  it('applies different vibe labels based on score', () => {
    render(<TaskList tasks={sampleTasks} />);
    // 3.5 < 5 → Chill
    expect(screen.getByText('Chill')).toBeInTheDocument();
    // 12.7 ∈ [5, 15) → Spicy
    expect(screen.getByText('Spicy')).toBeInTheDocument();
  });
});
