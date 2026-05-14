export interface TaskSummaryDto {
    id: string;
    name: string;
    completed: boolean;
    assigneeInitials: string;
    assigneeColor: string;
    dueDateRelative: string;
    priority: string;
}
