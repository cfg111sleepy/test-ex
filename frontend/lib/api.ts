export interface Task {
  id: number;
  title: string;
  estimated_hours: number;
  vibe_score: number;
  created_at: string;
}

export interface TaskCreatePayload {
  title: string;
  estimated_hours: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`);
  return res.json();
}

export async function createTask(payload: TaskCreatePayload): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    const msg = Array.isArray(detail.detail)
      ? detail.detail.map((d: any) => d.msg).join(', ')
      : detail.detail || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

export function vibeBadgeColor(score: number): string {
  if (score < 5) return 'bg-vibe-low text-white';
  if (score < 15) return 'bg-vibe-mid text-white';
  return 'bg-vibe-high text-white';
}

export function vibeLabel(score: number): string {
  if (score < 5) return 'Chill';
  if (score < 15) return 'Spicy';
  return 'Inferno';
}
