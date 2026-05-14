import { DashboardRecentActivityDto } from "./dashboard-recent-activity-dto";
import { PagedResponse } from "./paged-response";
import { StatCardDto } from "./stat-card-dto";
import { TimelinePointDto } from "./timeline-point-dto";
import { UpcomingTaskDto } from "./upcoming-task-dto";

export interface DashboardResponse {
  stats:            StatCardDto[];
  timeline:         TimelinePointDto[];
  recentActivities: PagedResponse<DashboardRecentActivityDto>;
  upcomingTasks:    PagedResponse<UpcomingTaskDto> | null;
}