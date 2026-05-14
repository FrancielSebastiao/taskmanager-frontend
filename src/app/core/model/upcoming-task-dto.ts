import { AssigneeAvatarDto } from "./assignee-avatar-dto";

export interface UpcomingTaskDto {
  id:              string;
  title:           string;
  dueDate:         string;    // ISO date
  status:          string;
  priority:        string;
  progressPercent: number;
  assignees:       AssigneeAvatarDto[];
}
