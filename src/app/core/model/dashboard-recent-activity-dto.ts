import { AssigneeAvatarDto } from "./assignee-avatar-dto";

export interface DashboardRecentActivityDto {
  id:           string;
  title:        string;
  categoryName: string | null;
  status:       string;
  createdAt:    string;       // ISO datetime
  completedAt:  string | null // ISO date
  assignees:    AssigneeAvatarDto[];
}
