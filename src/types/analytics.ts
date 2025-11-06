export interface DailyStats {
  date: string;
  completedTasks: number;
  totalPomodoros: number;
  focusTime: number; // minutos
  interruptions: number;
  productivityScore: number;
}

export interface WeeklyStats {
  dailyStats: DailyStats[];
  totalFocusTime: number;
  maxDailyFocusTime: number;
  topCategories: CategoryStats[];
  averageProductivityScore: number;
}

export interface CategoryStats {
  category: string;
  taskCount: number;
  focusTime: number;
  completionRate: number;
}

export interface ProductivityPatterns {
  peakProductivityHours: number[];
  averageSessionLength: number;
  completionRate: number;
  mostProductiveDay: string;
}

export interface DashboardData {
  today: DailyStats & {
    totalTasks: number;
  };
  week: WeeklyStats;
  patterns: ProductivityPatterns;
  insights: {
    suggestions: string[];
  };
}

export interface DateRange {
  start: Date;
  end: Date;
}

