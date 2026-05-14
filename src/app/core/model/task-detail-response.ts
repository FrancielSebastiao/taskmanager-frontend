import { AssigneeDetailDto } from "./assignee-detail-dto";
import { PagedResponse } from "./paged-response";
import { TaskActivityDto } from "./task-activity-dto";
import { TaskCommentDetailDto } from "./task-comment-detail-dto";
import { TaskFileDto } from "./task-file-dto";
import { TaskImageDto } from "./task-image-dto";
import { Team } from "./team";

export interface TaskDetailResponse {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    categoryName: string;
    progressPercent: number;
    dueDate: string;
    dueDateRelative: string;
    createdAt: string;
    estimatedHours: number;
    projectName: string;
    projectId: string;
    createdBy: Team;
    assignees: PagedResponse<AssigneeDetailDto>;
    images: PagedResponse<TaskImageDto>;
    attachments: PagedResponse<TaskFileDto>;
    comments: PagedResponse<TaskCommentDetailDto>;
    activityLog: PagedResponse<TaskActivityDto>;
}
