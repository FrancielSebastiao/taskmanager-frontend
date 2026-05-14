import { ActivityDto } from "./activity-dto";
import { PagedResponse } from "./paged-response";
import { ProjectFileDto } from "./project-file-dto";
import { TaskBreakdownDto } from "./task-breakdown-dto";
import { TaskSummaryDto } from "./task-summary-dto";
import { Team } from "./team";
import { TeamMemberDetailDto } from "./team-member-detail-dto";

export interface ProjectDetailResponse {
    id: string;
    name: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    progress: number;
    startDate: string;
    deadline: string;
    budget: number;
    spent: number;
    iconBgClass: string;
    iconColorClass: string;
    tasks: TaskBreakdownDto;
    manager: Team;
    // Paginados separadamente
    recentTasks: PagedResponse<TaskSummaryDto>;
    recentActivities: PagedResponse<ActivityDto>;
    teamMembers: PagedResponse<TeamMemberDetailDto>;
    files: PagedResponse<ProjectFileDto>;
}
