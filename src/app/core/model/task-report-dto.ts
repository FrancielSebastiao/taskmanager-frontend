export interface TaskReportDto {
    title: string;
    category: string;
    status: string;
    priority: string;
    dueDate: string;
    completedAt: string | null;
    progressPercent: number;
    overdue: boolean;
}
