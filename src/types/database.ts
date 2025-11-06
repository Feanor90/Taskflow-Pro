export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          category: 'work' | 'personal' | 'study' | 'health';
          estimated_pomodoros: number;
          actual_pomodoros: number;
          completed: boolean;
          completed_at: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          category?: 'work' | 'personal' | 'study' | 'health';
          estimated_pomodoros?: number;
          actual_pomodoros?: number;
          completed?: boolean;
          completed_at?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          category?: 'work' | 'personal' | 'study' | 'health';
          estimated_pomodoros?: number;
          actual_pomodoros?: number;
          completed?: boolean;
          completed_at?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      pomodoro_sessions: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          type: 'pomodoro' | 'short_break' | 'long_break';
          start_time: string;
          end_time: string | null;
          duration: number;
          completed: boolean;
          interruptions: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          type: 'pomodoro' | 'short_break' | 'long_break';
          start_time: string;
          end_time?: string | null;
          duration: number;
          completed?: boolean;
          interruptions?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string | null;
          type?: 'pomodoro' | 'short_break' | 'long_break';
          start_time?: string;
          end_time?: string | null;
          duration?: number;
          completed?: boolean;
          interruptions?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      productivity_metrics: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          total_pomodoros: number;
          completed_tasks: number;
          focus_time: number;
          interruptions: number;
          productivity_score: number;
          peak_hours: number[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          total_pomodoros?: number;
          completed_tasks?: number;
          focus_time?: number;
          interruptions?: number;
          productivity_score?: number;
          peak_hours?: number[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          total_pomodoros?: number;
          completed_tasks?: number;
          focus_time?: number;
          interruptions?: number;
          productivity_score?: number;
          peak_hours?: number[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

