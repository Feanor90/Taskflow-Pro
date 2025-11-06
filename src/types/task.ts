import { Database } from './database';

export type Task = Database['public']['Tables']['tasks']['Row'];
export type CreateTaskInput = Database['public']['Tables']['tasks']['Insert'];
export type UpdateTaskInput = Database['public']['Tables']['tasks']['Update'];

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'work' | 'personal' | 'study' | 'health';

export interface TaskFilters {
  category?: TaskCategory;
  priority?: TaskPriority;
  completed?: boolean;
  search?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  byCategory: Record<TaskCategory, number>;
  byPriority: Record<TaskPriority, number>;
}

