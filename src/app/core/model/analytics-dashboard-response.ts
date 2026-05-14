export interface AnalyticsDashboardResponse {
    metrics: {
    totalActivities: number;
    completionRate: number;
    activeUsers: number;
    avgCompletionDays: number;
    changes: {
      totalActivities: number;
      completionRate: number;
      activeUsers: number;
      avgCompletionDays: number;
    };
  };
  activityTrend: {
    month: string;
    created: number;
    completed: number;
  }[];
  statusDistribution: {
    completed: number;
    inProgress: number;
    pending: number;
  };
  teamPerformance: {
    userName: string;
    completed: number;
    total: number;
  }[];
  categoryBreakdown: {
    category: string;
    count: number;
    change: number;
  }[];
  recentActivities: {
    activity: string;
    type: string;
    user: string;
    status: string;
    date: string;
    duration: string;
  }[];
}
